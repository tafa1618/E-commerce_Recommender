import os
import sys
import sqlite3
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

from jumia_scraper import scraper_jumia_recherche
from marketplace_db import DB_PATH, mettre_a_jour_produit

class PriceAgent:
    """
    Agent de veille tarifaire (Price Watch).
    Surveille les prix des concurrents (Jumia) pour nos produits.
    """
    
    def __init__(self):
        self.db_path = DB_PATH

    def run(self, limit: int = 5) -> Dict:
        """
        Exécute l'agent Price Watch.
        
        Args:
            limit: Nombre maximum de produits à traiter
            
        Returns:
            Rapport d'exécution
        """
        logger.info(f"🚀 Démarrage de l'Agent Price Watch (Limit: {limit})")
        
        # Récupérer les produits actifs
        products = self._get_active_products(limit)
        
        if not products:
            return {"status": "success", "message": "Aucun produit à analyser", "processed_count": 0}
            
        processed_count = 0
        results = []
        
        for product in products:
            try:
                logger.info(f"🔎 Analyse prix pour: {product['nom']}")
                
                # 1. Rechercher sur Jumia
                competitors = scraper_jumia_recherche(
                    terme=product['nom'],
                    limit=3,
                    use_fuzzy=True
                )
                
                competitor_data = None
                if competitors:
                    # Prendre le meilleur match (le premier souvent)
                    best_match = competitors[0]
                    competitor_data = {
                        "source": "Jumia",
                        "price": best_match.get('prix', 0),
                        "url": best_match.get('lien', ''),
                        "name": best_match.get('nom', ''),
                        "last_checked": time.strftime("%Y-%m-%d %H:%M:%S")
                    }
                
                # 2. Mettre à jour le produit avec les données concurrents
                if competitor_data:
                    # Charger features existantes
                    features = product.get('features', {})
                    if isinstance(features, str):
                         try: features = json.loads(features)
                         except: features = {}
                    
                    features['competitor_analysis'] = competitor_data
                    
                    # Calculer l'écart de prix
                    our_price = product.get('prix', 0)
                    comp_price = competitor_data['price']
                    
                    if our_price > 0 and comp_price > 0:
                        diff_percent = ((our_price - comp_price) / comp_price) * 100
                        features['competitor_analysis']['price_diff_percent'] = round(diff_percent, 2)
                        
                        if diff_percent < 0:
                            features['competitor_analysis']['status'] = "cheaper" # On est moins cher
                        elif diff_percent > 0:
                            features['competitor_analysis']['status'] = "expensive" # On est plus cher
                        else:
                            features['competitor_analysis']['status'] = "equal"
                    
                    # Sauvegarder
                    # Note: mettre_a_jour_produit attend features dans features_json, 
                    # mais ici on modifie l'objet produit directement pour le passer à la fonction
                    # ou on utilise json.dumps. 
                    # Regardons marketplace_db.py: mettre_a_jour_produit prend 'produit' dict et reconstruit features_json
                    # On va modifier le dict produit
                    
                    # On doit mettre à jour features_json dans le produit "original" stocké dans features... 
                    # C'est un peu complexe dans marketplace_db. 
                    # Simplifions: on met à jour produit['features_json'] ? 
                    # Non, mettre_a_jour_produit reconstruit features_json à partir de validation/niche/original_product
                    # IL NE PREND PAS DIRECTEMENT UN features_json arbitraire.
                    # Il faut modifier le code de marketplace_db ou tricher.
                    
                    # Workaround: On va utiliser une mise à jour SQL directe ici pour ne pas casser la logique complexe de validation/niche
                    # si on ne l'a pas.
                    
                    self._update_product_features(product['product_id'], features)
                    
                    processed_count += 1
                    results.append({
                        "product_id": product['product_id'],
                        "status": "updated",
                        "competitor_price": comp_price,
                        "diff": features['competitor_analysis'].get('price_diff_percent')
                    })
                else:
                    results.append({
                        "product_id": product['product_id'],
                        "status": "no_match"
                    })
                    
            except Exception as e:
                logger.error(f"❌ Erreur produit {product.get('nom')}: {e}")
                results.append({"product_id": product.get('product_id'), "status": "error", "error": str(e)})
                
        return {
            "status": "success", 
            "processed_count": processed_count,
            "details": results
        }

    def _get_active_products(self, limit: int) -> List[Dict]:
        """Récupère les produits actifs."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT * FROM produits_marketplace WHERE status = 'active' LIMIT ?", (limit,))
            rows = cursor.fetchall()
            products = []
            for row in rows:
                p = dict(row)
                # Parse features
                try: p['features'] = json.loads(p['features_json']) if p['features_json'] else {}
                except: p['features'] = {}
                products.append(p)
            return products
        finally:
            conn.close()

    def _update_product_features(self, product_id: str, features: Dict):
        """Mise à jour directe du JSON features."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            features_json = json.dumps(features, ensure_ascii=False)
            cursor.execute("UPDATE produits_marketplace SET features_json = ? WHERE product_id = ?", (features_json, product_id))
            conn.commit()
        finally:
            conn.close()

if __name__ == "__main__":
    agent = PriceAgent()
    print(agent.run())
