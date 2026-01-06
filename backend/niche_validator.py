"""
Module pour valider la cohérence de niche d'une boutique
Analyse les produits sélectionnés pour déterminer si ils forment une niche cohérente
"""
import os
import json
import logging
from typing import Dict, List, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Initialiser OpenAI
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY est requise. Vérifiez votre fichier .env")

client = OpenAI(api_key=api_key)

SYSTEM_PROMPT_NICHE = """
Tu es un expert e-commerce spécialisé dans l'analyse de niches de marché.

Ton rôle est d'analyser une sélection de produits et de déterminer :
1. Si ces produits forment une NICHE cohérente
2. Quelle est la niche identifiée
3. Le niveau de cohérence (score 0-100)
4. Des recommandations pour améliorer la niche

Une bonne niche :
- A un thème clair et cohérent (ex: "cosmétiques bio", "accessoires gaming", "décoration minimaliste")
- Les produits sont complémentaires et forment un ensemble logique
- Cible un public spécifique
- A un potentiel de cross-selling élevé

Réponds STRICTEMENT en JSON valide avec cette structure :

{
  "niche_identifiee": "nom de la niche (ex: 'Cosmétiques bio et naturels')",
  "score_coherence": 85,
  "niveau": "EXCELLENT" | "BON" | "MOYEN" | "FAIBLE" | "INCOHERENT",
  "analyse": "Analyse détaillée de la cohérence de la niche",
  "points_forts": ["point 1", "point 2"],
  "points_faibles": ["point 1", "point 2"],
  "recommandations": [
    {
      "type": "AJOUTER" | "RETIRER" | "MODIFIER",
      "produit": "nom du produit",
      "raison": "pourquoi cette recommandation"
    }
  ],
  "public_cible": "Description du public cible de cette niche",
  "potentiel_cross_selling": "Évaluation du potentiel de vente croisée"
}
"""


def analyser_niche(produits: List[Dict]) -> Dict:
    """
    Analyse une sélection de produits pour déterminer la cohérence de niche
    
    Args:
        produits: Liste de produits de la boutique
        
    Returns:
        Dictionnaire avec l'analyse de niche
    """
    if not produits or len(produits) == 0:
        return {
            "niche_identifiee": "Aucune niche",
            "score_coherence": 0,
            "niveau": "INCOHERENT",
            "analyse": "Aucun produit sélectionné",
            "points_forts": [],
            "points_faibles": ["Aucun produit dans la boutique"],
            "recommandations": [],
            "public_cible": "Non défini",
            "potentiel_cross_selling": "Non applicable"
        }
    
    if len(produits) < 3:
        return {
            "niche_identifiee": "En cours de définition",
            "score_coherence": 30,
            "niveau": "FAIBLE",
            "analyse": f"Seulement {len(produits)} produit(s) sélectionné(s). Une niche cohérente nécessite au moins 3-5 produits complémentaires.",
            "points_forts": [],
            "points_faibles": [f"Nombre insuffisant de produits ({len(produits)})"],
            "recommandations": [
                {
                    "type": "AJOUTER",
                    "produit": "Produits complémentaires",
                    "raison": "Ajoutez au moins 3-5 produits pour former une niche cohérente"
                }
            ],
            "public_cible": "Non défini",
            "potentiel_cross_selling": "Faible - pas assez de produits"
        }
    
    # Préparer les données des produits pour l'analyse
    produits_info = []
    for produit in produits:
        produits_info.append({
            "nom": produit.get("nom", ""),
            "categorie": produit.get("categorie", ""),
            "marque": produit.get("marque", ""),
            "prix": produit.get("prix", 0)
        })
    
    user_prompt = f"""
Analyse la cohérence de niche de cette sélection de produits :

Produits ({len(produits)} produits) :
{json.dumps(produits_info, ensure_ascii=False, indent=2)}

Détermine :
1. Si ces produits forment une niche cohérente
2. Le nom de la niche
3. Le score de cohérence (0-100)
4. Des recommandations pour améliorer la niche
"""
    
    try:
        logger.info(f"Analyse de niche pour {len(produits)} produits")
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_NICHE},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        
        if not content:
            raise ValueError("Réponse vide de l'API OpenAI")
        
        # Parser la réponse JSON
        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"Erreur parsing JSON: {e}")
            # Fallback
            return {
                "niche_identifiee": "Non identifiée",
                "score_coherence": 50,
                "niveau": "MOYEN",
                "analyse": "Erreur lors de l'analyse",
                "points_forts": [],
                "points_faibles": [],
                "recommandations": [],
                "public_cible": "Non défini",
                "potentiel_cross_selling": "Non évalué"
            }
        
        # Valider et nettoyer les données
        return {
            "niche_identifiee": data.get("niche_identifiee", "Non identifiée"),
            "score_coherence": int(data.get("score_coherence", 50)),
            "niveau": data.get("niveau", "MOYEN"),
            "analyse": data.get("analyse", ""),
            "points_forts": data.get("points_forts", []),
            "points_faibles": data.get("points_faibles", []),
            "recommandations": data.get("recommandations", []),
            "public_cible": data.get("public_cible", "Non défini"),
            "potentiel_cross_selling": data.get("potentiel_cross_selling", "Non évalué")
        }
        
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse de niche: {e}")
        return {
            "niche_identifiee": "Erreur d'analyse",
            "score_coherence": 0,
            "niveau": "INCOHERENT",
            "analyse": f"Erreur lors de l'analyse: {str(e)}",
            "points_forts": [],
            "points_faibles": ["Erreur technique"],
            "recommandations": [],
            "public_cible": "Non défini",
            "potentiel_cross_selling": "Non évalué"
        }


def get_niche_color(niveau: str) -> str:
    """Retourne la couleur associée au niveau de niche"""
    colors = {
        "EXCELLENT": "#10b981",  # Vert
        "BON": "#3b82f6",        # Bleu
        "MOYEN": "#f59e0b",      # Orange
        "FAIBLE": "#ef4444",     # Rouge
        "INCOHERENT": "#6b7280"  # Gris
    }
    return colors.get(niveau, "#6b7280")


def get_niche_emoji(niveau: str) -> str:
    """Retourne l'emoji associé au niveau de niche"""
    emojis = {
        "EXCELLENT": "🟢",
        "BON": "🔵",
        "MOYEN": "🟡",
        "FAIBLE": "🟠",
        "INCOHERENT": "🔴"
    }
    return emojis.get(niveau, "⚪")

