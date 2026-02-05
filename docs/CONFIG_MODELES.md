# Configuration des Modèles GPT

## Modèle Actuel

**Modèle utilisé : `gpt-4o`**

Le modèle GPT-4o est le modèle le plus récent et puissant d'OpenAI. Il offre :
- ✅ Meilleure qualité de réponse
- ✅ Meilleure compréhension du contexte
- ✅ Génération de contenu plus précise
- ⚠️ Coût légèrement plus élevé que gpt-4o-mini

## Fichiers Modifiés

Le modèle est configuré dans les fichiers suivants :

1. **`ai.py`** (ligne ~191)
   - Analyse de produits et recommandations

2. **`backend/boutique_descriptions.py`** (ligne ~220)
   - Génération de descriptions SEO pour les produits de boutique

3. **`backend/marketing.py`** (ligne ~233)
   - Génération de descriptions marketing pour les campagnes

## Modèles Disponibles

### Options Recommandées

| Modèle | Description | Coût | Qualité |
|--------|-------------|------|---------|
| **gpt-4o** | Modèle le plus récent et puissant | Moyen | ⭐⭐⭐⭐⭐ |
| **gpt-4o-mini** | Version optimisée, plus rapide et moins chère | Faible | ⭐⭐⭐⭐ |
| **gpt-4-turbo** | Version précédente, très puissante | Élevé | ⭐⭐⭐⭐⭐ |
| **gpt-3.5-turbo** | Modèle plus ancien, moins cher | Très faible | ⭐⭐⭐ |

### Pour Changer le Modèle

1. Ouvrir les fichiers listés ci-dessus
2. Remplacer `model="gpt-4o"` par le modèle souhaité
3. Redémarrer le backend

**Exemple :**
```python
# Avant
model="gpt-4o"

# Après (pour utiliser gpt-4o-mini)
model="gpt-4o-mini"
```

## Recommandations

- **Pour la production** : `gpt-4o` (meilleur équilibre qualité/coût)
- **Pour les tests** : `gpt-4o-mini` (plus rapide et moins cher)
- **Pour les analyses complexes** : `gpt-4o` (meilleure qualité)

## Coûts Approximatifs

Les coûts varient selon l'utilisation. Consultez [OpenAI Pricing](https://openai.com/pricing) pour les tarifs actuels.

**Note :** Le modèle `gpt-4o` est généralement 2-3x plus cher que `gpt-4o-mini`, mais offre une qualité significativement meilleure.

