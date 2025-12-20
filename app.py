# app.py
import streamlit as st
from ai import analyse_produit
from csv_generator import generate_csv

st.title("🧠 Analyse Produit E-commerce")

# État partagé pour conserver le dernier résultat
if "analyse_result" not in st.session_state:
    st.session_state["analyse_result"] = None

nom_produit = st.text_input("Nom du produit")
lien = st.text_input("Lien (Jumia / Alibaba)")

# Bouton d'analyse
if st.button("Analyser"):
    if not nom_produit:
        st.warning("Entre un nom de produit")
    else:
        with st.spinner("Analyse en cours..."):
            st.session_state["analyse_result"] = analyse_produit(nom_produit, lien)

# Affichage du dernier résultat (même après un rerun)
result = st.session_state.get("analyse_result")

if result:
    st.subheader("Décision")
    st.write(result.get("decision", ""))
    st.write(result.get("raison", ""))

    if result.get("decision") == "GO":
        produits = result.get("produits_lookalike", [])

        if produits:
            st.subheader("Produits complémentaires proposés")
            st.dataframe(produits, use_container_width=True)

            # Génération du CSV seulement après visualisation
            if st.button("Générer le CSV WooCommerce"):
                csv_file = generate_csv(produits)
                st.success("CSV généré avec succès")

                with open(csv_file, "rb") as f:
                    st.download_button(
                        label="📥 Télécharger le CSV WooCommerce",
                        data=f,
                        file_name=csv_file,
                        mime="text/csv"
                    )
        else:
            st.info("Aucun produit complémentaire proposé par l'IA.")
    else:
        st.info("Décision IA : pas de génération de produits complémentaires.")
