# Guide : Système de Cache Alibaba pour Économiser sur Apify

## 🎯 Objectif

Économiser sur les coûts Apify en lançant des batchs de scrapings et en sauvegardant les résultats dans une base de données SQLite. L'API utilisera ensuite le cache au lieu de lancer de nouveaux scrapings.

## 💰 Économies

- **Sans cache** : Chaque requête API = 1 scraping Apify = ~$0.05-0.10
- **Avec cache** : 1 batch = plusieurs scrapings = ~$0.50-1.00, puis toutes les requêtes suivantes = **GRATUIT** pendant 7 jours

**Exemple** : 
- 100 requêtes sans cache = $5-10
- 1 batch (10 scrapings) + 100 requêtes avec cache = $0.50-1.00

## 📋 Fonctionnement

1. **Lancer un batch** : Scrape plusieurs recherches en une fois
2. **Sauvegarde automatique** : Les résultats sont stockés dans `backend/alibaba_cache.db`
3. **Cache automatique** : L'API vérifie d'abord le cache avant d'appeler Apify
4. **Expiration** : Le cache est valide pendant 7 jours

## 🚀 Utilisation

### 1. Lancer un batch de scrapings

```bash
cd backend
py batch_scraper.py
```

Le script va :
- Scraper toutes les recherches définies dans `SEARCHES`
- Sauvegarder les résultats dans la DB
- Afficher un résumé

### 2. Personnaliser les recherches

Éditez `backend/batch_scraper.py` et modifiez la liste `SEARCHES` :

```python
SEARCHES = [
    {"type": "keyword", "valeur": "smartphone", "limit": 50},
    {"type": "keyword", "valeur": "votre-recherche", "limit": 50},
    {"type": "category", "valeur": "electronics", "limit": 50},
    # Ajoutez vos recherches ici
]
```

### 3. L'API utilise automatiquement le cache

Une fois le batch lancé, toutes les requêtes API utiliseront le cache :

```bash
# Ces requêtes utiliseront le cache (gratuit)
curl http://localhost:8000/api/veille-alibaba?terme=smartphone
curl http://localhost:8000/api/veille-alibaba?categorie=electronics
```

## 📊 Gestion du Cache

### Voir les recherches en cache

Le script batch affiche automatiquement les recherches déjà en cache.

### Durée de validité

- **Par défaut** : 7 jours
- Modifiable dans `backend/database.py` : `CACHE_DURATION_DAYS`

### Nettoyage automatique

Le cache expiré est automatiquement nettoyé :
- Au lancement d'un nouveau batch
- Vous pouvez aussi le nettoyer manuellement (voir code dans `database.py`)

## 🔧 Configuration

### Base de données

- **Fichier** : `backend/alibaba_cache.db` (SQLite)
- **Tables** :
  - `produits_alibaba` : Stocke les produits
  - `recherches_alibaba` : Stocke les métadonnées des recherches

### Durée du cache

Modifiez dans `backend/database.py` :

```python
CACHE_DURATION_DAYS = 7  # Changez ici (en jours)
```

## 📝 Exemple Complet

### Étape 1 : Lancer un batch

```bash
cd backend
py batch_scraper.py
```

**Sortie** :
```
🚀 BATCH SCRAPING ALIBABA
============================================================

🧹 Nettoyage du cache expiré...

📦 Recherches déjà en cache: 0

[1/8] Scraping: keyword=smartphone (limit: 50)
------------------------------------------------------------
🚀 Lancement du scraper Apify pour Alibaba...
✅ Run Apify lancé: abc123
⏳ Attente des résultats...
✅ Scraping terminé avec succès
📦 50 résultats récupérés depuis Apify
✅ 50 produits convertis et prêts
✅ 50 produits sauvegardés dans la DB (recherche: keyword=smartphone)
✅ 50 produits scrapés et sauvegardés

...

📊 RÉSUMÉ
============================================================
✅ Produits scrapés: 400
💾 Produits sauvegardés: 400
❌ Erreurs: 0

💡 Les produits sont maintenant en cache dans la DB
💡 L'API utilisera le cache au lieu de lancer de nouveaux scrapings
```

### Étape 2 : Utiliser l'API (gratuit maintenant)

```bash
# Ces requêtes utilisent le cache (gratuit)
curl http://localhost:8000/api/veille-alibaba?terme=smartphone
curl http://localhost:8000/api/veille-alibaba?terme=laptop
```

## ⚠️ Notes Importantes

1. **Premier lancement** : Le batch peut prendre 10-20 minutes (selon le nombre de recherches)
2. **Coûts Apify** : Un batch de 10 recherches = ~$0.50-1.00
3. **Cache expiré** : Après 7 jours, il faudra relancer un batch
4. **Nouvelles recherches** : Si vous cherchez quelque chose qui n'est pas en cache, Apify sera appelé (et sauvegardé automatiquement)

## 🎯 Stratégie Recommandée

1. **Lancer un batch hebdomadaire** avec vos recherches principales
2. **Ajouter des recherches** au fur et à mesure dans le batch
3. **Surveiller les coûts** Apify dans votre console
4. **Ajuster la durée du cache** selon vos besoins

## 🔍 Vérifier le Cache

Pour voir ce qui est en cache, vous pouvez utiliser Python :

```python
from database import get_all_cached_searches
recherches = get_all_cached_searches()
for r in recherches:
    print(f"{r['type']}={r['valeur']}: {r['nombre_produits']} produits")
```

## 💡 Astuces

- **Lancez le batch la nuit** pour éviter d'utiliser votre quota pendant la journée
- **Groupez les recherches similaires** pour optimiser
- **Augmentez le `limit`** dans le batch pour avoir plus de produits en cache
- **Réduisez `CACHE_DURATION_DAYS`** si vous voulez des données plus fraîches

