"""
Module pour générer des descriptifs marketing attractifs via OpenAI
avec système de cache pour économiser les appels API
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
DB_PATH = os.path.join(os.path.dirname(__file__), "marketing_cache.db")
CACHE_DURATION_DAYS = 30  # Cache valide 30 jours pour les descriptifs


def init_marketing_db():
    """Initialise la base de données pour le cache marketing."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table pour les descriptifs générés
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS descriptifs_marketing (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cache_key TEXT UNIQUE NOT NULL,
            produit_nom TEXT,
            produit_categorie TEXT,
            descriptif TEXT NOT NULL,
            hashtags TEXT,
            titre_publicitaire TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            nombre_produits INTEGER DEFAULT 1
        )
    """)
    
    # Table pour les campagnes
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS campagnes_facebook (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom_campagne TEXT NOT NULL,
            produits TEXT NOT NULL,  -- JSON array
            descriptifs TEXT,  -- JSON array
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Index pour améliorer les performances
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_cache_key 
        ON descriptifs_marketing(cache_key)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_expires 
        ON descriptifs_marketing(expires_at)
    """)
    
    conn.commit()
    conn.close()
    print(f"[OK] Base de donnees marketing initialisee: {DB_PATH}")


def generate_cache_key(produit: Dict, type_description: str = "standard") -> str:
    """
    Génère une clé de cache unique pour un produit.
    
    Args:
        produit: Dictionnaire du produit
        type_description: Type de description ("standard", "facebook", "hashtags")
        
    Returns:
        Clé de cache (hash)
    """
    # Utiliser nom, catégorie et type pour générer la clé
    key_string = f"{produit.get('nom', '')}_{produit.get('categorie', '')}_{type_description}"
    return hashlib.md5(key_string.encode()).hexdigest()


def get_cached_description(cache_key: str) -> Optional[Dict]:
    """
    Récupère un descriptif depuis le cache s'il est valide.
    
    Args:
        cache_key: Clé de cache
        
    Returns:
        Dictionnaire avec le descriptif ou None si expiré/inexistant
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT descriptif, hashtags, titre_publicitaire, created_at
            FROM descriptifs_marketing
            WHERE cache_key = ? AND expires_at > datetime('now')
        """, (cache_key,))
        
        result = cursor.fetchone()
        
        if result:
            descriptif, hashtags, titre, created_at = result
            print(f"[OK] Descriptif recupere depuis le cache (cree le {created_at})")
            return {
                "descriptif": descriptif,
                "hashtags": hashtags or "",
                "titre_publicitaire": titre or "",
                "from_cache": True
            }
        
        return None
        
    except Exception as e:
        print(f"[ERREUR] Erreur recuperation cache: {e}")
        return None
    finally:
        conn.close()


def save_description_to_cache(cache_key: str, produit: Dict, descriptif_data: Dict):
    """
    Sauvegarde un descriptif dans le cache.
    
    Args:
        cache_key: Clé de cache
        produit: Dictionnaire du produit
        descriptif_data: Données du descriptif (descriptif, hashtags, titre)
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        expires_at = datetime.now() + timedelta(days=CACHE_DURATION_DAYS)
        
        cursor.execute("""
            INSERT OR REPLACE INTO descriptifs_marketing
            (cache_key, produit_nom, produit_categorie, descriptif, hashtags, titre_publicitaire, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            cache_key,
            produit.get('nom', ''),
            produit.get('categorie', ''),
            descriptif_data.get('descriptif', ''),
            descriptif_data.get('hashtags', ''),
            descriptif_data.get('titre_publicitaire', ''),
            expires_at.isoformat()
        ))
        
        conn.commit()
        print(f"[OK] Descriptif sauvegarde dans le cache")
        
    except Exception as e:
        print(f"[ERREUR] Erreur sauvegarde cache: {e}")
        conn.rollback()
    finally:
        conn.close()


