import os
import sys
import sqlite3
import logging
import json
from typing import List, Dict

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ajouter le chemin du backend pour les imports
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from boutique_descriptions import generer_description_seo
from marketplace_db import DB_PATH, mettre_a_jour_produit

class SEOAgent:
    """
    Agent responsable de l'optimisation SEO des produits.
    Il scanne la base de données pour les produits sans description SEO
    et les génère automatiquement.
    """
    
    def __init__(self):
        self.db_path = DB_PATH

    def run(self, limit: int = 5) -> Dict:
        """
        Exécute l'agent SEO.
        
        Args:
            limit: Nombre maximum de produits à traiter en une fois
            
        Returns:
            Rapport d'exécution
        """
        logger.info(f"🚀 Démarrage de l'Agent SEO (Limit: {limit})")
        
        products = self._get_products_needing_seo(limit)
        
        if not products:
            logger.info("✅ Aucun produit ne nécessite d'optimisation SEO.")
            return {
                "status": "success",
                "message": "Aucun produit à traiter",
                "processed_count": 0
            }
            
        processed_count = 0
        results = []
        
        for product in products:
            try:
                logger.info(f"📝 Traitement du produit: {product['nom']}")
                
                # Générer la description SEO
                description_data = generer_description_seo(product)
                
                # Mettre à jour le produit
                product_id = product['product_id']
                success = mettre_a_jour_produit(
                    product_id=product_id,
                    produit=product, # On repasse le produit original car requis par la signature, même si redondant pour certaines updates
                    description_seo=description_data
                )
                
                if success:
                    processed_count += 1
                    results.append({
                        "product_id": product_id,
                        "status": "updated",
                        "nom": product['nom']
                    })
                else:
                    results.append({
                        "product_id": product_id,
                        "status": "failed_update",
                        "nom": product['nom']
                    })
                    
            except Exception as e:
                logger.error(f"❌ Erreur sur produit {product.get('product_id')}: {str(e)}")
                results.append({
                    "product_id": product.get("product_id"),
                    "status": "error",
                    "error": str(e)
                })
                
        return {
            "status": "success",
            "processed_count": processed_count,
            "details": results
        }

    def _get_products_needing_seo(self, limit: int) -> List[Dict]:
        """Récupère les produits qui n'ont pas de description SEO."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row # Pour accès par nom de colonne
        cursor = conn.cursor()
        
        try:
            # Critères: status active, et (description_seo est NULL ou vide)
            query = """
                SELECT * FROM produits_marketplace 
                WHERE status = 'active' 
                AND (description_seo IS NULL OR description_seo = '')
                ORDER BY created_at DESC
                LIMIT ?
            """
            cursor.execute(query, (limit,))
            rows = cursor.fetchall()
            
            products = []
            for row in rows:
                products.append(dict(row))
                
            return products
            
        except Exception as e:
            logger.error(f"Erreur DB: {e}")
            return []
        finally:
            conn.close()

if __name__ == "__main__":
    agent = SEOAgent()
    print(agent.run())
