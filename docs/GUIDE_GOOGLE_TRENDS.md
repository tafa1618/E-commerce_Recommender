# Guide Google Trends - Analyse des Tendances

## 📋 Description

Le module Google Trends permet d'analyser les tendances de recherche pour vos produits et d'identifier les opportunités de marché.

## 🔧 Installation

### 1. Installer la dépendance

```bash
pip install pytrends
```

Ou si vous utilisez `requirements.txt` :

```bash
pip install -r requirements.txt
```

### 2. Vérifier l'installation

```bash
python -c "import pytrends; print('✅ pytrends installé')"
```

## 🚀 Utilisation

### Interface Web

1. Accédez à la page **"📈 Google Trends"** dans la navigation
2. Entrez jusqu'à 5 mots-clés à analyser
3. Sélectionnez la période et le pays/région
4. Cliquez sur **"📊 Analyser les tendances"** ou **"⚖️ Comparer les mots-clés"**

### Endpoints API

#### 1. Analyser les tendances
```http
POST /api/trends
Content-Type: application/json

{
  "keywords": ["perruque", "cheveux"],
  "timeframe": "today 12-m",
  "geo": "SN",
  "cat": 0
}
```

#### 2. Comparer des mots-clés
```http
POST /api/trends/compare
Content-Type: application/json

{
  "keywords": ["perruque", "cheveux", "postiche"],
  "timeframe": "today 12-m",
  "geo": "SN"
}
```

#### 3. Analyser les tendances saisonnières
```http
POST /api/trends/seasonal
Content-Type: application/json

{
  "keyword": "perruque",
  "years": 3,
  "geo": "SN"
}
```

#### 4. Obtenir les sujets liés
```http
GET /api/trends/related/{keyword}?geo=SN
```

## 📊 Fonctionnalités

### 1. Analyse des tendances
- Graphique d'évolution sur la période sélectionnée
- Statistiques (moyenne, maximum, minimum)
- Requêtes liées (top et en hausse)

### 2. Comparaison de mots-clés
- Comparaison de l'intérêt moyen
- Identification des tendances (hausse/baisse/stable)
- Classement par popularité

### 3. Analyse saisonnière
- Identification des périodes de forte demande
- Comparaison année sur année
- Prévision des pics saisonniers

### 4. Sujets liés
- Découverte de nouveaux mots-clés pertinents
- Identification des tendances émergentes

## 🌍 Codes pays disponibles

- `SN` - Sénégal
- `FR` - France
- `US` - États-Unis
- `GB` - Royaume-Uni
- `CM` - Cameroun
- `CI` - Côte d'Ivoire
- `ML` - Mali
- `BF` - Burkina Faso

## ⏱️ Périodes disponibles

- `today 1-m` - Dernier mois
- `today 3-m` - 3 derniers mois
- `today 12-m` - 12 derniers mois (recommandé)
- `today 5-y` - 5 dernières années

## 💡 Cas d'usage

### 1. Validation de marché
Avant de lancer un produit, vérifiez si la demande est en hausse :
- Recherchez le mot-clé principal
- Analysez la tendance (hausse/baisse)
- Comparez avec des produits similaires

### 2. Optimisation SEO
- Identifiez les requêtes en hausse
- Trouvez des mots-clés liés pertinents
- Adaptez votre contenu aux tendances

### 3. Planification saisonnière
- Identifiez les périodes de forte demande
- Planifiez vos campagnes marketing
- Anticipez les pics de vente

### 4. Veille concurrentielle
- Comparez plusieurs produits
- Identifiez les opportunités de marché
- Suivez l'évolution de la demande

## ⚠️ Limitations

- Maximum 5 mots-clés par requête
- Google Trends peut limiter le nombre de requêtes
- Les données sont relatives (0-100), pas absolues
- Certaines régions peuvent avoir des données limitées

## 🔍 Exemple d'utilisation

### Scénario : Analyser le marché des perruques au Sénégal

1. **Analyser les tendances** :
   - Mots-clés : `["perruque", "cheveux", "postiche"]`
   - Période : `today 12-m`
   - Pays : `SN`

2. **Comparer les termes** :
   - Identifier lequel est le plus recherché
   - Voir la tendance (hausse/baisse)

3. **Analyser la saisonnalité** :
   - Identifier les périodes de forte demande
   - Planifier les stocks

4. **Découvrir les requêtes liées** :
   - Trouver de nouveaux mots-clés
   - Identifier les tendances émergentes

## 🛠️ Dépannage

### Erreur : "pytrends n'est pas installé"
```bash
pip install pytrends
```

### Erreur : "Rate limit exceeded"
- Attendez quelques minutes entre les requêtes
- Réduisez le nombre de mots-clés

### Pas de données pour une région
- Essayez une région plus large (ex: `FR` au lieu d'une ville)
- Vérifiez que le mot-clé existe dans cette région

## 📚 Ressources

- [Documentation pytrends](https://github.com/GeneralMills/pytrends)
- [Google Trends](https://trends.google.com/)

