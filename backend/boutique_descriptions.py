"""
Module pour générer des descriptions SEO-friendly pour les produits de boutique
via OpenAI avec système de cache pour économiser les appels API
"""
import os
import sys
from typing import List, Dict, Optional
import sqlite3
from datetime import datetime, timedelta
import json
import hashlib
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

# Configuration DB
DB_PATH = os.path.join(os.path.dirname(__file__), "boutique_descriptions_cache.db")
CACHE_DURATION_DAYS = 30  # Cache valide 30 jours pour les descriptions


def init_boutique_descriptions_db():
    """Initialise la base de données pour le cache des descriptions boutique."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table pour les descriptions générées
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS descriptions_boutique (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cache_key TEXT UNIQUE NOT NULL,
            produit_nom TEXT,
            produit_categorie TEXT,
            description_seo TEXT NOT NULL,
            meta_description TEXT,
            mots_cles TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP
        )
    """)
    
    # Index pour améliorer les performances
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_cache_key_boutique 
        ON descriptions_boutique(cache_key)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_expires_boutique 
        ON descriptions_boutique(expires_at)
    """)
    
    conn.commit()
    conn.close()
    print(f"✅ Base de données descriptions boutique initialisée: {DB_PATH}")


def generate_cache_key_boutique(produit: Dict) -> str:
    """
    Génère une clé de cache unique pour un produit.
    
    Args:
        produit: Dictionnaire du produit
        
    Returns:
        Clé de cache (hash)
    """
    # Utiliser nom, catégorie et marque pour générer la clé
    key_string = f"{produit.get('nom', '')}_{produit.get('categorie', '')}_{produit.get('marque', '')}"
    return hashlib.md5(key_string.encode()).hexdigest()


def get_cached_description_boutique(cache_key: str) -> Optional[Dict]:
    """
    Récupère une description depuis le cache s'elle est valide.
    
    Args:
        cache_key: Clé de cache
        
    Returns:
        Dictionnaire avec la description ou None si expirée/inexistante
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT description_seo, meta_description, mots_cles, created_at
            FROM descriptions_boutique
            WHERE cache_key = ? AND expires_at > datetime('now')
        """, (cache_key,))
        
        result = cursor.fetchone()
        
        if result:
            description_seo, meta_description, mots_cles, created_at = result
            print(f"✅ Description récupérée depuis le cache (créée le {created_at})")
            return {
                "description_seo": description_seo,
                "meta_description": meta_description or "",
                "mots_cles": mots_cles or "",
                "from_cache": True
            }
        
        return None
        
    except Exception as e:
        print(f"❌ Erreur récupération cache: {e}")
        return None
    finally:
        conn.close()


def save_description_boutique_to_cache(cache_key: str, produit: Dict, description_data: Dict):
    """
    Sauvegarde une description dans le cache.
    
    Args:
        cache_key: Clé de cache
        produit: Dictionnaire du produit
        description_data: Données de la description
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        expires_at = datetime.now() + timedelta(days=CACHE_DURATION_DAYS)
        
        cursor.execute("""
            INSERT OR REPLACE INTO descriptions_boutique
            (cache_key, produit_nom, produit_categorie, description_seo, meta_description, mots_cles, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            cache_key,
            produit.get('nom', ''),
            produit.get('categorie', ''),
            description_data.get('description_seo', ''),
            description_data.get('meta_description', ''),
            description_data.get('mots_cles', ''),
            expires_at.isoformat()
        ))
        
        conn.commit()
        print(f"✅ Description sauvegardée dans le cache")
        
    except Exception as e:
        print(f"❌ Erreur sauvegarde cache: {e}")
        conn.rollback()
    finally:
        conn.close()


def generer_description_seo(produit: Dict) -> Dict:
    """
    Génère une description SEO-friendly pour un produit via OpenAI.
    Utilise le cache pour éviter les appels API répétés.
    
    Args:
        produit: Dictionnaire contenant les infos du produit
        
    Returns:
        Dictionnaire avec description SEO, meta description et mots-clés
    """
    # Vérifier le cache d'abord
    cache_key = generate_cache_key_boutique(produit)
    cached = get_cached_description_boutique(cache_key)
    
    if cached:
        return cached
    
    # Si pas de cache, générer avec OpenAI
    try:
        nom = produit.get('nom', 'Produit')
        prix = produit.get('prix_texte', produit.get('prix', 'N/A'))
        categorie = produit.get('categorie', '')
        marque = produit.get('marque', '')
        
        # Construire le prompt pour une description SEO-friendly
        prompt = f"""Tu es un expert SEO e-commerce spécialisé dans WooCommerce et Shopify.
Génère une description SEO-friendly optimisée pour ce produit:

Nom: {nom}
Prix: {prix}
Catégorie: {categorie}
Marque: {marque if marque else 'Non spécifiée'}

Génère:
1. Une DESCRIPTION SEO (300-500 mots) qui:
   - Est optimisée pour les moteurs de recherche
   - Contient naturellement les mots-clés importants
   - Décrit les caractéristiques, avantages et bénéfices
   - Utilise des balises HTML (h2, h3, ul, li, strong) pour structurer le contenu
   - Est adaptée au marché sénégalais/africain
   - Inclut des informations sur l'utilisation, la qualité, les garanties

2. Une META DESCRIPTION (150-160 caractères) pour les résultats de recherche

3. Des MOTS-CLÉS (10-15 mots-clés séparés par des virgules) pertinents

Format de réponse JSON:
{{
    "description_seo": "<h2>Titre</h2><p>Description détaillée...</p>",
    "meta_description": "Description courte pour les résultats de recherche",
    "mots_cles": "mot-clé1, mot-clé2, mot-clé3"
}}

La description doit être en français, adaptée au marché sénégalais, et optimisée pour WooCommerce/Shopify."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Tu es un expert SEO e-commerce et rédacteur web spécialisé dans les descriptions de produits pour WooCommerce et Shopify."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
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
            result = {
                "description_seo": f"<h2>{nom}</h2><p>Découvrez ce produit exceptionnel disponible au prix de {prix}. {categorie if categorie else 'Produit de qualité'} adapté au marché sénégalais.</p>",
                "meta_description": f"{nom} - {prix}. {categorie if categorie else 'Produit de qualité'} disponible au Sénégal.",
                "mots_cles": f"{nom}, {categorie if categorie else 'produit'}, {marque if marque else 'ecommerce'}, Sénégal"
            }
        
        description_data = {
            "description_seo": result.get("description_seo", ""),
            "meta_description": result.get("meta_description", ""),
            "mots_cles": result.get("mots_cles", ""),
            "from_cache": False
        }
        
        # Sauvegarder dans le cache
        save_description_boutique_to_cache(cache_key, produit, description_data)
        
        return description_data
        
    except Exception as e:
        print(f"❌ Erreur génération description: {e}")
        # Retourner une description par défaut
        return {
            "description_seo": f"<h2>{produit.get('nom', 'Produit')}</h2><p>Produit de qualité disponible au prix de {produit.get('prix_texte', 'N/A')}.</p>",
            "meta_description": f"{produit.get('nom', 'Produit')} - {produit.get('prix_texte', 'N/A')}",
            "mots_cles": f"{produit.get('nom', 'produit')}, {produit.get('categorie', '')}",
            "from_cache": False,
            "error": str(e)
        }


def generer_descriptions_batch_boutique(produits: List[Dict]) -> List[Dict]:
    """
    Génère des descriptions SEO pour plusieurs produits en batch.
    Optimisé pour utiliser le cache au maximum.
    
    Args:
        produits: Liste de produits
        
    Returns:
        Liste de dictionnaires avec descriptions pour chaque produit
    """
    resultats = []
    
    for produit in produits:
        description = generer_description_seo(produit)
        resultats.append({
            "produit": produit,
            "description": description
        })
    
    return resultats


# Initialiser la DB au chargement du module
init_boutique_descriptions_db()

