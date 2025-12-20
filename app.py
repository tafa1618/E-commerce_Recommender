# app.py
import streamlit as st
from ai import analyse_produit
from csv_generator import generate_csv

st.title("🧠 Analyse Produit E-commerce")

nom_produit = st.text_input("Nom du produit")
lien = st.text_input("Lien (Jumia / Alibaba)")

if st.button("Analyser"):
    if not nom_produit:
        st.warning("Entre un nom de produit")
    else:
        result = analyse_produit(nom_produit, lien)

        st.subheader("Décision")
        st.write(result["decision"])
        st.write(result["raison"])

        if result["decision"] == "GO":
            csv_file = generate_csv(result["produits_lookalike"])
            st.success("CSV généré avec succès")

            with open(csv_file, "rb") as f:
                st.download_button(
                    label="📥 Télécharger le CSV WooCommerce",
                    data=f,
                    file_name=csv_file,
                    mime="text/csv"
                )
