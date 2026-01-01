"""
Script batch pour scraper Alibaba et sauvegarder dans la DB
Permet de lancer des scrapings en masse pour économiser sur Apify
"""
import sys
import os
from typing import List, Dict

# Ajouter le répertoire parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from alibaba_apify import search_products_apify
from database import save_products_to_db, init_database, get_all_cached_searches, clear_expired_cache

# Liste des recherches à effectuer
SEARCHES = [
    # Recherches par mot-clé
    {"type": "keyword", "valeur": "smartphone", "limit": 50},
    {"type": "keyword", "valeur": "laptop", "limit": 50},
    {"type": "keyword", "valeur": "t-shirt", "limit": 50},
    {"type": "keyword", "valeur": "headphones", "limit": 50},
    {"type": "keyword", "valeur": "watch", "limit": 50},
    
    # Recherches par catégorie
    {"type": "category", "valeur": "electronics", "limit": 50},
    {"type": "category", "valeur": "apparel", "limit": 50},
    {"type": "category", "valeur": "home-garden", "limit": 50},
    
    # Recherche générale (meilleures ventes)
    {"type": "general", "valeur": "", "limit": 100},
]


def run_batch_scraping():
    """
    Lance un batch de scrapings et sauvegarde tout dans la DB.
    """
    print("=" * 60)
    print("🚀 BATCH SCRAPING ALIBABA")
    print("=" * 60)
    print()
    
    # Nettoyer le cache expiré
    print("🧹 Nettoyage du cache expiré...")
    clear_expired_cache()
    print()
    
    # Vérifier les recherches déjà en cache
    cached = get_all_cached_searches()
    print(f"📦 Recherches déjà en cache: {len(cached)}")
    for cache in cached:
        print(f"   - {cache['type']}={cache['valeur']} ({cache['nombre_produits']} produits)")
    print()
    
    total_scraped = 0
    total_saved = 0
    errors = []
    
    for i, search in enumerate(SEARCHES, 1):
        search_type = search["type"]
        search_value = search["valeur"]
        limit = search["limit"]
        
        print(f"[{i}/{len(SEARCHES)}] Scraping: {search_type}={search_value} (limit: {limit})")
        print("-" * 60)
        
        try:
            # Lancer le scraping Apify
            if search_type == "keyword":
                produits = search_products_apify(keyword=search_value, limit=limit)
            elif search_type == "category":
                produits = search_products_apify(category=search_value, limit=limit)
            else:  # general
                produits = search_products_apify(keyword="", limit=limit)
            
            # Sauvegarder dans la DB
            save_products_to_db(produits, search_type, search_value)
            
            total_scraped += len(produits)
            total_saved += len(produits)
            
            print(f"✅ {len(produits)} produits scrapés et sauvegardés")
            
        except ValueError as e:
            error_msg = f"Token Apify non configuré: {e}"
            print(f"❌ {error_msg}")
            errors.append(f"{search_type}={search_value}: {error_msg}")
        except Exception as e:
            error_msg = f"Erreur: {e}"
            print(f"❌ {error_msg}")
            errors.append(f"{search_type}={search_value}: {error_msg}")
        
        print()
    
    # Résumé
    print("=" * 60)
    print("📊 RÉSUMÉ")
    print("=" * 60)
    print(f"✅ Produits scrapés: {total_scraped}")
    print(f"💾 Produits sauvegardés: {total_saved}")
    print(f"❌ Erreurs: {len(errors)}")
    
    if errors:
        print("\n⚠️ Erreurs rencontrées:")
        for error in errors:
            print(f"   - {error}")
    
    print()
    print("💡 Les produits sont maintenant en cache dans la DB")
    print("💡 L'API utilisera le cache au lieu de lancer de nouveaux scrapings")
    print("=" * 60)


if __name__ == "__main__":
    # Initialiser la DB
    init_database()
    
    # Lancer le batch
    run_batch_scraping()

