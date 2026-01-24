# Frontend Veille Concurrentielle

Frontend React (Vite) pour la veille concurrentielle, le scraping, l'analyse de produits et Google Trends.

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev
```

Le serveur démarre sur **http://localhost:3000** (ou un autre port si 3000 est occupé).

## Configuration

Le frontend fait un proxy vers le backend principal sur `http://localhost:8000` (configuré dans `vite.config.js`).

## Fonctionnalités

- **Veille Concurrentielle** : Scraping Jumia et Alibaba
- **Google Trends** : Analyse des tendances de recherche
- **Marketing** : Génération de descriptions marketing
- **Journal de Vente** : Gestion des ventes
- **Création de Boutique** : Gestion des boutiques

## Architecture

- **Frontend** : React + Vite (ce dossier)
- **Backend** : FastAPI sur `http://localhost:8000` (dossier `backend/`)

