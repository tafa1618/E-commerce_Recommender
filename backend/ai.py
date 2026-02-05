import os
import json
import logging
from typing import Dict, List, Optional
from openai import OpenAI
from openai import APIError, RateLimitError, APIConnectionError
from dotenv import load_dotenv

# =========================
# CONFIGURATION LOGGING
# =========================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =========================
# INIT
# =========================
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    logger.error("OPENAI_API_KEY non trouvée dans les variables d'environnement")
    raise ValueError("OPENAI_API_KEY est requise. Vérifiez votre fichier .env")

client = OpenAI(api_key=api_key)

# =========================
# PROMPT IA
# =========================
SYSTEM_PROMPT = """
Tu es un expert e-commerce senior spécialisé en :
- cross-selling
- augmentation du panier moyen
- comportement client Afrique / Sénégal

Objectif :
Analyser un produit principal et recommander
des produits COMPLÉMENTAIRES (et non des variantes).

IMPORTANT :
- Les produits recommandés NE DOIVENT PAS être des variantes du produit principal
- Ils doivent être UTILISÉS AVEC le produit principal
- Logique : routine client, accessoires, entretien, amélioration de l'expérience

Réponds STRICTEMENT en JSON valide avec cette structure :

{
  "decision": "GO" ou "NO_GO",
  "raison": "analyse business détaillée",
  "categorie": "catégorie principale",
  "produits_lookalike": [
    {
      "nom": "",
      "description": "",
      "prix_recommande": 0,
      "type": "accessoire | entretien | complement | upsell",
      "image": "URL de l'image du produit (optionnel, peut être vide)",
      "lien_jumia": "URL Jumia du produit similaire (optionnel, peut être vide)"
    }
  ]
}

Règles :
- Si decision = NO_GO → produits_lookalike = []
- Si decision = GO → EXACTEMENT 10 produits complémentaires
- Prix en FCFA
- Descriptions SEO friendly WooCommerce
- Pas de répétition du produit principal

"""

# =========================
# VALIDATION DES DONNÉES
# =========================
def _valider_reponse_ia(data: Dict) -> bool:
    """
    Valide la structure de la réponse de l'IA.
    
    Args:
        data: Dictionnaire contenant la réponse de l'IA
        
    Returns:
        True si la réponse est valide, False sinon
    """
    if not isinstance(data, dict):
        return False
    
    decision = data.get("decision", "")
    produits = data.get("produits_lookalike", [])
    
    # Validation de la décision
    if decision not in ["GO", "NO_GO"]:
        logger.warning(f"Décision invalide: {decision}")
        return False
    
    # Validation des produits si GO
    if decision == "GO":
        if not isinstance(produits, list):
            logger.warning("produits_lookalike n'est pas une liste")
            return False
        
        if len(produits) != 10:
            logger.warning(f"Nombre de produits incorrect: {len(produits)} au lieu de 10")
            # On accepte quand même mais on log l'écart
        
        # Validation de la structure de chaque produit
        for i, produit in enumerate(produits):
            if not isinstance(produit, dict):
                logger.warning(f"Produit {i} n'est pas un dictionnaire")
                return False
            
            required_fields = ["nom", "description", "prix_recommande", "type"]
            for field in required_fields:
                if field not in produit:
                    logger.warning(f"Produit {i} manque le champ: {field}")
                    return False
            
            # Champs optionnels (image et lien_jumia)
            # Pas de validation stricte, mais on vérifie qu'ils sont des strings si présents
    
    return True


def _valider_produit(produit: Dict) -> Dict:
    """
    Valide et nettoie un produit recommandé.
    
    Args:
        produit: Dictionnaire contenant les informations d'un produit
        
    Returns:
        Dictionnaire validé et nettoyé
    """
    return {
        "nom": str(produit.get("nom", "")).strip(),
        "description": str(produit.get("description", "")).strip(),
        "prix_recommande": float(produit.get("prix_recommande", 0)) if produit.get("prix_recommande") else 0,
        "type": str(produit.get("type", "")).strip(),
        "image": str(produit.get("image", "")).strip() if produit.get("image") else "",
        "lien_jumia": str(produit.get("lien_jumia", "")).strip() if produit.get("lien_jumia") else ""
    }


