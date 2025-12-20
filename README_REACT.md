# 🧠 E-commerce Recommender - Architecture React + Python

Application d'analyse de produits e-commerce avec interface React et backend Python FastAPI.

## 📁 Structure du Projet

```
E-commerce_Recommender/
├── backend/
│   ├── api.py              # API FastAPI
│   └── requirements.txt    # Dépendances Python backend
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Composant principal React
│   │   ├── App.css         # Styles de l'application
│   │   ├── main.jsx        # Point d'entrée React
│   │   └── index.css       # Styles globaux
│   ├── index.html          # HTML de base
│   ├── package.json        # Dépendances Node.js
│   └── vite.config.js      # Configuration Vite
├── ai.py                   # Module d'analyse IA (réutilisé)
├── csv_generator.py        # Module de génération CSV (réutilisé)
└── README_REACT.md         # Ce fichier
```

## 🚀 Installation et Démarrage

### Prérequis

- Python 3.8+
- Node.js 18+
- npm ou yarn

### ⚡ Guide Rapide Windows

Sur Windows, utilisez `py` au lieu de `python` et `py -m pip` au lieu de `pip` :

```powershell
# Backend
cd backend
py -m pip install -r requirements.txt
cd ..
py backend/api.py

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

### 1. Backend (Python FastAPI)

**Pour Windows (PowerShell/CMD):**
```bash
# Installer les dépendances
cd backend
py -m pip install -r requirements.txt

# Retourner à la racine
cd ..

# Lancer le serveur API
py backend/api.py
```

**Pour Linux/Mac:**
```bash
# Installer les dépendances
cd backend
pip install -r requirements.txt

# Retourner à la racine
cd ..

# Lancer le serveur API
python backend/api.py
```

Le backend sera accessible sur `http://localhost:8000`

### 2. Frontend (React)

```bash
# Installer les dépendances
cd frontend
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
OPENAI_API_KEY=votre_clé_api_openai
```

## 📡 API Endpoints

### POST `/api/analyse`

Analyse un produit et retourne des recommandations.

**Request:**
```json
{
  "nom_produit": "Téléphone Samsung Galaxy",
  "lien": "https://..." // optionnel
}
```

**Response:**
```json
{
  "produit": "Téléphone Samsung Galaxy",
  "decision": "GO",
  "raison": "Analyse détaillée...",
  "categorie": "Électronique",
  "produits_lookalike": [
    {
      "nom": "Étui de protection",
      "description": "...",
      "prix_recommande": 5000,
      "type": "accessoire"
    }
  ]
}
```

### POST `/api/generate-csv`

Génère un fichier CSV à partir d'une liste de produits.

**Request:**
```json
{
  "produits": [
    {
      "nom": "...",
      "description": "...",
      "prix_recommande": 5000,
      "type": "accessoire"
    }
  ]
}
```

**Response:** Fichier CSV téléchargeable

## 🎨 Fonctionnalités

- ✅ Interface React moderne et responsive
- ✅ Analyse de produits avec IA
- ✅ Visualisation des produits recommandés
- ✅ Génération et téléchargement de CSV
- ✅ Gestion des erreurs et états de chargement
- ✅ API REST complète avec FastAPI
- ✅ CORS configuré pour le développement

## 🛠️ Technologies Utilisées

**Backend:**
- FastAPI
- OpenAI API
- Python

**Frontend:**
- React 18
- Vite
- Axios
- CSS moderne

## 📝 Notes

- Le backend et le frontend doivent tourner simultanément
- Le backend doit être lancé avant le frontend
- Les modules `ai.py` et `csv_generator.py` sont réutilisés depuis la racine

## 🔄 Migration depuis Streamlit

Cette architecture remplace l'application Streamlit (`app.py`) par une séparation claire entre frontend et backend, permettant :
- Une meilleure scalabilité
- Une API réutilisable
- Une interface utilisateur plus flexible
- Un déploiement indépendant des deux parties

