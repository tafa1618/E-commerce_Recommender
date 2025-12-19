import streamlit as st
from ai import analyse_produit, generate_csv

st.set_page_config(page_title="Product Go / No-Go IA", layout="centered")

st.title("🧠 Analyse Produit IA – MVP")
st.write("Colle un lien Jumia / Alibaba ou décris un produit.")

# ==========================
# INPUT UTILISATEUR
# ==========================
product_input = st.text_area(
    "🔗 Lien produit ou description",
    placeholder="Ex: https://www.jumia.sn/cheveux-naturels..."
)

# ==========================
# BOUTON ANALYSE
# ==========================
if st.button("Analyser le produit"):
    if product_input.strip() == "":
        st.warning("Veuillez entrer un produit.")
    else:
        with st.spinner("Analyse en cours..."):
            result = analyse_produit(product_input)

        st.subheader("📊 Résultat de l'analyse")
        st.json(result)

        # ==========================
        # SI GO → GENERATE CSV
        # ==========================
        if result.get("decision") == "GO":
            st.success("✅ Produit VALIDÉ – Génération du CSV")

            csv_path = generate_csv(
                produit_base = product_input,
                niche=result["niche"]
            )

            with open(csv_path, "rb") as f:
                st.download_button(
                    label="📥 Télécharger le CSV WordPress",
                    data=f,
                    file_name="produits_wordpress.csv",
                    mime="text/csv"
                )
        else:
            st.error("❌ Produit NON recommandé")
