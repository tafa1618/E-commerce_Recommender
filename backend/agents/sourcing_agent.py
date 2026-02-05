import os
import sys
import logging
import csv
import json
import random
from typing import List, Dict
import asyncio

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ajouter le chemin du backend pour les imports
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from jumia_scraper import scraper_jumia_recherche
from marketplace_db import DB_PATH
import sqlite3

class SourcingAgent:
    """
    Agent Sourcing (BoumMarket Replica / Sales History).
    1. Lit les produits "Gagnants" depuis un CSV d'historique.
    2. Cherche des équivalents sur Jumia.
    3. Vérifie la tendance (Google Trends - Simulation).
    4. Enregistre en 'draft' pour validation humaine.
    """
    
    def __init__(self, csv_path: str = None):
        if csv_path:
            self.csv_path = csv_path
        else:
            # Par défaut cherche le fichier wordpress détecté
            self.csv_path = os.path.join(os.path.dirname(backend_dir), "produits_wordpress.csv")
            
    def _get_history_best_sellers(self, limit: int = 5) -> List[Dict]:
        """Lit le CSV et retourne les produits prioritaires."""
        products = []
        if not os.path.exists(self.csv_path):
            logger.error(f"Fichier CSV introuvable: {self.csv_path}")
            return []
            
        try:
            with open(self.csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Nettoyage et normalisation
                    name = row.get('Name', row.get('nom', ''))
                    if name:
                        products.append({
                            "name": name,
                            "target_price": row.get('Regular price', row.get('prix', 0))
                        })
                        if len(products) >= limit:
                            break
        except Exception as e:
            logger.error(f"Erreur lecture CSV: {e}")
            
        return products

    def _check_google_trends(self, keyword: str) -> Dict:
        """
        Simule une vérification Google Trends.
        Retourne un score de 0 à 100.
        """
        # Simulation (Mock) pour l'instant
        # Dans un vrai cas, on utiliserait pytrends
        score = random.randint(10, 100)
        status = "Faible"
        if score > 70: status = "Très Populaire"
        elif score > 40: status = "Moyen"
        
        return {"score": score, "status": status}

    def _save_draft_product(self, product_data: Dict) -> bool:
        """Sauvegarde le produit en statut 'draft' dans la base SQLite."""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Vérifier si existe déjà (par nom approximatif ou id)
            # Ici on simplifie en insérant un nouveau
            
            features = {
                "sourcing_source": "History CSV",
                "original_search_term": product_data.get('search_term'),
                "google_trends": product_data.get('trends'),
                "competitor_data": product_data.get('competitor')
            }
            
            product_id = f"draft_{int(asyncio.get_event_loop().time() * 1000)}_{random.randint(100,999)}"
            
            cursor.execute("""
                INSERT INTO produits_marketplace (
                    product_id, nom, prix, image, lien, source, 
                    status, features_json, validation_score, description_seo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                product_id,
                product_data['name'],
                product_data['price'],
                product_data['image'],
                product_data['link'],
                "Sourcing Agent - Jumia",
                "draft", # STATUT IMPORTANT
                json.dumps(features),
                product_data['trends']['score'],
                "Description en attente de validation..."
            ))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Erreur sauvegarde draft: {e}")
            return False

    def run(self, limit: int = 5) -> Dict:
        """Exécute le pipeline de sourcing."""
        logger.info(f"🚀 Démarrage Sourcing Agent (Source: {self.csv_path})")
        
        # 1. Lire historique
        targets = self._get_history_best_sellers(limit=limit)
        if not targets:
            return {"status": "error", "message": "Aucun produit trouvé dans l'historique CSV."}
            
        results = []
        
        # 2. Processus Sourcing
        for target in targets:
            term = target['name']
            logger.info(f"🔎 Recherche sourcing pour : {term}")
            
            # Recherche Jumia
            jumia_hits = scraper_jumia_recherche(terme=term, limit=1)
            
            if jumia_hits:
                hit = jumia_hits[0]
                
                # Check Trends
                trends = self._check_google_trends(term)
                
                if trends['score'] < 20:
                    logger.warning(f"⚠️ Tendance faible pour {term} ({trends['score']}), ignoré.")
                    continue
                    
                product_data = {
                    "name": hit['nom'],
                    "price": hit['prix'],
                    "image": hit['image'],
                    "link": hit['lien'],
                    "search_term": term,
                    "trends": trends,
                    "competitor": "Jumia"
                }
                
                # Sauvegarde Draft
                if self._save_draft_product(product_data):
                    results.append(product_data)
                    logger.info(f"✅ Draft créé pour : {hit['nom']}")
            else:
                logger.info(f"❌ Aucun résultat Jumia pour {term}")
                
        return {
            "status": "success",
            "scanned": len(targets),
            "drafts_created": len(results),
            "products": results
        }

if __name__ == "__main__":
    agent = SourcingAgent()
    print(json.dumps(agent.run(limit=3), indent=2))
