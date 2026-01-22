# Marketplace Backend

Backend séparé pour le marketplace, indépendant du backend principal.

## Installation

```bash
pip install -r requirements.txt
```

## Configuration

Variables d'environnement :
- `MAIN_BACKEND_URL` : URL du backend principal (défaut: `http://localhost:8000`)
- `MARKETPLACE_PORT` : Port d'écoute (défaut: `8001`)

## Démarrage

```bash
python api.py
```

ou avec uvicorn :

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8001
```

## Endpoints

Tous les endpoints sont préfixés par `/api/marketplace/` :

- `GET /api/marketplace/products` - Liste des produits
- `GET /api/marketplace/products/{product_id}` - Détails d'un produit
- `POST /api/marketplace/publish-product` - Publier un produit
- `PUT /api/marketplace/products/{product_id}` - Modifier un produit
- `PATCH /api/marketplace/products/{product_id}/status` - Modifier le statut
- `DELETE /api/marketplace/products/{product_id}` - Supprimer un produit
- `GET /api/marketplace/categories` - Liste des catégories
- `POST /api/marketing/generate-seo` - Générer description SEO (via backend principal)

## Architecture

Ce backend est complètement séparé du backend principal. Pour les fonctionnalités comme la génération SEO, il fait des appels API vers le backend principal.
