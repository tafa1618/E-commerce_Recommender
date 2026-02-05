# Configuration Apify pour Alibaba

## Qu'est-ce qu'Apify ?

Apify est une plateforme qui permet d'exécuter des scrapers web pré-construits. Le scraper Alibaba sur Apify est maintenu et mis à jour régulièrement.

**Scraper utilisé**: https://apify.com/piotrv1001/alibaba-listings-scraper

## Étapes pour configurer Apify

### 1. Créer un compte Apify

1. Allez sur https://apify.com/
2. Cliquez sur "Sign Up" (gratuit)
3. Créez votre compte (email ou GitHub)

### 2. Obtenir votre Token API

1. Une fois connecté, allez dans **Settings** → **Integrations**
2. Ou allez directement sur https://console.apify.com/account/integrations
3. Dans la section **API tokens**, cliquez sur **Create token**
4. Donnez un nom à votre token (ex: "E-commerce Recommender")
5. Copiez le token (il ne sera affiché qu'une seule fois !)

### 3. Configurer le token dans le projet

Créez ou modifiez le fichier `.env` à la racine du projet :

```env
# Token Apify
APIFY_TOKEN=votre_token_apify_ici
```

**Important :**
- Ne commitez JAMAIS le fichier `.env` dans Git
- Le fichier `.env` est déjà dans `.gitignore`
- Gardez votre token secret

### 4. Vérifier la configuration

Redémarrez le backend et testez l'endpoint :
```bash
curl http://localhost:8000/api/veille-alibaba?terme=smartphone&limit=5
```

Si le token est correct, vous devriez voir des produits réels d'Alibaba.

## Coûts Apify

### Plan Gratuit
- **$5 de crédits gratuits** par mois
- Suffisant pour ~100-200 scrapings par mois (selon la taille)
- Parfait pour tester et usage personnel

### Plans Payants
- **Starter**: $49/mois - 1000 scrapings
- **Team**: $499/mois - 10,000 scrapings
- Plus d'infos: https://apify.com/pricing

## Fonctionnement

1. **Lancement**: Le backend lance un "run" sur Apify avec vos paramètres de recherche
2. **Scraping**: Apify exécute le scraper Alibaba (peut prendre 30 secondes à 2 minutes)
3. **Récupération**: Le backend récupère les résultats depuis Apify
4. **Conversion**: Les données sont converties au format de l'application

## Avantages d'Apify

✅ **Facile à utiliser** - Pas besoin de gérer le scraping
✅ **Fiable** - Le scraper est maintenu et mis à jour
✅ **Pas de blocage** - Apify gère les proxies et rotations
✅ **Données complètes** - Plus d'informations que le scraping basique

## Dépannage

### Erreur "Token Apify non configuré"
- Vérifiez que le fichier `.env` existe
- Vérifiez que la variable `APIFY_TOKEN` est correctement nommée
- Redémarrez le backend après modification du `.env`

### Erreur "Invalid token"
- Vérifiez que votre token est correct
- Vérifiez que le token n'a pas expiré
- Créez un nouveau token si nécessaire

### Erreur "Insufficient credits"
- Vous avez utilisé tous vos crédits gratuits
- Attendez le renouvellement mensuel ou passez à un plan payant

### Le scraping prend trop de temps
- C'est normal, Apify peut prendre 1-2 minutes
- Le timeout est de 5 minutes par défaut
- Vérifiez les logs du backend pour voir la progression

### Pas de résultats
- Vérifiez que votre terme de recherche est valide
- Essayez un terme plus général
- Vérifiez les logs Apify dans votre console

## Fallback automatique

Si Apify n'est pas configuré ou rencontre une erreur, le système utilise automatiquement le scraper web en fallback (qui peut être bloqué par Alibaba).

## Documentation

- **Apify Console**: https://console.apify.com/
- **Documentation API**: https://docs.apify.com/api/v2
- **Scraper Alibaba**: https://apify.com/piotrv1001/alibaba-listings-scraper

