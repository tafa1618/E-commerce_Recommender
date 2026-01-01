"""
Script pour tester et voir la structure JSON renvoyée par Apify
"""
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from alibaba_apify import search_products_apify

print("Test de la structure JSON Apify...")
print("=" * 60)

try:
    # Tester avec une recherche simple
    produits = search_products_apify(keyword="smartphone", limit=2)
    
    print(f"\nNombre de produits: {len(produits)}")
    
    if produits:
        print("\n" + "=" * 60)
        print("STRUCTURE JSON DU PREMIER PRODUIT:")
        print("=" * 60)
        print(json.dumps(produits[0], indent=2, ensure_ascii=False))
        
        print("\n" + "=" * 60)
        print("CHAMPS DISPONIBLES:")
        print("=" * 60)
        for key, value in produits[0].items():
            print(f"  {key}: {type(value).__name__} = {str(value)[:100]}")
    else:
        print("Aucun produit trouvé")
        
except Exception as e:
    print(f"Erreur: {e}")
    import traceback
    traceback.print_exc()

