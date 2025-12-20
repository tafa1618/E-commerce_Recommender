import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from csv_generator import generate_csv

# =========================
# INIT
# =========================
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# =========================
# PROMPT IA
# =========================
SYSTEM_PROMPT = """
Tu es un expert e-commerce Afrique / Europe.

Tu dois analyser un produit et décider s'il est pertinent
de le vendre en ligne.

Réponds STRICTEMENT en JSON valide avec cette structure EXACTE :

{
  "decision": "GO" ou "NO_GO",
  "raison": "explication détaillée",
  "categorie": "categorie du produit",
  "produits_lookalike": [
    {
      "nom": "",
      "description": "",
      "prix_recommande": 0
    }
  ]
}

Règles :
- Si decision = NO_GO → produits_lookalike doit être une liste vide
- Si decision = GO →  10 produits qui peuvent se vendre ensemble avec notre produit
- Prix en FCFA
- Descriptions SEO friendly pour WordPress / WooCommerce
"""

# =========================
# ANALYSE PRODUIT
# =========================
def analyse_produit(nom_produit: str, lien: str | None = None):
    user_prompt = f"""
Produit à analyser : {nom_produit}
Lien (optionnel) : {lien}

Analyse le potentiel business (demande, concurrence, marge).
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3
    )

    content = response.choices[0].message.content

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        return {
            "decision": "ERREUR",
            "raison": "Réponse IA non exploitable",
            "categorie": "",
            "produits_lookalike": []
        }

    # Sécurisation des clés
    decision = data.get("decision", "NO_GO")
    raison = data.get("raison", "")
    categorie = data.get("categorie", "")
    produits = data.get("produits_lookalike", [])

    

    return {
        "produit": nom_produit,
        "decision": decision,
        "raison": raison,
        "categorie": categorie,
        "produits_lookalike": produits,
        
    }

