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

# Ajouter le répertoire parent au path pour importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai import analyse_produit
from csv_generator import generate_csv
from jumia_scraper import scraper_jumia_best_sellers, scraper_jumia_categorie

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


@app.get("/api/veille-concurrentielle")
async def veille_concurrentielle(categorie: Optional[str] = None, limit: int = 20, tri: Optional[str] = "popularite"):
    """
    Endpoint de veille concurrentielle - Scrape les meilleurs articles Jumia.
    
    Args:
        categorie: Catégorie spécifique (optionnel, slug de la catégorie)
        limit: Nombre maximum de produits (défaut: 20)
        tri: Type de tri - "popularite" (défaut) ou "prix" ou "remise"
        
    Returns:
        Données de veille concurrentielle avec les produits scrapés
    """
    try:
        if categorie and categorie.strip():
            produits = scraper_jumia_categorie(categorie.strip(), limit)
        else:
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
        
        # Nom de la catégorie pour l'affichage
        categorie_nom = categorie.replace('-', ' ').title() if categorie else "Meilleures ventes"
        
        return {
            "message": f"Meilleurs articles Jumia - {categorie_nom}",
            "produits": produits,
            "nombre_produits": len(produits),
            "categorie": categorie or "toutes",
            "tri": tri,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du scraping: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

