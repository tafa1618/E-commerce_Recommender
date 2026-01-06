# 🛍️ E-commerce Recommender

Application complète d'analyse et de recommandation de produits e-commerce avec intégration Jumia, Alibaba, Google Trends et intelligence artificielle.

## ✨ Fonctionnalités Principales

### 📊 Analyse de Produits (IA)
- Analyse intelligente de produits avec décision GO/NO_GO
- Recommandation de produits complémentaires (cross-selling)
- Génération de descriptions SEO-friendly
- Utilisation du modèle **GPT-4o** pour une analyse de qualité supérieure

### 🔍 Veille Concurrentielle

#### Jumia
- Recherche de produits par catégorie ou mot-clé
- Fuzzy search intelligent pour des résultats pertinents
- Affichage des statistiques de prix (min, max, moyenne)
- Tri par popularité, prix, note
- Validation Google Trends intégrée

#### Alibaba
- Scraping via Apify (avec cache pour réduire les coûts)
- Recherche par catégorie ou terme
- Support de batch scraping avec base de données
- Fallback sur scraper local si Apify non configuré

### 📈 Google Trends
- Analyse des tendances de recherche pour validation de produits
- Comparaison de mots-clés
- Analyse saisonnière
- Découverte de requêtes liées
- Validation automatique des produits Jumia avec scores (0-100)
- Recommandations (GO FORT, GO MODÉRÉ, ATTENTION, NO GO)

### 🛍️ Créer une Boutique
- Sélection de produits depuis Jumia par catégorie
- **Analyse automatique Google Trends** lors du chargement
- Tri automatique des produits par tendance
- Ajout manuel de produits avec drag & drop d'images
- Recherche de produits tendance via Google Trends
- Génération de descriptions SEO avec cache OpenAI
- Export CSV pour WordPress/WooCommerce et Shopify
- Gestion complète de la boutique

### 📢 Marketing
- Création de campagnes marketing
- Génération de descriptions publicitaires optimisées Facebook Ads
- Sélection de produits par catégorie Jumia
- Ajout manuel de produits
- Export de campagnes

### 📊 Journal des Ventes
- Enregistrement des ventes avec détails complets
- Support multi-boutiques
- Statistiques par boutique
- Filtres par période
- Comparaison année sur année
- Tracking de performance des produits

## 🚀 Installation

### Prérequis
- Python 3.8+
- Node.js 18+
- npm ou yarn

### Backend

1. Installer les dépendances Python :
```bash
pip install -r requirements.txt
```

2. Configurer les variables d'environnement :
Créer un fichier `.env` dans le répertoire racine :
```
OPENAI_API_KEY=votre_clé_openai
APIFY_API_KEY=votre_clé_apify (optionnel)
```

3. Démarrer le serveur backend :
```bash
cd backend
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Le backend sera accessible sur `http://localhost:8000`

### Frontend

1. Installer les dépendances :
```bash
cd frontend
npm install
```

