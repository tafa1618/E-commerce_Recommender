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

from marketing import generer_descriptif_marketing, sauvegarder_campagne
from marketplace_db import DB_PATH

class MarketingAgent:
    """
    Agent Marketing.
    Crée automatiquement des campagnes pub pour les produits identifiés comme "Opportunité"
    (ex: prix inférieur à la concurrence).
    """
    
    def __init__(self):
        self.db_path = DB_PATH

    def run_auto_campaign(self) -> Dict:
        """
        Génère automatiquement une campagne pour les produits "Moins Cher".
        """
        logger.info("🚀 Démarrage de l'Agent Marketing (Auto-Campaign)")
        
        # 1. Trouver les produits "Moins cher que Jumia"
        products = self._get_cheaper_products()
        
        if not products:
            return {"status": "success", "message": "Aucun produit 'Moins Cher' trouvé pour une campagne.", "campaign_id": None}
            
        logger.info(f"🎯 {len(products)} produits ciblés pour la campagne.")
        
        # 2. Générer les descriptifs marketing
        descriptifs = []
        for p in products:
            # On veut un style "Vente Flash" / "Urgence"
            desc = generer_descriptif_marketing(p, style="attractif")
            descriptifs.append(desc)
            
        # 3. Créer la campagne
        nom_campagne = f"Campagne Automatique - {time.strftime('%Y-%m-%d')} - Ventes Flash"
        campaign_id = sauvegarder_campagne(nom_campagne, products, descriptifs)
        
        return {
            "status": "success",
            "message": f"Campagne '{nom_campagne}' créée avec {len(products)} produits.",
            "campaign_id": campaign_id,
            "products_count": len(products)
        }

    def _get_cheaper_products(self) -> List[Dict]:
        """Récupère les produits marqués comme 'less expensive' via l'analyse concurrentielle."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        try:
            # On cherche dans features_json où status = cheaper
            # Note: C'est une recherche texte simple dans le JSON, pas performant mais ok pour prototype
            cursor.execute("""
                SELECT * FROM produits_marketplace 
                WHERE status = 'active'
                AND features_json LIKE '%"status": "cheaper"%'
                ORDER BY validation_score DESC
                LIMIT 10
            """)
            rows = cursor.fetchall()
            products = []
            for row in rows:
                p = dict(row)
                try: p['features'] = json.loads(p['features_json']) if p['features_json'] else {}
                except: p['features'] = {}
                products.append(p)
            return products
        finally:
            conn.close()

if __name__ == "__main__":
    agent = MarketingAgent()
    print(agent.run_auto_campaign())
