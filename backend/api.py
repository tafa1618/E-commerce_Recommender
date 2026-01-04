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
import logging

logger = logging.getLogger(__name__)

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

# Initialiser les DBs au démarrage
init_database()  # Alibaba cache

# Import depuis le même répertoire (backend)
from boutique_csv import generate_boutique_csv_wordpress, generate_boutique_csv_shopify
from marketing import generer_descriptif_marketing, generer_descriptifs_batch, sauvegarder_campagne, get_campagnes
from boutique_descriptions import generer_description_seo, generer_descriptions_batch_boutique
from journal_vente import (
    init_journal_db, ajouter_vente, get_ventes, get_vente_par_id,
    modifier_vente, supprimer_vente, get_statistiques, get_ventes_par_periode,
    creer_boutique, get_boutiques, get_boutique_par_id,
    modifier_boutique, supprimer_boutique
)
from google_trends import (
    get_trends_data, compare_keywords, get_seasonal_trends, get_related_topics
)
from trends_validator import (
    validate_product_trend, validate_multiple_products, compare_jumia_vs_trends
)

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


class BoutiqueDescriptionRequest(BaseModel):
    produit: Dict


class BoutiqueDescriptionBatchRequest(BaseModel):
    produits: List[Dict]


class VenteRequest(BaseModel):
    boutique_id: int
    date_vente: str  # Format: YYYY-MM-DD
    produit_nom: str
    prix: float
    quantite: int = 1
    localisation: Optional[str] = None
    client_info: Optional[str] = None
    notes: Optional[str] = None


class VenteUpdateRequest(BaseModel):
    boutique_id: Optional[int] = None
    date_vente: Optional[str] = None
    produit_nom: Optional[str] = None
    prix: Optional[float] = None
    quantite: Optional[int] = None
    localisation: Optional[str] = None
    client_info: Optional[str] = None
    notes: Optional[str] = None


class BoutiqueRequest(BaseModel):
    nom: str
    description: Optional[str] = None
    adresse: Optional[str] = None
    contact: Optional[str] = None


class BoutiqueUpdateRequest(BaseModel):
    nom: Optional[str] = None
    description: Optional[str] = None
    adresse: Optional[str] = None
    contact: Optional[str] = None


# =========================
# ENDPOINTS
# =========================
@app.get("/")
async def root():
    """Endpoint de santé"""
    return {"message": "E-commerce Recommender API", "status": "running"}


@app.get("/health")
async def health():
    """Endpoint de santé (alias)"""
    return {"message": "E-commerce Recommender API", "status": "running", "health": "ok"}


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
        
        # Enrichir les produits avec des données Jumia réelles
        produits_enrichis = []
        for produit in result.get("produits_lookalike", []):
            produit_enrichi = produit.copy()
            
            # Si pas d'image ou de lien, chercher sur Jumia
            if not produit_enrichi.get("image") or not produit_enrichi.get("lien_jumia"):
                try:
                    # Rechercher le produit sur Jumia
                    produits_jumia = scraper_jumia_recherche(
                        terme=produit_enrichi.get("nom", ""),
                        limit=3,
                        use_fuzzy=False
                    )
                    
                    if produits_jumia and len(produits_jumia) > 0:
                        # Prendre le premier résultat (le plus pertinent)
                        produit_jumia = produits_jumia[0]
                        
                        # Enrichir avec les données Jumia
                        if not produit_enrichi.get("image") and produit_jumia.get("image"):
                            produit_enrichi["image"] = produit_jumia["image"]
                        
                        if not produit_enrichi.get("lien_jumia") and produit_jumia.get("lien"):
                            produit_enrichi["lien_jumia"] = produit_jumia["lien"]
                        
                        # Optionnel : mettre à jour le prix si celui de Jumia est disponible
                        if produit_jumia.get("prix") and produit_jumia["prix"] > 0:
                            # Garder le prix recommandé de l'IA mais noter le prix Jumia
                            produit_enrichi["prix_jumia"] = produit_jumia["prix"]
                except Exception as e:
                    # Si la recherche échoue, on garde les données de l'IA
                    logger.warning(f"Erreur enrichissement produit {produit_enrichi.get('nom')}: {e}")
                    pass
            
            produits_enrichis.append(produit_enrichi)
        
        # Convertir les produits en modèles Pydantic
        produits_lookalike = []
        for produit in produits_enrichis:
            try:
                # Créer le produit avec les champs optionnels
                produit_pydantic = ProduitLookalike(
                    nom=produit.get("nom", ""),
                    description=produit.get("description", ""),
                    prix_recommande=produit.get("prix_recommande", 0),
                    type=produit.get("type", ""),
                    image=produit.get("image") or None,
                    lien_jumia=produit.get("lien_jumia") or None
                )
                produits_lookalike.append(produit_pydantic)
            except Exception as e:
                logger.warning(f"Erreur création ProduitLookalike: {e}")
                # Fallback sans image/lien
                produits_lookalike.append(ProduitLookalike(
                    nom=produit.get("nom", ""),
                    description=produit.get("description", ""),
                    prix_recommande=produit.get("prix_recommande", 0),
                    type=produit.get("type", "")
                ))
        
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