2. Démarrer le serveur de développement :
```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 📦 Dépendances Principales

### Backend
- `fastapi` - Framework API
- `openai` - Intelligence artificielle (GPT-4o)
- `pytrends` - Google Trends API
- `requests` - Requêtes HTTP
- `beautifulsoup4` - Scraping web
- `sqlite3` - Base de données

### Frontend
- `react` - Framework UI
- `axios` - Requêtes HTTP
- `vite` - Build tool

## 🗂️ Structure du Projet

```
E-commerce_Recommender/
├── backend/
│   ├── api.py                 # API FastAPI principale
│   ├── ai.py                  # Analyse IA de produits
│   ├── google_trends.py       # Intégration Google Trends
│   ├── trends_validator.py    # Validation produits avec Trends
│   ├── jumia_scraper.py       # Scraper Jumia
│   ├── alibaba_scraper.py     # Scraper Alibaba
│   ├── alibaba_apify.py       # Intégration Apify
│   ├── marketing.py           # Génération descriptions marketing
│   ├── boutique_descriptions.py  # Descriptions SEO boutique
│   ├── journal_vente.py       # Gestion journal des ventes
│   ├── database.py            # Cache base de données
│   └── fuzzy_search.py        # Recherche floue
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Composant principal
│   │   ├── VeilleConcurrentielle.jsx  # Veille Jumia
│   │   ├── Alibaba.jsx        # Veille Alibaba
│   │   ├── CreerBoutique.jsx  # Création boutique
│   │   ├── Marketing.jsx      # Marketing
│   │   ├── JournalVente.jsx   # Journal des ventes
│   │   └── GoogleTrends.jsx   # Google Trends
│   └── package.json
├── data/                      # Bases de données SQLite
├── .env                       # Variables d'environnement
└── README.md                  # Ce fichier
```

## 🔧 Configuration

### Google Trends
Pas besoin de clé API ! Google Trends utilise `pytrends` qui est gratuit.

### Apify (Alibaba)
Optionnel. Si configuré, utilise Apify pour scraper Alibaba. Sinon, utilise le scraper local.

Voir `CONFIG_APIFY.md` pour la configuration.

### Modèles GPT
Le projet utilise **GPT-4o** par défaut. Voir `CONFIG_MODELES.md` pour changer le modèle.

## 📚 Documentation

- `GUIDE_GOOGLE_TRENDS.md` - Guide complet Google Trends
- `EXPLICATION_GOOGLE_TRENDS.md` - Explication détaillée de Google Trends
- `CONFIG_MODELES.md` - Configuration des modèles GPT
- `CONFIG_APIFY.md` - Configuration Apify
- `GUIDE_CACHE_ALIBABA.md` - Guide du système de cache

## 🎯 Cas d'Usage

### 1. Analyser un Produit
- Aller dans "Analyse Produit"
- Entrer le nom du produit (et optionnellement un lien)
- Obtenir une décision GO/NO_GO et des recommandations de produits complémentaires

### 2. Créer une Boutique
- Aller dans "Créer une Boutique"
- Sélectionner une catégorie Jumia
- Les produits sont automatiquement analysés avec Google Trends
- Les produits sont triés par tendance
- Ajouter les produits validés à la boutique
- Générer les descriptions SEO
- Exporter en CSV (WooCommerce/Shopify)

### 3. Veille Concurrentielle
- Comparer les prix sur Jumia et Alibaba
- Valider les produits avec Google Trends
- Identifier les opportunités de marché

### 4. Marketing
- Créer des campagnes publicitaires
- Générer des descriptions optimisées Facebook Ads
- Exporter les campagnes

### 5. Suivi des Ventes
- Enregistrer les ventes par boutique
- Analyser les performances
- Identifier les produits qui marchent

## 🔐 Variables d'Environnement

Créer un fichier `.env` :

```env
OPENAI_API_KEY=sk-...
APIFY_API_KEY=apify_api_... (optionnel)
```

## 🚨 Dépannage

### Backend ne démarre pas
- Vérifier que Python 3.8+ est installé
- Vérifier que les dépendances sont installées : `pip install -r requirements.txt`
- Vérifier que le port 8000 n'est pas utilisé

### Frontend ne démarre pas
- Vérifier que Node.js 18+ est installé
- Vérifier que les dépendances sont installées : `npm install`
- Vérifier que le port 5173 n'est pas utilisé

### Erreur OpenAI
- Vérifier que `OPENAI_API_KEY` est configuré dans `.env`
- Vérifier que la clé est valide

### Erreur Google Trends
- Installer pytrends : `pip install pytrends`
- Vérifier la connexion internet

## 📝 Licence

Ce projet est un projet personnel.

## 👤 Auteur
Mohamadou Moustapha GAYE

Développé pour l'analyse et la recommandation de produits e-commerce.

---

**Version** : 2.0  
**Dernière mise à jour** : Janvier 2025

