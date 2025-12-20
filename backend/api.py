"""
API FastAPI pour l'analyse de produits e-commerce
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import sys
import os

# Ajouter le répertoire parent au path pour importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai import analyse_produit
from csv_generator import generate_csv

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


@app.get("/api/veille-concurrentielle")
async def veille_concurrentielle():
    """
    Endpoint de veille concurrentielle - Analyse des meilleurs articles Jumia.
    
    Returns:
        Données de veille concurrentielle
    """
    # Pour l'instant, retourne simplement le message demandé
    return {
        "message": "Meilleurs articles Jumia",
        "articles": [
            "Article 1 - Produit phare Jumia",
            "Article 2 - Top vente",
            "Article 3 - Tendance du marché"
        ],
        "timestamp": "2024-01-01T00:00:00"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

