"""
Système de base de données pour cache les résultats Alibaba
Utilise SQLite pour stocker les produits scrapés
"""
import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "alibaba_cache.db")
CACHE_DURATION_DAYS = 7  # Durée de validité du cache (7 jours)


def init_database():
    """Initialise la base de données et crée les tables si nécessaire."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table pour stocker les produits
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS produits_alibaba (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prix REAL,
            prix_texte TEXT,
            lien TEXT,
            image TEXT,
            marque TEXT,
            categorie TEXT,
            note TEXT,
            moq TEXT,
            supplier TEXT,
            discount TEXT,
            source TEXT,
            product_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Table pour stocker les recherches/catégories
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recherches_alibaba (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_recherche TEXT NOT NULL,  -- 'keyword', 'category', 'general'
            valeur TEXT,  -- Le terme de recherche ou la catégorie
            nombre_produits INTEGER,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            UNIQUE(type_recherche, valeur)
        )
    """)
    
    # Index pour améliorer les performances
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_recherche 
        ON recherches_alibaba(type_recherche, valeur)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_expires 
        ON recherches_alibaba(expires_at)
    """)
    
    conn.commit()
    conn.close()
    print(f"✅ Base de données initialisée: {DB_PATH}")


def save_products_to_db(produits: List[Dict], recherche_type: str, recherche_valeur: str = ""):
    """
    Sauvegarde les produits dans la base de données.
    
    Args:
        produits: Liste de produits à sauvegarder
        recherche_type: Type de recherche ('keyword', 'category', 'general')
        recherche_valeur: Valeur de la recherche (terme ou catégorie)
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Calculer la date d'expiration
        expires_at = datetime.now() + timedelta(days=CACHE_DURATION_DAYS)
        
        # Supprimer l'ancienne recherche si elle existe
        cursor.execute("""
            DELETE FROM recherches_alibaba 
            WHERE type_recherche = ? AND valeur = ?
        """, (recherche_type, recherche_valeur))
        
        # Insérer la nouvelle recherche
        cursor.execute("""
            INSERT INTO recherches_alibaba 
            (type_recherche, valeur, nombre_produits, expires_at)
            VALUES (?, ?, ?, ?)
        """, (recherche_type, recherche_valeur, len(produits), expires_at))
        
        recherche_id = cursor.lastrowid
        
        # Supprimer les anciens produits de cette recherche
        # (on garde les produits dans la table pour référence, mais on les marque)
        
        # Insérer les nouveaux produits
        for produit in produits:
            cursor.execute("""
                INSERT INTO produits_alibaba 
                (nom, prix, prix_texte, lien, image, marque, categorie, note, moq, supplier, discount, source, product_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                produit.get("nom", ""),
                produit.get("prix", 0),
                produit.get("prix_texte", ""),
                produit.get("lien", ""),
                produit.get("image", ""),
                produit.get("marque", ""),
                produit.get("categorie", ""),
                produit.get("note", "N/A"),
                produit.get("moq", ""),
                produit.get("supplier", ""),
                produit.get("discount", ""),
                produit.get("source", "Alibaba (Cache)"),
                produit.get("product_id", "")
            ))
        
        conn.commit()
        print(f"✅ {len(produits)} produits sauvegardés dans la DB (recherche: {recherche_type}={recherche_valeur})")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erreur sauvegarde DB: {e}")
        raise
    finally:
        conn.close()


def get_products_from_db(
    recherche_type: str, 
    recherche_valeur: str = "", 
    limit: int = 20
) -> Optional[List[Dict]]:
    """
    Récupère les produits depuis la base de données si le cache est valide.
    
    Args:
        recherche_type: Type de recherche ('keyword', 'category', 'general')
        recherche_valeur: Valeur de la recherche
        limit: Nombre maximum de produits
        
    Returns:
        Liste de produits ou None si le cache est expiré/inexistant
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Vérifier si la recherche existe et n'est pas expirée
        cursor.execute("""
            SELECT id, nombre_produits, expires_at 
            FROM recherches_alibaba 
            WHERE type_recherche = ? AND valeur = ?
        """, (recherche_type, recherche_valeur))
        
        result = cursor.fetchone()
        
        if not result:
            print(f"📭 Aucun cache trouvé pour {recherche_type}={recherche_valeur}")
            return None
        
        recherche_id, nombre_produits, expires_at_str = result
        expires_at = datetime.fromisoformat(expires_at_str)
        
        # Vérifier si le cache est expiré
        if datetime.now() > expires_at:
            print(f"⏰ Cache expiré pour {recherche_type}={recherche_valeur}")
            # Supprimer l'entrée expirée
            cursor.execute("""
                DELETE FROM recherches_alibaba 
                WHERE id = ?
            """, (recherche_id,))
            conn.commit()
            return None
        
        # Récupérer les produits associés à cette recherche
        # On récupère les produits les plus récents
        cursor.execute("""
            SELECT nom, prix, prix_texte, lien, image, marque, categorie, note, moq, supplier, discount, source, product_id
            FROM produits_alibaba
            WHERE created_at >= (
                SELECT scraped_at FROM recherches_alibaba WHERE id = ?
            )
            ORDER BY created_at DESC
            LIMIT ?
        """, (recherche_id, limit))
        
        rows = cursor.fetchall()
        
        if not rows:
            print(f"📭 Aucun produit trouvé dans le cache")
            return None
        
        # Convertir les résultats en dictionnaires
        produits = []
        for row in rows:
            produit = {
                "nom": row[0],
                "prix": row[1] or 0,
                "prix_texte": row[2] or "",
                "lien": row[3] or "",
                "image": row[4] or "",
                "marque": row[5] or "",
                "categorie": row[6] or "",
                "note": row[7] or "N/A",
                "moq": row[8] or "",
                "supplier": row[9] or "",
                "discount": row[10] or "",
                "source": row[11] or "Alibaba (Cache)",
                "product_id": row[12] or ""
            }
            produits.append(produit)
        
        print(f"✅ {len(produits)} produits récupérés depuis le cache")
        return produits
        
    except Exception as e:
        print(f"❌ Erreur récupération DB: {e}")
        return None
    finally:
        conn.close()


def get_all_cached_searches() -> List[Dict]:
    """
    Récupère toutes les recherches en cache.
    
    Returns:
        Liste des recherches avec leurs informations
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT type_recherche, valeur, nombre_produits, scraped_at, expires_at
            FROM recherches_alibaba
            WHERE expires_at > datetime('now')
            ORDER BY scraped_at DESC
        """)
        
        rows = cursor.fetchall()
        recherches = []
        
        for row in rows:
            recherches.append({
                "type": row[0],
                "valeur": row[1],
                "nombre_produits": row[2],
                "scraped_at": row[3],
                "expires_at": row[4]
            })
        
        return recherches
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return []
    finally:
        conn.close()


def clear_expired_cache():
    """Supprime les entrées de cache expirées."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            DELETE FROM recherches_alibaba 
            WHERE expires_at < datetime('now')
        """)
        
        deleted = cursor.rowcount
        conn.commit()
        
        if deleted > 0:
            print(f"🗑️ {deleted} entrées de cache expirées supprimées")
        
        return deleted
        
    except Exception as e:
        print(f"❌ Erreur nettoyage cache: {e}")
        return 0
    finally:
        conn.close()


# Initialiser la base de données au chargement du module
init_database()

