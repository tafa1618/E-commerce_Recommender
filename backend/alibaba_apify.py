"""
Intégration avec Apify pour scraper Alibaba
Scraper Apify: https://apify.com/piotrv1001/alibaba-listings-scraper
Documentation: https://docs.apify.com/
"""
import requests
import time
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration Apify
APIFY_API_BASE_URL = "https://api.apify.com/v2"
APIFY_TOKEN = os.getenv("APIFY_TOKEN", "")
APIFY_ACTOR_ID = "piotrv1001/alibaba-listings-scraper"  # ID du scraper Alibaba sur Apify


def search_products_apify(
    keyword: str = "",
    category: str = "",
    limit: int = 20
) -> List[Dict]:
    """
    Recherche de produits Alibaba via Apify.
    
    Args:
        keyword: Mot-clé de recherche
        category: Catégorie (optionnel)
        limit: Nombre maximum de résultats
        
    Returns:
        Liste de produits
    """
    if not APIFY_TOKEN:
        raise ValueError(
            "Token Apify non configuré. "
            "Veuillez définir APIFY_TOKEN dans le fichier .env"
        )
    
    produits = []
    
    try:
        # 1. Lancer l'acteur Apify
        run_url = f"{APIFY_API_BASE_URL}/acts/{APIFY_ACTOR_ID}/runs"
        
        # Paramètres pour le scraper
        input_data = {
            "maxItems": limit,
        }
        
        if keyword:
            input_data["searchQuery"] = keyword
        if category:
            input_data["category"] = category
        
        headers = {
            "Authorization": f"Bearer {APIFY_TOKEN}",
            "Content-Type": "application/json"
        }
        
        print(f"🚀 Lancement du scraper Apify pour Alibaba...")
        print(f"   Recherche: {keyword or category or 'Général'}")
        print(f"   Limite: {limit}")
        
        # Lancer le run
        response = requests.post(
            run_url,
            json=input_data,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        
        run_data = response.json()
        run_id = run_data["data"]["id"]
        
        print(f"✅ Run Apify lancé: {run_id}")
        print(f"⏳ Attente des résultats...")
        
        # 2. Attendre que le run se termine
        status_url = f"{APIFY_API_BASE_URL}/actor-runs/{run_id}"
        max_wait_time = 300  # 5 minutes max
        start_time = time.time()
        
        while True:
            status_response = requests.get(status_url, headers=headers, timeout=30)
            status_response.raise_for_status()
            status_data = status_response.json()["data"]
            
            status = status_data["status"]
            
            if status == "SUCCEEDED":
                print("✅ Scraping terminé avec succès")
                break
            elif status == "FAILED":
                error = status_data.get("statusMessage", "Erreur inconnue")
                raise Exception(f"Le run Apify a échoué: {error}")
            elif status in ["ABORTED", "TIMED-OUT"]:
                raise Exception(f"Le run Apify a été {status.lower()}")
            
            # Vérifier le timeout
            if time.time() - start_time > max_wait_time:
                raise Exception("Timeout: Le scraping prend trop de temps")
            
            # Attendre avant de re-vérifier
            time.sleep(2)
        
        # 3. Récupérer les résultats
        dataset_id = status_data["defaultDatasetId"]
        dataset_url = f"{APIFY_API_BASE_URL}/datasets/{dataset_id}/items"
        
        results_response = requests.get(dataset_url, headers=headers, timeout=30)
        results_response.raise_for_status()
        results = results_response.json()
        
        print(f"📦 {len(results)} résultats récupérés depuis Apify")
        
        # 4. Convertir les résultats au format attendu
        for item in results[:limit]:
            produit = {
                "nom": item.get("title", "Produit sans nom"),
                "prix": float(item.get("price", {}).get("value", 0)) if isinstance(item.get("price"), dict) else float(item.get("price", 0)),
                "prix_texte": item.get("priceText", f"${item.get('price', {}).get('value', 0) if isinstance(item.get('price'), dict) else item.get('price', 0)}"),
                "lien": item.get("url", ""),
                "image": item.get("imageUrl", ""),
                "marque": item.get("brand", ""),
                "categorie": item.get("category", ""),
                "note": str(item.get("rating", "N/A")),
                "moq": item.get("moq", "N/A"),
                "source": "Alibaba (Apify)",
                "supplier": item.get("supplierName", ""),
                "discount": item.get("discount", ""),
            }
            produits.append(produit)
        
        print(f"✅ {len(produits)} produits convertis et prêts")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur requête Apify: {e}")
        raise
    except Exception as e:
        print(f"❌ Erreur Apify: {e}")
        raise
    
    return produits


def get_apify_status() -> Dict:
    """
    Vérifie le statut de la connexion Apify.
    
    Returns:
        Dictionnaire avec le statut
    """
    if not APIFY_TOKEN:
        return {
            "configured": False,
            "message": "Token Apify non configuré"
        }
    
    try:
        # Tester la connexion en récupérant les informations de l'utilisateur
        url = f"{APIFY_API_BASE_URL}/users/me"
        headers = {
            "Authorization": f"Bearer {APIFY_TOKEN}",
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        user_data = response.json()["data"]
        
        return {
            "configured": True,
            "message": "Connexion Apify OK",
            "username": user_data.get("username", ""),
            "plan": user_data.get("plan", {}).get("name", "")
        }
    except Exception as e:
        return {
            "configured": False,
            "message": f"Erreur connexion Apify: {str(e)}"
        }
