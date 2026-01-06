"""
Module pour générer des descriptions SEO percutantes pour le marketing
Peut améliorer une description existante ou créer une nouvelle à partir d'un nom de produit
"""
import os
import sys
from typing import Dict, Optional
import json
from openai import OpenAI
from dotenv import load_dotenv

# Configurer l'encodage UTF-8 pour Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Configuration OpenAI
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY est requise. Vérifiez votre fichier .env")

client = OpenAI(api_key=api_key)


def generer_description_seo_marketing(nom_produit: str, description_existante: Optional[str] = None) -> Dict:
    """
    Génère ou améliore une description SEO percutante pour un produit.
    
    Args:
        nom_produit: Nom du produit
        description_existante: Description existante à améliorer (optionnel)
        
    Returns:
        Dictionnaire avec description SEO, meta description et mots-clés
    """
    try:
        if description_existante:
            # Mode amélioration : améliorer la description existante
            prompt = f"""Tu es un expert SEO e-commerce et rédacteur marketing spécialisé dans les descriptions de produits percutantes.

AMÉLIORE cette description existante pour la rendre UNIQUE, PERCUTANTE et SEO-FRIENDLY:

Nom du produit: {nom_produit}
Description actuelle:
{description_existante}

Génère:
1. Une DESCRIPTION SEO AMÉLIORÉE (300-500 mots) qui:
   - Améliore et enrichit la description existante
   - Est UNIQUE (pas de copier-coller, réécriture créative)
   - Est optimisée pour les moteurs de recherche (SEO-friendly)
   - Contient naturellement les mots-clés importants
   - Décrit les caractéristiques, avantages et bénéfices de manière percutante
   - Utilise des balises HTML (h2, h3, ul, li, strong) pour structurer le contenu
   - Est adaptée au marché sénégalais/africain
   - Suscite l'envie et pousse à l'action
   - Inclut des informations sur l'utilisation, la qualité, les avantages uniques

2. Une META DESCRIPTION (150-160 caractères) accrocheuse pour les résultats de recherche

3. Des MOTS-CLÉS (10-15 mots-clés séparés par des virgules) pertinents et optimisés SEO

Format de réponse JSON:
{{
    "description_seo": "<h2>Titre</h2><p>Description améliorée et détaillée...</p>",
    "meta_description": "Description courte et accrocheuse pour les résultats de recherche",
    "mots_cles": "mot-clé1, mot-clé2, mot-clé3"
}}

La description doit être en français, adaptée au marché sénégalais, et optimisée pour le marketing e-commerce."""
        else:
            # Mode création : créer une nouvelle description à partir du nom
            prompt = f"""Tu es un expert SEO e-commerce et rédacteur marketing spécialisé dans les descriptions de produits percutantes.

CRÉE une description SEO-FRIENDLY UNIQUE et PERCUTANTE pour ce produit:

Nom du produit: {nom_produit}

Génère:
1. Une DESCRIPTION SEO (300-500 mots) qui:
   - Est UNIQUE et créative (pas de templates génériques)
   - Est optimisée pour les moteurs de recherche (SEO-friendly)
   - Contient naturellement les mots-clés importants
   - Décrit les caractéristiques, avantages et bénéfices de manière percutante
   - Utilise des balises HTML (h2, h3, ul, li, strong) pour structurer le contenu
   - Est adaptée au marché sénégalais/africain
   - Suscite l'envie et pousse à l'action
   - Inclut des informations sur l'utilisation, la qualité, les avantages uniques
   - Décrit qui est ce produit pour, pourquoi l'acheter, comment l'utiliser

2. Une META DESCRIPTION (150-160 caractères) accrocheuse pour les résultats de recherche

3. Des MOTS-CLÉS (10-15 mots-clés séparés par des virgules) pertinents et optimisés SEO

Format de réponse JSON:
{{
    "description_seo": "<h2>Titre</h2><p>Description détaillée et percutante...</p>",
    "meta_description": "Description courte et accrocheuse pour les résultats de recherche",
    "mots_cles": "mot-clé1, mot-clé2, mot-clé3"
}}

La description doit être en français, adaptée au marché sénégalais, et optimisée pour le marketing e-commerce."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Tu es un expert SEO e-commerce et rédacteur web marketing spécialisé dans les descriptions de produits percutantes et optimisées pour les moteurs de recherche."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1200
        )
        
        # Extraire la réponse
        content = response.choices[0].message.content.strip()
        
        # Parser le JSON (peut être dans un bloc de code)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        try:
            result = json.loads(content)
        except json.JSONDecodeError:
            # Si le parsing échoue, créer une description par défaut
            if description_existante:
                result = {
                    "description_seo": f"<h2>{nom_produit}</h2><p>{description_existante}</p><p>Produit de qualité adapté au marché sénégalais.</p>",
                    "meta_description": f"{nom_produit} - Produit de qualité disponible au Sénégal.",
                    "mots_cles": f"{nom_produit}, produit, ecommerce, Sénégal"
                }
            else:
                result = {
                    "description_seo": f"<h2>{nom_produit}</h2><p>Découvrez ce produit exceptionnel adapté au marché sénégalais. Qualité garantie et livraison rapide.</p>",
                    "meta_description": f"{nom_produit} - Produit de qualité disponible au Sénégal.",
                    "mots_cles": f"{nom_produit}, produit, ecommerce, Sénégal"
                }
        
        return {
            "description_seo": result.get("description_seo", ""),
            "meta_description": result.get("meta_description", ""),
            "mots_cles": result.get("mots_cles", ""),
            "success": True
        }
        
    except Exception as e:
        print(f"❌ Erreur génération description SEO marketing: {e}")
        # Retourner une description par défaut
        return {
            "description_seo": f"<h2>{nom_produit}</h2><p>Produit de qualité disponible au Sénégal.</p>",
            "meta_description": f"{nom_produit} - Produit de qualité",
            "mots_cles": f"{nom_produit}, produit, ecommerce",
            "success": False,
            "error": str(e)
        }