# =========================
# ENDPOINTS DESCRIPTIONS BOUTIQUE
# =========================
@app.post("/api/boutique/generate-description")
async def generate_boutique_description(request: BoutiqueDescriptionRequest):
    """
    Génère une description SEO-friendly pour un produit de boutique.
    Utilise le cache pour éviter les appels API répétés.
    
    Args:
        request: Requête contenant le produit
        
    Returns:
        Description SEO avec meta description et mots-clés
    """
    try:
        description = generer_description_seo(request.produit)
        return {
            "success": True,
            "description": description,
            "from_cache": description.get("from_cache", False)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération de la description: {str(e)}")


@app.post("/api/boutique/generate-descriptions-batch")
async def generate_boutique_descriptions_batch(request: BoutiqueDescriptionBatchRequest):
    """
    Génère des descriptions SEO-friendly pour plusieurs produits en batch.
    Optimisé pour utiliser le cache au maximum.
    
    Args:
        request: Requête contenant la liste de produits
        
    Returns:
        Liste de descriptions pour chaque produit
    """
    try:
        resultats = generer_descriptions_batch_boutique(request.produits)
        return {
            "success": True,
            "resultats": resultats,
            "nombre_produits": len(resultats)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération batch: {str(e)}")


# =========================
# ENDPOINTS JOURNAL DES VENTES
# =========================

@app.post("/api/journal-vente")
async def creer_vente(request: VenteRequest):
    """Crée une nouvelle entrée dans le journal des ventes"""
    try:
        vente_id = ajouter_vente(
            boutique_id=request.boutique_id,
            date_vente=request.date_vente,
            produit_nom=request.produit_nom,
            prix=request.prix,
            quantite=request.quantite,
            localisation=request.localisation,
            client_info=request.client_info,
            notes=request.notes
        )
        return {
            "success": True,
            "message": "Vente enregistrée avec succès",
            "vente_id": vente_id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement: {str(e)}")


@app.get("/api/journal-vente")
async def lister_ventes(
    boutique_id: Optional[int] = None,
    date_debut: Optional[str] = None,
    date_fin: Optional[str] = None,
    produit_nom: Optional[str] = None,
    localisation: Optional[str] = None,
    limit: Optional[int] = None
):
    """Récupère la liste des ventes avec filtres optionnels"""
    try:
        ventes = get_ventes(
            boutique_id=boutique_id,
            date_debut=date_debut,
            date_fin=date_fin,
            produit_nom=produit_nom,
            localisation=localisation,
            limit=limit
        )
        return {
            "success": True,
            "ventes": ventes,
            "nombre": len(ventes)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")


@app.get("/api/journal-vente/{vente_id}")
async def get_vente(vente_id: int):
    """Récupère une vente spécifique par son ID"""
    vente = get_vente_par_id(vente_id)
    if not vente:
        raise HTTPException(status_code=404, detail="Vente non trouvée")
    return {"success": True, "vente": vente}


@app.put("/api/journal-vente/{vente_id}")
async def mettre_a_jour_vente(vente_id: int, request: VenteUpdateRequest):
    """Met à jour une vente existante"""
    try:
        success = modifier_vente(
            vente_id=vente_id,
            boutique_id=request.boutique_id,
            date_vente=request.date_vente,
            produit_nom=request.produit_nom,
            prix=request.prix,
            quantite=request.quantite,
            localisation=request.localisation,
            client_info=request.client_info,
            notes=request.notes
        )
        if not success:
            raise HTTPException(status_code=404, detail="Vente non trouvée ou aucune modification")
        return {"success": True, "message": "Vente mise à jour avec succès"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour: {str(e)}")


@app.delete("/api/journal-vente/{vente_id}")
async def supprimer_vente_api(vente_id: int):
    """Supprime une vente"""
    success = supprimer_vente(vente_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vente non trouvée")
    return {"success": True, "message": "Vente supprimée avec succès"}


@app.get("/api/journal-vente/statistiques")
async def get_statistiques_ventes(
    boutique_id: Optional[int] = None,
    date_debut: Optional[str] = None,
    date_fin: Optional[str] = None
):
    """Récupère les statistiques des ventes"""
    try:
        stats = get_statistiques(boutique_id=boutique_id, date_debut=date_debut, date_fin=date_fin)
        return {"success": True, "statistiques": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul des statistiques: {str(e)}")


@app.get("/api/journal-vente/periode/{annee}")
async def get_ventes_periode(
    annee: int,
    mois: Optional[int] = None,
    boutique_id: Optional[int] = None
):
    """Récupère les ventes pour une période spécifique (utile pour comparer d'une année sur l'autre)"""
    try:
        ventes = get_ventes_par_periode(annee=annee, mois=mois, boutique_id=boutique_id)
        return {
            "success": True,
            "ventes": ventes,
            "periode": f"{annee}" + (f"-{mois:02d}" if mois else ""),
            "nombre": len(ventes)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")


# =========================
# ENDPOINTS GESTION BOUTIQUES
# =========================

@app.post("/api/boutiques")
async def creer_boutique_api(request: BoutiqueRequest):
    """Crée une nouvelle boutique"""
    try:
        # S'assurer que la base de données est initialisée
        init_journal_db()
        
        boutique_id = creer_boutique(
            nom=request.nom,
            description=request.description,
            adresse=request.adresse,
            contact=request.contact
        )
        return {
            "success": True,
            "message": "Boutique créée avec succès",
            "boutique_id": boutique_id
        }
    except sqlite3.IntegrityError as e:
        error_msg = str(e)
        if "UNIQUE constraint" in error_msg or "unique" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Une boutique avec ce nom existe déjà")
        raise HTTPException(status_code=400, detail=f"Erreur d'intégrité: {error_msg}")
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Erreur lors de la création de boutique: {error_details}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création: {str(e)}")


@app.get("/api/boutiques")
async def lister_boutiques():
    """Récupère toutes les boutiques"""
    try:
        boutiques = get_boutiques()
        return {
            "success": True,
            "boutiques": boutiques,
            "nombre": len(boutiques)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")


@app.get("/api/boutiques/{boutique_id}")
async def get_boutique_api(boutique_id: int):
    """Récupère une boutique spécifique par son ID"""
    boutique = get_boutique_par_id(boutique_id)
    if not boutique:
        raise HTTPException(status_code=404, detail="Boutique non trouvée")
    return {"success": True, "boutique": boutique}


@app.put("/api/boutiques/{boutique_id}")
async def mettre_a_jour_boutique(boutique_id: int, request: BoutiqueUpdateRequest):
    """Met à jour une boutique existante"""
    try:
        success = modifier_boutique(
            boutique_id=boutique_id,
            nom=request.nom,
            description=request.description,
            adresse=request.adresse,
            contact=request.contact
        )
        if not success:
            raise HTTPException(status_code=404, detail="Boutique non trouvée ou aucune modification")
        return {"success": True, "message": "Boutique mise à jour avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour: {str(e)}")


@app.delete("/api/boutiques/{boutique_id}")
async def supprimer_boutique_api(boutique_id: int):
    """Supprime une boutique (et toutes ses ventes)"""
    success = supprimer_boutique(boutique_id)
    if not success:
        raise HTTPException(status_code=404, detail="Boutique non trouvée")
    return {"success": True, "message": "Boutique supprimée avec succès"}


# =========================
# ENDPOINTS GOOGLE TRENDS
# =========================

class TrendsRequest(BaseModel):
    keywords: List[str]
    timeframe: Optional[str] = 'today 12-m'
    geo: Optional[str] = 'SN'  # Sénégal par défaut
    cat: Optional[int] = 0


class CompareRequest(BaseModel):
    keywords: List[str]
    timeframe: Optional[str] = 'today 12-m'
    geo: Optional[str] = 'SN'


class SeasonalRequest(BaseModel):
    keyword: str
    years: Optional[int] = 3
    geo: Optional[str] = 'SN'


@app.post("/api/trends")
async def get_trends(request: TrendsRequest):
    """Récupère les données de tendances Google Trends pour des mots-clés"""
    try:
        if len(request.keywords) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 mots-clés autorisés")
        
        result = get_trends_data(
            keywords=request.keywords,
            timeframe=request.timeframe,
            geo=request.geo,
            cat=request.cat
        )
        
        if not result.get("success", True):
            raise HTTPException(status_code=500, detail=result.get("error", "Erreur inconnue"))
        
        return result
    except ImportError as e:
        raise HTTPException(status_code=503, detail="Google Trends API non disponible. Installez pytrends: pip install pytrends")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des tendances: {str(e)}")


@app.post("/api/trends/compare")
async def compare_trends(request: CompareRequest):
    """Compare plusieurs mots-clés pour voir lequel est le plus recherché"""
    try:
        if len(request.keywords) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 mots-clés autorisés")
        
        result = compare_keywords(
            keywords=request.keywords,
            timeframe=request.timeframe,
            geo=request.geo
        )
        
        if not result.get("success", True):
            raise HTTPException(status_code=500, detail=result.get("error", "Erreur inconnue"))
        
        return result
    except ImportError as e:
        raise HTTPException(status_code=503, detail="Google Trends API non disponible. Installez pytrends: pip install pytrends")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la comparaison: {str(e)}")


@app.post("/api/trends/seasonal")
async def get_seasonal(request: SeasonalRequest):
    """Analyse les tendances saisonnières d'un mot-clé"""
    try:
        result = get_seasonal_trends(
            keyword=request.keyword,
            years=request.years,
            geo=request.geo
        )
        
        if not result.get("success", True):
            raise HTTPException(status_code=500, detail=result.get("error", "Erreur inconnue"))
        
        return result
    except ImportError as e:
        raise HTTPException(status_code=503, detail="Google Trends API non disponible. Installez pytrends: pip install pytrends")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse saisonnière: {str(e)}")


@app.get("/api/trends/related/{keyword}")
async def get_related(keyword: str, geo: Optional[str] = 'SN'):
    """Récupère les sujets et requêtes liés à un mot-clé"""
    try:
        result = get_related_topics(keyword=keyword, geo=geo)
        
        if not result.get("success", True):
            raise HTTPException(status_code=500, detail=result.get("error", "Erreur inconnue"))
        
        return result
    except ImportError as e:
        raise HTTPException(status_code=503, detail="Google Trends API non disponible. Installez pytrends: pip install pytrends")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des sujets liés: {str(e)}")


# =========================
# ENDPOINTS VALIDATION PRODUITS
# =========================

class ValidateProductRequest(BaseModel):
    produit: Dict
    timeframe: Optional[str] = 'today 3-m'
    geo: Optional[str] = 'SN'


class ValidateProductsRequest(BaseModel):
    produits: List[Dict]
    timeframe: Optional[str] = 'today 3-m'
    geo: Optional[str] = 'SN'


@app.post("/api/trends/validate-product")
async def validate_product(request: ValidateProductRequest):
    """
    Valide si un produit Jumia est aussi tendance sur Google Trends
    Utile pour confirmer qu'un produit tendance sur Jumia est un bon choix
    """
    try:
        result = validate_product_trend(
            produit=request.produit,
            timeframe=request.timeframe,
            geo=request.geo
        )
        
        return {
            "success": True,
            "validation": result
        }
    except ImportError as e:
        raise HTTPException(status_code=503, detail="Google Trends API non disponible. Installez pytrends: pip install pytrends")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la validation: {str(e)}")


@app.post("/api/trends/validate-products")
async def validate_products(request: ValidateProductsRequest):
    """
    Valide plusieurs produits Jumia en une seule fois
    Compare les produits tendance sur Jumia avec Google Trends
    """
    try:
        if len(request.produits) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 produits autorisés")
        
        result = compare_jumia_vs_trends(
            produits_jumia=request.produits,
            timeframe=request.timeframe,
            geo=request.geo
        )
        
        return {
            "success": True,
            "analysis": result
        }
    except ImportError as e:
        raise HTTPException(status_code=503, detail="Google Trends API non disponible. Installez pytrends: pip install pytrends")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la validation: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