# =========================
# ANALYSE PRODUIT
# =========================
def analyse_produit(nom_produit: str, lien: Optional[str] = None) -> Dict:
    """
    Analyse un produit et recommande des produits complémentaires via l'IA.
    
    Args:
        nom_produit: Nom du produit à analyser
        lien: Lien optionnel vers le produit (Jumia/Alibaba)
        
    Returns:
        Dictionnaire contenant:
        - produit: Nom du produit analysé
        - decision: "GO", "NO_GO" ou "ERREUR"
        - raison: Raison de la décision
        - categorie: Catégorie du produit
        - produits_lookalike: Liste des produits recommandés
    """
    if not nom_produit or not nom_produit.strip():
        logger.error("Nom de produit vide")
        return {
            "produit": "",
            "decision": "ERREUR",
            "raison": "Le nom du produit ne peut pas être vide",
            "categorie": "",
            "produits_lookalike": []
        }
    
    user_prompt = f"""
Produit à analyser : {nom_produit.strip()}
Lien (optionnel) : {lien if lien else "Non fourni"}

Analyse le potentiel business (demande, concurrence, marge).

Pour chaque produit recommandé, si possible :
- Fournis une URL d'image représentative du produit (si tu connais une image valide)
- Fournis un lien Jumia vers un produit similaire (format: https://www.jumia.sn/...)
- Si tu ne peux pas fournir ces informations, laisse les champs "image" et "lien_jumia" vides (chaînes vides "")
"""

    try:
        logger.info(f"Analyse du produit: {nom_produit}")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}  # Force le format JSON
        )

        content = response.choices[0].message.content
        
        if not content:
            logger.error("Réponse vide de l'API OpenAI")
            return {
                "produit": nom_produit,
                "decision": "ERREUR",
                "raison": "Réponse vide de l'API",
                "categorie": "",
                "produits_lookalike": []
            }

    except RateLimitError:
        logger.error("Limite de taux d'API atteinte")
        return {
            "produit": nom_produit,
            "decision": "ERREUR",
            "raison": "Limite de taux d'API atteinte. Veuillez réessayer plus tard.",
            "categorie": "",
            "produits_lookalike": []
        }
    except APIConnectionError:
        logger.error("Erreur de connexion à l'API")
        return {
            "produit": nom_produit,
            "decision": "ERREUR",
            "raison": "Erreur de connexion à l'API. Vérifiez votre connexion internet.",
            "categorie": "",
            "produits_lookalike": []
        }
    except APIError as e:
        logger.error(f"Erreur API OpenAI: {str(e)}")
        return {
            "produit": nom_produit,
            "decision": "ERREUR",
            "raison": f"Erreur API: {str(e)}",
            "categorie": "",
            "produits_lookalike": []
        }
    except Exception as e:
        logger.error(f"Erreur inattendue: {str(e)}")
        return {
            "produit": nom_produit,
            "decision": "ERREUR",
            "raison": f"Erreur inattendue: {str(e)}",
            "categorie": "",
            "produits_lookalike": []
        }

    # Parsing JSON
    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        logger.error(f"Erreur de parsing JSON: {str(e)}")
        logger.debug(f"Contenu reçu: {content[:200]}...")
        return {
            "produit": nom_produit,
            "decision": "ERREUR",
            "raison": "Réponse IA non exploitable (format JSON invalide)",
            "categorie": "",
            "produits_lookalike": []
        }

    # Validation de la structure
    if not _valider_reponse_ia(data):
        logger.warning("Réponse IA non conforme aux attentes")
        return {
            "produit": nom_produit,
            "decision": "ERREUR",
            "raison": "Réponse IA non conforme aux attentes",
            "categorie": "",
            "produits_lookalike": []
        }

    # Extraction et validation des données
    decision = data.get("decision", "NO_GO")
    raison = data.get("raison", "")
    categorie = data.get("categorie", "")
    produits_raw = data.get("produits_lookalike", [])

    # Validation et nettoyage des produits
    produits_valides = []
    for produit in produits_raw:
        try:
            produit_valide = _valider_produit(produit)
            produits_valides.append(produit_valide)
        except Exception as e:
            logger.warning(f"Erreur lors de la validation d'un produit: {str(e)}")
            continue

    logger.info(f"Analyse terminée: {decision} - {len(produits_valides)} produits recommandés")

    return {
        "produit": nom_produit.strip(),
        "decision": decision,
        "raison": raison.strip() if raison else "",
        "categorie": categorie.strip() if categorie else "",
        "produits_lookalike": produits_valides
    }

