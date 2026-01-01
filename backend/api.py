"""
API FastAPI pour l'analyse de produits e-commerce
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
import sys
import os
import re

# Ajouter le répertoire parent au path pour importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai import analyse_produit
from csv_generator import generate_csv
from jumia_scraper import scraper_jumia_best_sellers, scraper_jumia_categorie, scraper_jumia_recherche

# Import Alibaba - Essayer Apify d'abord, sinon fallback sur scraper
from alibaba_scraper import scraper_alibaba_best_sellers, scraper_alibaba_categorie, scraper_alibaba_recherche

# Import système de cache DB
from database import get_products_from_db, save_products_to_db, init_database

try:
    from alibaba_apify import search_products_apify
    ALIBABA_APIFY_AVAILABLE = True
except ImportError:
    ALIBABA_APIFY_AVAILABLE = False
    print("⚠️ Module alibaba_apify non disponible, utilisation du scraper uniquement")

# Initialiser la DB au démarrage
init_database()

# Import depuis le même répertoire (backend)
from boutique_csv import generate_boutique_csv_wordpress, generate_boutique_csv_shopify
from marketing import generer_descriptif_marketing, generer_descriptifs_batch, sauvegarder_campagne, get_campagnes

app = FastAPI(title="E-commerce Recommender API", version="1.0.0")

# Configuration CORS pour permettre les requêtes depuis React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# MODÈLES PYDANTIC
# =========================
class AnalyseRequest(BaseModel):
    nom_produit: str
    lien: Optional[str] = None


class ProduitLookalike(BaseModel):
    nom: str
    description: str
    prix_recommande: float
    type: str


class AnalyseResponse(BaseModel):
    produit: str
    decision: str
    raison: str
    categorie: str
    produits_lookalike: List[ProduitLookalike]


class CSVRequest(BaseModel):
    produits: List[Dict]


class BoutiqueCSVRequest(BaseModel):
    produits: List[Dict]
    export_type: str = "wordpress"  # "wordpress" ou "shopify"


class MarketingDescriptionRequest(BaseModel):
    produit: Dict
    style: Optional[str] = "attractif"  # "attractif", "professionnel", "vendeur"


class MarketingBatchRequest(BaseModel):
    produits: List[Dict]
    style: Optional[str] = "attractif"


class CampaignRequest(BaseModel):
    nom_campagne: str
    produits: List[Dict]
    descriptifs: List[Dict]


# =========================
# ENDPOINTS
# =========================
@app.get("/")
async def root():
    """Endpoint de santé"""
    return {"message": "E-commerce Recommender API", "status": "running"}


@app.post("/api/analyse", response_model=AnalyseResponse)
async def analyser_produit(request: AnalyseRequest):
    """
    Analyse un produit et retourne des recommandations de produits complémentaires.
    
    Args:
        request: Requête contenant le nom du produit et optionnellement un lien
        
    Returns:
        Réponse contenant la décision, la raison et les produits recommandés
    """
    try:
        result = analyse_produit(request.nom_produit, request.lien)
        
        # Convertir les produits en modèles Pydantic
        produits_lookalike = [
            ProduitLookalike(**produit) 
            for produit in result.get("produits_lookalike", [])
        ]
        
        return AnalyseResponse(
            produit=result.get("produit", ""),
            decision=result.get("decision", "NO_GO"),
            raison=result.get("raison", ""),
            categorie=result.get("categorie", ""),
            produits_lookalike=produits_lookalike
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")


@app.post("/api/generate-csv")
async def generer_csv(request: CSVRequest):
    """
    Génère un fichier CSV à partir d'une liste de produits.
    
    Args:
        request: Requête contenant la liste des produits
        
    Returns:
        Fichier CSV téléchargeable
    """
    try:
        csv_file = generate_csv(request.produits)
        
        if not os.path.exists(csv_file):
            raise HTTPException(status_code=404, detail="Fichier CSV non trouvé")
        
        return FileResponse(
            csv_file,
            media_type="text/csv",
            filename=csv_file,
            headers={"Content-Disposition": f"attachment; filename={csv_file}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du CSV: {str(e)}")


@app.get("/api/categories")
async def get_categories():
    """
    Retourne la liste des catégories disponibles sur Jumia Sénégal.
    
    Returns:
        Liste des catégories avec leur nom et slug
    """
    categories = [
        {"slug": "", "nom": "🏠 Toutes catégories (Meilleures ventes)", "description": "Produits les plus populaires"},
        {"slug": "telephones-tablettes", "nom": "📱 Téléphones & Tablettes", "description": "Smartphones, tablettes et accessoires"},
        {"slug": "electronique", "nom": "📺 Électronique", "description": "TV, audio, gadgets électroniques"},
        {"slug": "maison-bureau-electromenager", "nom": "🏡 Maison & Électroménager", "description": "Électroménager, décoration, bureau"},
        {"slug": "beaute-hygiene-sante", "nom": "💄 Beauté & Hygiène", "description": "Cosmétiques, soins, parfums"},
        {"slug": "ordinateurs-accessoires-informatique", "nom": "💻 Informatique", "description": "Ordinateurs, accessoires, périphériques"},
        {"slug": "fashion-mode", "nom": "👗 Mode & Fashion", "description": "Vêtements, chaussures, accessoires mode"},
        {"slug": "maison-cuisine-jardin", "nom": "🍳 Maison & Cuisine", "description": "Cuisine, jardin, bricolage"},
        {"slug": "bebe-puericulture", "nom": "👶 Bébé & Puériculture", "description": "Articles pour bébés et enfants"},
        {"slug": "sports-loisirs", "nom": "⚽ Sports & Loisirs", "description": "Équipements sportifs, jeux, loisirs"},
        {"slug": "epiceries", "nom": "🛒 Épicerie", "description": "Alimentation, boissons, produits frais"},
    ]
    return {"categories": categories}


@app.get("/api/categories-alibaba")
async def get_categories_alibaba():
    """
    Retourne la liste des catégories disponibles sur Alibaba.
    
    Returns:
        Liste des catégories avec leur nom et slug
    """
    # Liste de catégories Alibaba
    categories = [
        {"slug": "", "nom": "🏠 Toutes catégories (Meilleures ventes)", "description": "Produits les plus populaires"},
        {"slug": "electronics", "nom": "📱 Électronique", "description": "Électronique, gadgets, accessoires"},
        {"slug": "home-garden", "nom": "🏡 Maison & Jardin", "description": "Décoration, mobilier, jardin"},
        {"slug": "apparel", "nom": "👗 Mode & Vêtements", "description": "Vêtements, chaussures, accessoires"},
        {"slug": "beauty-personal-care", "nom": "💄 Beauté & Soins", "description": "Cosmétiques, soins personnels"},
        {"slug": "computer-communication", "nom": "💻 Informatique & Communication", "description": "Ordinateurs, téléphones, accessoires"},
        {"slug": "sports-entertainment", "nom": "⚽ Sports & Divertissement", "description": "Équipements sportifs, jeux"},
        {"slug": "toys-hobbies", "nom": "🧸 Jouets & Loisirs", "description": "Jouets, hobbies, jeux"},
        {"slug": "automotive", "nom": "🚗 Automobile", "description": "Pièces auto, accessoires"},
        {"slug": "health-medical", "nom": "🏥 Santé & Médical", "description": "Équipements médicaux, santé"},
        {"slug": "machinery", "nom": "⚙️ Machines & Équipements", "description": "Machines industrielles, équipements"},
    ]
    return {"categories": categories}


@app.get("/api/veille-concurrentielle")
async def veille_concurrentielle(categorie: Optional[str] = None, terme: Optional[str] = None, limit: int = 20, tri: Optional[str] = "popularite"):
    """
    Endpoint de veille concurrentielle - Scrape les meilleurs articles Jumia.
    
    Args:
        categorie: Catégorie spécifique (optionnel, slug de la catégorie)
        terme: Terme de recherche (optionnel)
        limit: Nombre maximum de produits (défaut: 20)
        tri: Type de tri - "popularite" (défaut) ou "prix" ou "remise"
        
    Returns:
        Données de veille concurrentielle avec les produits scrapés
    """
    try:
        if terme and terme.strip():
            # Recherche par terme avec fuzzy search activé
            produits = scraper_jumia_recherche(terme.strip(), limit, use_fuzzy=True)
        elif categorie and categorie.strip():
            # Recherche par catégorie
            produits = scraper_jumia_categorie(categorie.strip(), limit)
        else:
            # Meilleures ventes
            produits = scraper_jumia_best_sellers(limit=limit)
        
        # Tri des produits selon le paramètre
        if tri == "prix":
            produits = sorted(produits, key=lambda x: x.get('prix', 0))
        elif tri == "remise":
            # Trier par remise (produits avec remise en premier, puis par pourcentage décroissant)
            def get_remise_value(produit):
                remise = produit.get('remise', '')
                if not remise:
                    return 0
                try:
                    # Enlever le % et convertir en float
                    return float(remise.replace('%', '').strip())
                except:
                    return 0
            
            produits = sorted(produits, key=lambda x: (
                0 if x.get('remise') else 1,  # Produits avec remise en premier
                -get_remise_value(x)  # Puis par remise décroissante
            ))
        # "popularite" est le tri par défaut (ordre d'apparition sur Jumia)
        
        # Nom de la catégorie ou terme pour l'affichage
        if terme and terme.strip():
            categorie_nom = terme.strip()
            message = f"Résultats de recherche Jumia - {categorie_nom}"
        elif categorie:
            categorie_nom = categorie.replace('-', ' ').title()
            message = f"Meilleurs articles Jumia - {categorie_nom}"
        else:
            categorie_nom = "Meilleures ventes"
            message = f"Meilleurs articles Jumia - {categorie_nom}"
        
        return {
            "message": message,
            "produits": produits,
            "nombre_produits": len(produits),
            "categorie": categorie or "toutes",
            "terme": terme or "",
            "tri": tri,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du scraping: {str(e)}")


@app.get("/api/veille-alibaba")
async def veille_alibaba(categorie: Optional[str] = None, terme: Optional[str] = None, limit: int = 20, tri: Optional[str] = "popularite"):
    """
    Endpoint de veille concurrentielle Alibaba - Utilise l'API officielle ou le scraper.
    
    Args:
        categorie: Catégorie spécifique (optionnel, ID ou slug de la catégorie)
        terme: Terme de recherche (optionnel)
        limit: Nombre maximum de produits (défaut: 20)
        tri: Type de tri - "popularite" (défaut) ou "prix" ou "moq"
        
    Returns:
        Données de veille concurrentielle avec les produits
    """
    try:
        # 1. Vérifier d'abord le cache DB (économise les appels Apify)
        recherche_type = ""
        recherche_valeur = ""
        
        if terme and terme.strip():
            recherche_type = "keyword"
            recherche_valeur = terme.strip()
        elif categorie and categorie.strip():
            recherche_type = "category"
            recherche_valeur = categorie.strip()
        else:
            recherche_type = "general"
            recherche_valeur = ""
        
        produits = get_products_from_db(recherche_type, recherche_valeur, limit)
        
        # 2. Si pas de cache, utiliser Apify ou scraper
        if not produits:
            print(f"💾 Cache vide, lancement d'un nouveau scraping...")
            
            if ALIBABA_APIFY_AVAILABLE:
                try:
                    if terme and terme.strip():
                        produits = search_products_apify(keyword=terme.strip(), limit=limit)
                    elif categorie and categorie.strip():
                        produits = search_products_apify(category=categorie.strip(), limit=limit)
                    else:
                        produits = search_products_apify(keyword="", limit=limit)
                    
                    # Sauvegarder dans le cache pour la prochaine fois
                    if produits:
                        save_products_to_db(produits, recherche_type, recherche_valeur)
                        print(f"💾 {len(produits)} produits sauvegardés dans le cache")
                    
                except ValueError as e:
                    # Token Apify non configuré, utiliser le scraper
                    print(f"⚠️ Apify non configuré: {e}")
                    print("💡 Utilisation du scraper en fallback")
                    if categorie and categorie.strip():
                        produits = scraper_alibaba_categorie(categorie.strip(), limit)
                    elif terme and terme.strip():
                        produits = scraper_alibaba_recherche(terme=terme.strip(), limit=limit)
                    else:
                        produits = scraper_alibaba_best_sellers(limit=limit)
                except Exception as e:
                    # Erreur Apify, utiliser le scraper en fallback
                    print(f"⚠️ Erreur Apify: {e}")
                    print("💡 Utilisation du scraper en fallback")
                    if categorie and categorie.strip():
                        produits = scraper_alibaba_categorie(categorie.strip(), limit)
                    elif terme and terme.strip():
                        produits = scraper_alibaba_recherche(terme=terme.strip(), limit=limit)
                    else:
                        produits = scraper_alibaba_best_sellers(limit=limit)
            else:
                # Utiliser le scraper si Apify n'est pas disponible
                if categorie and categorie.strip():
                    produits = scraper_alibaba_categorie(categorie.strip(), limit)
                elif terme and terme.strip():
                    produits = scraper_alibaba_recherche(terme=terme.strip(), limit=limit)
                else:
                    produits = scraper_alibaba_best_sellers(limit=limit)
        else:
            print(f"✅ Utilisation du cache (économise un appel Apify)")
        
        # Tri des produits selon le paramètre
        if tri == "prix":
            produits = sorted(produits, key=lambda x: x.get('prix', 0))
        elif tri == "moq":
            # Trier par MOQ (Minimum Order Quantity) - produits avec MOQ en premier
            def get_moq_value(produit):
                moq = produit.get('moq', '')
                if not moq:
                    return float('inf')  # Produits sans MOQ à la fin
                try:
                    # Extraire le nombre du MOQ
                    moq_match = re.search(r'(\d+)', moq)
                    if moq_match:
                        return int(moq_match.group(1))
                    return float('inf')
                except:
                    return float('inf')
            
            produits = sorted(produits, key=lambda x: (
                0 if x.get('moq') else 1,  # Produits avec MOQ en premier
                get_moq_value(x)  # Puis par MOQ croissant
            ))
        # "popularite" est le tri par défaut (ordre d'apparition sur Alibaba)
        
        # Nom de la catégorie pour l'affichage
        categorie_nom = categorie.replace('-', ' ').title() if categorie else (terme if terme else "Meilleures ventes")
        
        return {
            "message": f"Produits Alibaba - {categorie_nom}",
            "produits": produits,
            "nombre_produits": len(produits),
            "categorie": categorie or terme or "toutes",
            "tri": tri,
            "source": "Alibaba",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du scraping Alibaba: {str(e)}")


@app.post("/api/generate-boutique-csv")
async def generer_boutique_csv(request: BoutiqueCSVRequest):
    """
    Génère un fichier CSV pour créer une boutique (WordPress/WooCommerce ou Shopify).
    
    Args:
        request: Requête contenant la liste des produits et le type d'export
        
    Returns:
        Fichier CSV téléchargeable
    """
    try:
        if not request.produits or len(request.produits) == 0:
            raise HTTPException(status_code=400, detail="Aucun produit à exporter")
        
        # Générer le CSV selon le type
        if request.export_type == "shopify":
            csv_file = generate_boutique_csv_shopify(request.produits)
        else:  # wordpress par défaut
            csv_file = generate_boutique_csv_wordpress(request.produits)
        
        if not os.path.exists(csv_file):
            raise HTTPException(status_code=404, detail="Fichier CSV non trouvé")
        
        return FileResponse(
            csv_file,
            media_type="text/csv",
            filename=csv_file,
            headers={"Content-Disposition": f"attachment; filename={csv_file}"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du CSV: {str(e)}")


# =========================
# ENDPOINTS MARKETING
# =========================
@app.post("/api/marketing/generate-description")
async def generate_marketing_description(request: MarketingDescriptionRequest):
    """
    Génère un descriptif marketing attractif pour un produit.
    Utilise le cache pour éviter les appels API répétés.
    
    Args:
        request: Requête contenant le produit et le style
        
    Returns:
        Descriptif marketing avec titre, description et hashtags
    """
    try:
        descriptif = generer_descriptif_marketing(request.produit, request.style)
        return {
            "success": True,
            "descriptif": descriptif,
            "from_cache": descriptif.get("from_cache", False)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du descriptif: {str(e)}")


@app.post("/api/marketing/generate-batch")
async def generate_marketing_batch(request: MarketingBatchRequest):
    """
    Génère des descriptifs marketing pour plusieurs produits en batch.
    Optimisé pour utiliser le cache au maximum.
    
    Args:
        request: Requête contenant la liste de produits et le style
        
    Returns:
        Liste de descriptifs pour chaque produit
    """
    try:
        resultats = generer_descriptifs_batch(request.produits, request.style)
        return {
            "success": True,
            "resultats": resultats,
            "nombre_produits": len(resultats)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération batch: {str(e)}")


@app.post("/api/marketing/campaign")
async def save_campaign(request: CampaignRequest):
    """
    Sauvegarde une campagne Facebook dans la base de données.
    
    Args:
        request: Requête contenant le nom de la campagne, les produits et descriptifs
        
    Returns:
        ID de la campagne créée
    """
    try:
        campagne_id = sauvegarder_campagne(
            request.nom_campagne,
            request.produits,
            request.descriptifs
        )
        if campagne_id:
            return {
                "success": True,
                "campagne_id": campagne_id,
                "message": f"Campagne '{request.nom_campagne}' sauvegardée avec succès"
            }
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la sauvegarde de la campagne")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la sauvegarde: {str(e)}")


@app.get("/api/marketing/campaigns")
async def get_all_campaigns():
    """
    Récupère toutes les campagnes sauvegardées.
    
    Returns:
        Liste des campagnes
    """
    try:
        campagnes = get_campagnes()
        return {
            "success": True,
            "campagnes": campagnes,
            "nombre_campagnes": len(campagnes)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