def generer_descriptif_marketing(produit: Dict, style: str = "attractif") -> Dict:
    """
    Génère un descriptif marketing attractif pour un produit via OpenAI.
    Utilise le cache pour éviter les appels API répétés.
    
    Args:
        produit: Dictionnaire contenant les infos du produit (nom, prix, catégorie, etc.)
        style: Style de description ("attractif", "professionnel", "vendeur")
        
    Returns:
        Dictionnaire avec descriptif, hashtags et titre publicitaire
    """
    # Vérifier le cache d'abord
    cache_key = generate_cache_key(produit, style)
    cached = get_cached_description(cache_key)
    
    if cached:
        return cached
    
    # Si pas de cache, générer avec OpenAI
    try:
        nom = produit.get('nom', 'Produit')
        prix = produit.get('prix_texte', produit.get('prix', 'N/A'))
        categorie = produit.get('categorie', '')
        marque = produit.get('marque', '')
        
        # Construire le prompt
        prompt = f"""Tu es un expert en marketing e-commerce pour le marché sénégalais.
Génère un descriptif marketing attractif pour Facebook Ads pour ce produit:

Nom: {nom}
Prix: {prix}
Catégorie: {categorie}
Marque: {marque if marque else 'Non spécifiée'}

Style demandé: {style}

Génère:
1. Un TITRE PUBLICITAIRE accrocheur (max 30 caractères)
2. Un DESCRIPTIF attractif (max 200 caractères) qui met en avant les bénéfices, utilise des emojis pertinents, et crée l'urgence
3. Des HASHTAGS pertinents (5-8 hashtags, format #hashtag)

Format de réponse JSON:
{{
    "titre_publicitaire": "...",
    "descriptif": "...",
    "hashtags": "#hashtag1 #hashtag2 ..."
}}

Le descriptif doit être adapté au marché sénégalais, utiliser le français, et être optimisé pour Facebook Ads."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Tu es un expert en marketing e-commerce et copywriting pour Facebook Ads."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=300
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
            # Si le parsing échoue, extraire manuellement
            result = {
                "titre_publicitaire": nom[:30] if len(nom) <= 30 else nom[:27] + "...",
                "descriptif": content[:200] if len(content) <= 200 else content[:197] + "...",
                "hashtags": f"#ecommerce #senegal #{categorie.lower().replace(' ', '') if categorie else 'produit'}"
            }
        
        descriptif_data = {
            "descriptif": result.get("descriptif", ""),
            "hashtags": result.get("hashtags", ""),
            "titre_publicitaire": result.get("titre_publicitaire", nom[:30]),
            "from_cache": False
        }
        
        # Sauvegarder dans le cache
        save_description_to_cache(cache_key, produit, descriptif_data)
        
        return descriptif_data
        
    except Exception as e:
        print(f"[ERREUR] Erreur generation descriptif: {e}")
        # Retourner un descriptif par défaut
        return {
            "descriptif": f"✨ {nom} - Découvrez ce produit exceptionnel ! Prix: {prix}",
            "hashtags": f"#ecommerce #senegal #{categorie.lower().replace(' ', '') if categorie else 'produit'}",
            "titre_publicitaire": nom[:30] if len(nom) <= 30 else nom[:27] + "...",
            "from_cache": False,
            "error": str(e)
        }


def generer_descriptifs_batch(produits: List[Dict], style: str = "attractif") -> List[Dict]:
    """
    Génère des descriptifs pour plusieurs produits.
    Optimisé pour utiliser le cache au maximum.
    
    Args:
        produits: Liste de produits
        style: Style de description
        
    Returns:
        Liste de dictionnaires avec descriptifs pour chaque produit
    """
    resultats = []
    
    for produit in produits:
        descriptif = generer_descriptif_marketing(produit, style)
        resultats.append({
            "produit": produit,
            "descriptif": descriptif
        })
    
    return resultats


def sauvegarder_campagne(nom_campagne: str, produits: List[Dict], descriptifs: List[Dict]):
    """
    Sauvegarde une campagne Facebook dans la base de données.
    
    Args:
        nom_campagne: Nom de la campagne
        produits: Liste des produits
        descriptifs: Liste des descriptifs correspondants
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        produits_json = json.dumps(produits, ensure_ascii=False)
        descriptifs_json = json.dumps(descriptifs, ensure_ascii=False)
        
        cursor.execute("""
            INSERT INTO campagnes_facebook (nom_campagne, produits, descriptifs, updated_at)
            VALUES (?, ?, ?, datetime('now'))
        """, (nom_campagne, produits_json, descriptifs_json))
        
        conn.commit()
        campagne_id = cursor.lastrowid
        print(f"[OK] Campagne '{nom_campagne}' sauvegardee (ID: {campagne_id})")
        return campagne_id
        
    except Exception as e:
        print(f"[ERREUR] Erreur sauvegarde campagne: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()


def get_campagnes() -> List[Dict]:
    """
    Récupère toutes les campagnes sauvegardées.
    
    Returns:
        Liste des campagnes
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, nom_campagne, produits, descriptifs, created_at, updated_at
            FROM campagnes_facebook
            ORDER BY updated_at DESC
        """)
        
        rows = cursor.fetchall()
        campagnes = []
        
        for row in rows:
            campagnes.append({
                "id": row[0],
                "nom_campagne": row[1],
                "produits": json.loads(row[2]) if row[2] else [],
                "descriptifs": json.loads(row[3]) if row[3] else [],
                "created_at": row[4],
                "updated_at": row[5]
            })
        
        return campagnes
        
    except Exception as e:
        print(f"[ERREUR] Erreur recuperation campagnes: {e}")
        return []
    finally:
        conn.close()


# Initialiser la DB au chargement du module
init_marketing_db()

