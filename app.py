import streamlit as st
from ai import analyse_produit

st.title("🧠 Product Go / No-Go IA")

produit = st.text_input("Nom du produit ou lien Jumia / Alibaba")

if st.button("Analyser"):
    if produit:
        with st.spinner("Analyse en cours..."):
            result = analyse_produit(produit)
        st.success("Analyse terminée")
        st.write(result)
    else:
        st.warning("Entre un produit")
