import os
import sys
import logging
import json
import time
from typing import List, Dict

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ajouter le chemin du backend pour les imports
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from jumia_scraper import scraper_jumia_best_sellers
from alibaba_scraper import scraper_alibaba_recherche
from marketplace_db import DB_PATH

class DealHunterAgent:
    """
    Agent Deal Hunter (Arbitrage).
    Compare les prix locaux (Jumia) avec les prix source (Alibaba)
    pour identifier des opportunités à forte marge.
    """
    
    def __init__(self):
        self.shipping_estimate_per_kg = 10.0 # Estimation $10/kg
        
    def run(self, category: str = "toutes", limit: int = 5) -> Dict:
        """
        Exécute l'agent Deal Hunter.
        
        Args:
            category: Catégorie Jumia à scanner
            limit: Nombre de best-sellers Jumia à analyser
            
        Returns:
            Rapport d'opportunités
        """
        logger.info(f"🚀 Démarrage Deal Hunter (Cat: {category}, Limit: {limit})")
        
        # 1. Scanner Jumia (Local Market)
        logger.info("📡 Scanning Jumia Best Sellers...")
        target_cat = category if category != "toutes" else None
        jumia_products = scraper_jumia_best_sellers(limit=limit) # Note: scraper_jumia_best_sellers ignore category param inside, it's global best sellers. 
        # If we want category specific, we use scraper_jumia_categorie
        
        # Correction pour utiliser la catégorie si spécifiée
        if target_cat:
            from jumia_scraper import scraper_jumia_categorie
            jumia_products = scraper_jumia_categorie(target_cat, limit=limit)
            
        if not jumia_products:
             return {"status": "error", "message": "Aucun produit trouvé sur Jumia"}
             
        opportunities = []
        
        # 2. Scanner Alibaba (Source Market) pour chaque produit
        for jp in jumia_products:
            try:
                name = jp.get('nom', 'Inconnu')
                price_local = float(jp.get('prix', 0))
                
                if price_local <= 0: continue
                
                logger.info(f"🔎 Recherche source pour: {name} (Prix Local: {price_local})")
                
                # Chercher sur Alibaba
                alibaba_results = scraper_alibaba_recherche(terme=name, limit=3)
                
                if alibaba_results:
                    # Prendre le moins cher des résultats pertinents
                    # (Hypothèse simpliste: le premier est pertinent)
                    best_source = min(alibaba_results, key=lambda x: float(x.get('prix', float('inf'))) if x.get('prix') else float('inf'))
                    price_source = float(best_source.get('prix', 0))
                    
                    if price_source > 0:
                         # 3. Calculer la marge
                         # Estimer frais de port (forfaitaire 20% du prix source pour simplifier ou fixe)
                         landed_cost = price_source * 1.3 # +30% frais import/shipping
                         
                         margin_raw = price_local - landed_cost
                         margin_percent = (margin_raw / landed_cost) * 100
                         
                         status = "LOW"
                         if margin_percent > 100: status = "HIGH_OPPORTUNITY" # x2
                         elif margin_percent > 50: status = "GOOD"
                         
                         opportunities.append({
                             "product_name": name,
                             "local_price": price_local,
                             "source_price": price_source,
                             "landed_cost_est": round(landed_cost, 2),
                             "margin_raw": round(margin_raw, 2),
                             "margin_percent": round(margin_percent, 1),
                             "status": status,
                             "jumia_link": jp.get('lien'),
                             "alibaba_link": best_source.get('lien'),
                             "image": jp.get('image')
                         })
            except Exception as e:
                logger.error(f"Erreur analyse produit {jp.get('nom')}: {e}")
                
        # Trier par marge décroissante
        opportunities.sort(key=lambda x: x['margin_percent'], reverse=True)
        
        return {
            "status": "success",
            "scanned_count": len(jumia_products),
            "opportunities_found": len(opportunities),
            "top_opportunities": opportunities
        }

if __name__ == "__main__":
    agent = DealHunterAgent()
    print(json.dumps(agent.run(limit=3), indent=2))
