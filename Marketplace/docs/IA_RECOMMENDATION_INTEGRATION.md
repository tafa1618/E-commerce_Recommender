# Intégration du Système de Recommandation IA

## Structure actuelle (prête pour l'IA)

La page `/shop` est conçue pour faciliter l'intégration future d'un système de recommandation IA.

### Points d'intégration

#### 1. Composant `ShopPageContent`
- **Fichier**: `Marketplace/components/ShopPageContent.tsx`
- **Fonction**: `getProducts()`
- **Point d'extension**: La fonction `getProducts()` peut être modifiée pour appeler un endpoint IA au lieu du backend standard

#### 2. API Backend
- **Endpoint**: `GET /api/marketplace/products`
- **Paramètres supportés**:
  - `limit`: Nombre de produits par page
  - `offset`: Pagination
  - `categorie`: Filtre par catégorie
  - `search`: Recherche textuelle
- **Extension future**: Ajouter `user_id`, `session_id`, `recommendation_type`

#### 3. Structure de données
- Les produits incluent déjà `validation_score` et `validated` pour le scoring
- Les événements sont tracés dans `product_events` (vues, clics, conversions)
- Structure ML-ready avec timestamps et contexte

### Intégration IA - Étapes futures

#### Étape 1: Endpoint de recommandation
```python
# backend/api.py
@app.get("/api/marketplace/products/recommended")
async def get_recommended_products(
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    limit: int = 24,
    offset: int = 0
):
    """
    Récupère les produits recommandés par l'IA
    Utilise les événements historiques pour personnaliser
    """
    # TODO: Appeler le modèle IA
    # - Analyser les événements utilisateur
    # - Calculer les scores de recommandation
    # - Retourner les produits triés par score
    pass
```

#### Étape 2: Modification du frontend
```typescript
// Marketplace/components/ShopPageContent.tsx
async function getProducts(...) {
  // Si user_id ou session_id disponible, utiliser l'endpoint IA
  if (userId || sessionId) {
    const url = `${apiUrl}/api/marketplace/products/recommended`
    // ... appel IA
  } else {
    // Fallback sur l'endpoint standard
  }
}
```

#### Étape 3: Tracking des interactions
- Les clics et vues sont déjà trackés via `/api/products/track`
- Ajouter le tracking des recommandations affichées
- Enregistrer les conversions pour améliorer le modèle

### Données disponibles pour l'entraînement

#### Table `product_events`
- `event_type`: view, click, add_to_cart, purchase, abandon
- `user_id`, `session_id`: Identification utilisateur
- `device_type`: mobile, desktop, tablet
- `source`: direct, search, social, referral
- `timestamp`: Horodatage précis
- `metadata_json`: Données contextuelles supplémentaires

#### Table `produits_marketplace`
- `validation_score`: Score Google Trends
- `niche_score`: Score de cohérence de niche
- `categorie`, `marque`: Caractéristiques produits
- `features_json`: Caractéristiques structurées

### Recommandations d'implémentation

1. **Collaborative Filtering**: Utiliser les événements utilisateur pour trouver des produits similaires
2. **Content-Based**: Utiliser les caractéristiques produits (catégorie, marque, score)
3. **Hybrid**: Combiner les deux approches
4. **Real-time**: Mettre à jour les recommandations en temps réel basé sur la session

### Performance

- La pagination est déjà implémentée (24 produits par page)
- Le cache Next.js (60s) peut être ajusté selon les besoins
- L'API backend peut être optimisée avec un cache Redis pour les recommandations

### Sécurité

- Ne jamais exposer les algorithmes IA côté client
- Valider tous les paramètres côté serveur
- Limiter le taux de requêtes pour éviter l'abus

