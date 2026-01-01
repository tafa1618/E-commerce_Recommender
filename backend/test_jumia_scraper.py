"""Test du scraper Jumia"""
from jumia_scraper import scraper_jumia_best_sellers

print("Test du scraper Jumia...")
print("=" * 60)

try:
    produits = scraper_jumia_best_sellers(limit=5)
    print(f"\nProduits trouves: {len(produits)}\n")
    
    for i, p in enumerate(produits[:3], 1):
        print(f"{i}. {p['nom'][:60]}...")
        print(f"   Prix: {p['prix_texte']}")
        print(f"   Lien: {p['lien'][:80]}...")
        print()
    
    print("Test reussi!")
except Exception as e:
    print(f"Erreur: {str(e)}")
    import traceback
    traceback.print_exc()

