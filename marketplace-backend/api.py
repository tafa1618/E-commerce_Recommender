"""
API FastAPI pour le Marketplace
Backend séparé du backend principal pour une meilleure séparation des responsabilités
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import os
import sys

# Import des modules marketplace (même répertoire)
from marketplace_db import (
    init_marketplace_db,
    publier_produit,
    get_produits_marketplace,
    get_produit_by_id,
    mettre_a_jour_statut_produit,
    mettre_a_jour_produit,
    supprimer_produit,
    get_produits_par_categorie,
    enregistrer_evenement,
    get_all_categories,
    ajouter_au_panier,
    get_panier,
    modifier_quantite_panier,
    supprimer_du_panier,
    vider_panier
)
from image_downloader import download_image, copy_image_to_public

# Client API pour appeler le backend principal
import requests

# Configuration
MAIN_BACKEND_URL = os.getenv("MAIN_BACKEND_URL", "http://localhost:8000")

app = FastAPI(title="Marketplace API", version="1.0.0")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser la DB au démarrage
init_marketplace_db()


# =========================
# MODÈLES PYDANTIC
# =========================

class PublishProductRequest(BaseModel):
    produit: Dict
    description_seo: Optional[Dict] = None
    validation_data: Optional[Dict] = None
    niche_data: Optional[Dict] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None


class UpdateStatusRequest(BaseModel):
    status: str


# =========================
# CLIENT API POUR BACKEND PRINCIPAL
# =========================

async def call_main_backend(endpoint: str, method: str = "POST", data: Optional[Dict] = None) -> Optional[Dict]:
    """
    Appelle le backend principal pour des fonctionnalités comme description_seo
    
    Args:
        endpoint: Endpoint à appeler (ex: "/api/marketing/generate-seo")
        method: Méthode HTTP (GET, POST, etc.)
        data: Données à envoyer
        
    Returns:
        Réponse JSON du backend principal ou None si erreur
    """
    try:
        url = f"{MAIN_BACKEND_URL}{endpoint}"
        response = requests.request(
            method=method,
            url=url,
            json=data if data else None,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️ Erreur appel backend principal {endpoint}: {response.status_code}")
            return None
    except Exception as e:
        print(f"⚠️ Exception lors de l'appel au backend principal: {e}")
        return None


# =========================
# ROUTES MARKETPLACE
# =========================

@app.get("/api/marketplace/categories")
async def get_categories():
    """Récupère toutes les catégories disponibles"""
    try:
        categories = get_all_categories()
        return {
            "success": True,
            "categories": categories
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")


@app.get("/api/marketplace/categories/{categorie}/produits")
async def get_products_by_category(categorie: str, limit: Optional[int] = 4):
    """
    Récupère les produits d'une catégorie spécifique.
    
    Args:
        categorie: Nom de la catégorie
        limit: Nombre de produits à retourner
        
    Returns:
        Liste des produits de la catégorie
    """
    try:
        produits = get_produits_par_categorie(categorie, limit=limit or 4)
        return {
            "success": True,
            "produits": produits,
            "categorie": categorie,
            "count": len(produits)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")


@app.get("/api/marketplace/products")
async def get_products_marketplace_api(
    status: Optional[str] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    categorie: Optional[str] = None,
    search: Optional[str] = None
):
    """
    Récupère les produits du marketplace avec pagination et recherche
    
    Args:
        status: Statut des produits (active, draft, archived)
        limit: Nombre de produits à retourner
        offset: Nombre de produits à ignorer (pour pagination)
        categorie: Filtrer par catégorie
        search: Recherche textuelle dans nom, description, mots-clés
        
    Returns:
        Dict avec produits, total et count
    """
    try:
        result = get_produits_marketplace(
            status=status,
            limit=limit,
            offset=offset,
            categorie=categorie,
            search=search
        )
        
        if isinstance(result, list):
            return {
                "success": True,
                "produits": result,
                "count": len(result),
                "total": len(result)
            }
        
        return {
            "success": True,
            "produits": result.get('produits', []),
            "count": result.get('count', 0),
            "total": result.get('total', 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")


@app.get("/api/marketplace/products/{product_id}")
async def get_product_by_id(product_id: str):
    """
    Récupère un produit par son ID
    
    Args:
        product_id: ID du produit
        
    Returns:
        Le produit avec toutes ses données
    """
    try:
        print(f"🔍 Récupération du produit: {product_id}")
        produit = get_produit_by_id(product_id)
        if not produit:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        return {
            "success": True,
            "produit": produit
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur récupération produit {product_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")


@app.post("/api/marketplace/publish-product")
async def publish_product_marketplace(request: PublishProductRequest):
    """
    Publie un produit sur le marketplace.
    Télécharge automatiquement les images depuis les URLs externes.
    
    Args:
        request: Requête contenant les données du produit
        
    Returns:
        ID du produit publié
    """
    try:
        produit = request.produit.copy()
        image_url = produit.get('image')
        downloaded_path = None
        
        # Télécharger l'image si elle vient d'une URL externe
        if image_url and image_url.startswith(('http://', 'https://')):
            temp_product_id = produit.get('product_id') or f"temp_{hash(str(produit))}"
            downloaded_path = download_image(image_url, temp_product_id)
            
            if downloaded_path:
                # Chemin vers le dossier public du marketplace
                marketplace_public = os.path.join(
                    os.path.dirname(os.path.dirname(__file__)),
                    'Marketplace',
                    'public'
                )
                final_image_path = copy_image_to_public(downloaded_path, marketplace_public)
                
                if final_image_path:
                    produit['image'] = final_image_path
                    print(f"✅ Image téléchargée: {image_url} -> {final_image_path}")
        
        product_id = publier_produit(
            produit=produit,
            description_seo=request.description_seo,
            validation_data=request.validation_data,
            niche_data=request.niche_data,
            user_id=request.user_id,
            session_id=request.session_id
        )
        return {
            "success": True,
            "product_id": product_id,
            "message": "Produit publié avec succès",
            "image_downloaded": downloaded_path is not None if image_url else False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la publication: {str(e)}")


@app.post("/api/marketplace/publish-products-batch")
async def publish_products_batch_marketplace(request: List[PublishProductRequest]):
    """
    Publie plusieurs produits sur le marketplace en batch.
    Télécharge automatiquement les images depuis les URLs externes.
    
    Args:
        request: Liste de requêtes contenant les données des produits
        
    Returns:
        Liste des IDs des produits publiés
    """
    try:
        product_ids = []
        images_downloaded = 0
        marketplace_public = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'Marketplace',
            'public'
        )
        
        for req in request:
            produit = req.produit.copy()
            image_url = produit.get('image')
            
            if image_url and image_url.startswith(('http://', 'https://')):
                temp_product_id = produit.get('product_id') or f"temp_{hash(str(produit))}"
                downloaded_path = download_image(image_url, temp_product_id)
                
                if downloaded_path:
                    final_image_path = copy_image_to_public(downloaded_path, marketplace_public)
                    if final_image_path:
                        produit['image'] = final_image_path
                        images_downloaded += 1
        
            product_id = publier_produit(
                produit=produit,
                description_seo=req.description_seo,
                validation_data=req.validation_data,
                niche_data=req.niche_data,
                user_id=req.user_id,
                session_id=req.session_id
            )
            product_ids.append(product_id)
        
        return {
            "success": True,
            "product_ids": product_ids,
            "count": len(product_ids),
            "images_downloaded": images_downloaded,
            "message": f"{len(product_ids)} produit(s) publié(s) avec succès"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la publication batch: {str(e)}")


@app.put("/api/marketplace/products/{product_id}")
async def update_product_by_id(product_id: str, request: PublishProductRequest):
    """
    Modifie un produit existant
    
    Args:
        product_id: ID du produit à modifier
        request: Données du produit à modifier
        
    Returns:
        Confirmation de la modification
    """
    try:
        existing = get_produit_by_id(product_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        updated_id = mettre_a_jour_produit(
            product_id=product_id,
            produit=request.produit,
            description_seo=request.description_seo,
            validation_data=request.validation_data,
            niche_data=request.niche_data
        )
        
        if not updated_id:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        return {
            "success": True,
            "product_id": updated_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la modification: {str(e)}")


@app.patch("/api/marketplace/products/{product_id}/status")
async def update_product_status(product_id: str, request: UpdateStatusRequest):
    """
    Modifie uniquement le statut d'un produit
    
    Args:
        product_id: ID du produit à modifier
        request: UpdateStatusRequest avec 'status' (active, inactive, draft, archived)
        
    Returns:
        Confirmation de la modification
    """
    try:
        status = request.status
        if not status or status not in ['active', 'inactive', 'draft', 'archived']:
            raise HTTPException(status_code=400, detail="Statut invalide")
        
        existing = get_produit_by_id(product_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        updated = mettre_a_jour_statut_produit(product_id, status)
        if not updated:
            raise HTTPException(status_code=500, detail="Erreur lors de la modification du statut")
        
        return {
            "success": True,
            "product_id": product_id,
            "status": status,
            "message": f"Statut modifié avec succès: {status}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la modification du statut: {str(e)}")


@app.delete("/api/marketplace/products/{product_id}")
async def delete_product_by_id(product_id: str):
    """
    Supprime un produit du marketplace
    
    Args:
        product_id: ID du produit à supprimer
        
    Returns:
        Confirmation de la suppression
    """
    try:
        success = supprimer_produit(product_id)
        if not success:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        return {
            "success": True,
            "message": "Produit supprimé"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")


@app.post("/api/marketplace/track-event")
async def track_event_marketplace(request: Dict):
    """
    Enregistre un événement de tracking pour le ML
    
    Args:
        request: Données de l'événement (product_id, event_type, etc.)
        
    Returns:
        Confirmation de l'enregistrement
    """
    try:
        enregistrer_evenement(
            product_id=request.get("product_id"),
            event_type=request.get("event_type"),
            user_id=request.get("user_id"),
            session_id=request.get("session_id"),
            device_type=request.get("device_type"),
            source=request.get("source"),
            metadata=request.get("metadata")
        )
        return {
            "success": True,
            "message": "Événement enregistré avec succès"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement: {str(e)}")


@app.post("/api/marketing/generate-seo")
async def generate_seo_description(request: Dict):
    """
    Génère une description SEO-friendly en appelant le backend principal
    
    Args:
        request: {"texte_produit": "..."}
        
    Returns:
        Description SEO générée
    """
    try:
        result = await call_main_backend(
            endpoint="/api/marketing/generate-seo",
            method="POST",
            data=request
        )
        
        if result:
            return result
        else:
            raise HTTPException(
                status_code=503,
                detail="Service de génération SEO temporairement indisponible"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération SEO: {str(e)}")


# =========================
# ROUTES PANIER
# =========================

class AddToCartRequest(BaseModel):
    product_id: str
    quantite: Optional[int] = 1
    session_id: str


@app.post("/api/marketplace/cart/add")
async def add_to_cart(request: AddToCartRequest):
    """
    Ajoute un produit au panier
    
    Args:
        request: AddToCartRequest avec product_id, quantite et session_id
        
    Returns:
        Confirmation de l'ajout
    """
    try:
        success = ajouter_au_panier(
            session_id=request.session_id,
            product_id=request.product_id,
            quantite=request.quantite or 1
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        # Enregistrer l'événement pour le ML
        enregistrer_evenement(
            product_id=request.product_id,
            event_type="add_to_cart",
            session_id=request.session_id,
            device_type=None,
            source="web"
        )
        
        return {
            "success": True,
            "message": "Produit ajouté au panier"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'ajout au panier: {str(e)}")


@app.get("/api/marketplace/cart")
async def get_cart(session_id: str):
    """
    Récupère le panier d'un utilisateur
    
    Args:
        session_id: ID de session utilisateur
        
    Returns:
        Liste des produits dans le panier
    """
    try:
        panier = get_panier(session_id)
        
        # Calculer le total
        total = sum(item['sous_total'] for item in panier)
        
        return {
            "success": True,
            "panier": panier,
            "total": total,
            "count": len(panier)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du panier: {str(e)}")


class UpdateCartRequest(BaseModel):
    product_id: str
    quantite: int
    session_id: str


@app.put("/api/marketplace/cart/update")
async def update_cart(request: UpdateCartRequest):
    """
    Modifie la quantité d'un produit dans le panier
    
    Args:
        request: UpdateCartRequest avec product_id, quantite et session_id
        
    Returns:
        Confirmation de la modification
    """
    try:
        success = modifier_quantite_panier(
            session_id=request.session_id,
            product_id=request.product_id,
            quantite=request.quantite
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Produit non trouvé dans le panier")
        
        return {
            "success": True,
            "message": "Quantité mise à jour"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la modification: {str(e)}")


@app.delete("/api/marketplace/cart/{product_id}")
async def remove_from_cart(product_id: str, session_id: str):
    """
    Supprime un produit du panier
    
    Args:
        product_id: ID du produit
        session_id: ID de session utilisateur
        
    Returns:
        Confirmation de la suppression
    """
    try:
        success = supprimer_du_panier(session_id, product_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Produit non trouvé dans le panier")
        
        return {
            "success": True,
            "message": "Produit retiré du panier"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")


@app.delete("/api/marketplace/cart")
async def clear_cart(session_id: str):
    """
    Vide complètement le panier
    
    Args:
        session_id: ID de session utilisateur
        
    Returns:
        Confirmation du vidage
    """
    try:
        success = vider_panier(session_id)
        
        return {
            "success": True,
            "message": "Panier vidé"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du vidage: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("MARKETPLACE_PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
