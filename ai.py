import os
import json
import csv
from openai import OpenAI
from dotenv import load_dotenv

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

Réponds STRICTEMENT en JSON valide avec cette structure :

{
  "decision": "GO" ou "NO_GO",
  "raison": "explication courte",
  "produits_lookalike": [
    {
      "nom": "",
      "description": "",
      "prix_recommande": 0,
      "image_url": ""
    }
  ]
}

Règles :
- Si decision = NO_GO → produits_lookalike doit être une liste vide
- Si decision = GO → exactement 10 produits lookalike
- Prix en FCFA
- Descriptions SEO friendly (WordPress)
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
            "raison": "Réponse IA invalide",
            "produits_lookalike": []
        }

    # Si GO → générer CSV
    if data.get("decision") == "GO":
        generate_csv(data["produits_lookalike"])

    return data


# =========================
# GENERATION CSV WORDPRESS
# =========================
def generate_csv(produits):
    """
    Génère un CSV importable directement dans WooCommerce
    """
    filename = "produits_wordpress.csv"

    headers = [
        "Name",
        "Description",
        "Regular price",
        "Images"
    ]

    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)

        for p in produits:
            writer.writerow([
                p["nom"],
                p["description"],
                p["prix_recommande"],
                p["image_url"]
            ])

    return filename
