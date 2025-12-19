import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyse_produit(produit: str):
    prompt = f"""
    Tu es un expert e-commerce en Afrique.
    Analyse le produit suivant : {produit}

    Donne :
    - Verdict : GO ou NO-GO
    - Raisons (demande, concurrence, marge)
    - Quantité de test recommandée
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content
