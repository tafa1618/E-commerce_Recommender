"""
Module pour gérer la base de données du marketplace
Stocke les produits publiés avec toutes leurs métadonnées pour ML-ready
"""
import os
import sys
import sqlite3
from typing import List, Dict, Optional
from datetime import datetime
import json

# Configurer l'encodage UTF-8 pour Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = os.path.join(os.path.dirname(__file__), "marketplace.db")


def init_marketplace_db():
    """Initialise la base de données du marketplace avec schéma ML-ready"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table produits avec tous les champs nécessaires pour ML
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS produits_marketplace (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT UNIQUE NOT NULL,  -- ID unique du produit
            nom TEXT NOT NULL,
            description_seo TEXT,
            meta_description TEXT,
            mots_cles TEXT,
            prix REAL NOT NULL,
            prix_texte TEXT,
            image TEXT,
            lien TEXT,
            categorie TEXT,
            marque TEXT,
            note TEXT,
            remise TEXT,
            source TEXT,  -- Jumia, Alibaba, Manuel
            
            -- Métadonnées pour ML
            validation_score INTEGER,  -- Score Google Trends
            validated BOOLEAN DEFAULT 0,
            niche_score REAL,
            niche_level TEXT,
            
            -- Traçabilité
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            published_at TIMESTAMP,
            status TEXT DEFAULT 'active',  -- active, draft, archived
            
            -- Contexte pour ML
            source_channel TEXT,  -- web, api, import
            user_id TEXT,
            session_id TEXT,
            
            -- Données structurées pour ML
            features_json TEXT,  -- JSON avec caractéristiques structurées
            events_json TEXT  -- JSON avec historique d'événements
        )
    """)
    
    # Table pour les événements (vues, clics, conversions) - ML-ready
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS product_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT NOT NULL,
            event_type TEXT NOT NULL,  -- view, click, add_to_cart, purchase, abandon
            user_id TEXT,
            session_id TEXT,
            device_type TEXT,  -- mobile, desktop, tablet
            source TEXT,  -- direct, search, social, referral
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata_json TEXT,  -- JSON avec données contextuelles
            FOREIGN KEY (product_id) REFERENCES produits_marketplace(product_id)
        )
    """)
    
    # Index pour performance et requêtes ML
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_product_id ON produits_marketplace(product_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_status ON produits_marketplace(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_category ON produits_marketplace(categorie)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_created_at ON produits_marketplace(created_at)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_product ON product_events(product_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_type ON product_events(event_type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON product_events(timestamp)")
    
    conn.commit()
    conn.close()
    print(f"✅ Base de données marketplace initialisée: {DB_PATH}")


def generate_product_id(produit: Dict) -> str:
    """Génère un ID unique pour un produit basé sur ses caractéristiques"""
    import hashlib
    key_string = f"{produit.get('nom', '')}_{produit.get('lien', '')}_{produit.get('categorie', '')}"
    return hashlib.md5(key_string.encode()).hexdigest()


def publier_produit(produit: Dict, description_seo: Optional[Dict] = None, 
                   validation_data: Optional[Dict] = None,
                   niche_data: Optional[Dict] = None,
                   user_id: Optional[str] = None,
                   session_id: Optional[str] = None) -> Optional[str]:
    """
    Publie un produit dans le marketplace avec toutes ses métadonnées
    
    Args:
        produit: Dictionnaire du produit
        description_seo: Description SEO générée
        validation_data: Données de validation Google Trends
        niche_data: Données d'analyse de niche
        user_id: ID de l'utilisateur (si disponible)
        session_id: ID de session (si disponible)
        
    Returns:
        product_id si succès, None sinon
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        product_id = generate_product_id(produit)
        
        # Vérifier si le produit existe déjà
        cursor.execute("SELECT id FROM produits_marketplace WHERE product_id = ?", (product_id,))
        existing = cursor.fetchone()
        
        if existing:
            # Mettre à jour le produit existant
            cursor.execute("""
                UPDATE produits_marketplace
                SET nom = ?, description_seo = ?, meta_description = ?, mots_cles = ?,
                    prix = ?, prix_texte = ?, image = ?, lien = ?, categorie = ?, marque = ?,
                    note = ?, remise = ?, source = ?,
                    validation_score = ?, validated = ?,
                    niche_score = ?, niche_level = ?,
                    updated_at = CURRENT_TIMESTAMP,
                    features_json = ?
                WHERE product_id = ?
            """, (
                produit.get('nom', ''),
                description_seo.get('description_seo', '') if description_seo else '',
                description_seo.get('meta_description', '') if description_seo else '',
                description_seo.get('mots_cles', '') if description_seo else '',
                produit.get('prix', 0),
                produit.get('prix_texte', ''),
                produit.get('image', ''),
                produit.get('lien', ''),
                produit.get('categorie', ''),
                produit.get('marque', ''),
                produit.get('note', ''),
                produit.get('remise', ''),
                produit.get('source', 'Jumia'),
                validation_data.get('score', 0) if validation_data else None,
                bool(validation_data.get('validated', False)) if validation_data else False,
                niche_data.get('score', None) if niche_data else None,
                niche_data.get('level', None) if niche_data else None,
                json.dumps({
                    'validation': validation_data,
                    'niche': niche_data,
                    'original_product': produit
                }, ensure_ascii=False),
                product_id
            ))
            print(f"✅ Produit mis à jour: {product_id}")
        else:
            # Insérer un nouveau produit
            features_json = json.dumps({
                'validation': validation_data,
                'niche': niche_data,
                'original_product': produit
            }, ensure_ascii=False)
            
            cursor.execute("""
                INSERT INTO produits_marketplace (
                    product_id, nom, description_seo, meta_description, mots_cles,
                    prix, prix_texte, image, lien, categorie, marque, note, remise, source,
                    validation_score, validated, niche_score, niche_level,
                    published_at, status, source_channel, user_id, session_id, features_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'active', 'web', ?, ?, ?)
            """, (
                product_id,
                produit.get('nom', ''),
                description_seo.get('description_seo', '') if description_seo else '',
                description_seo.get('meta_description', '') if description_seo else '',
                description_seo.get('mots_cles', '') if description_seo else '',
                produit.get('prix', 0),
                produit.get('prix_texte', ''),
                produit.get('image', ''),
                produit.get('lien', ''),
                produit.get('categorie', ''),
                produit.get('marque', ''),
                produit.get('note', ''),
                produit.get('remise', ''),
                produit.get('source', 'Jumia'),
                validation_data.get('score', 0) if validation_data else None,
                bool(validation_data.get('validated', False)) if validation_data else False,
                niche_data.get('score', None) if niche_data else None,
                niche_data.get('level', None) if niche_data else None,
                user_id,
                session_id,
                features_json
            ))
            print(f"✅ Produit publié: {product_id}")
        
        conn.commit()
        return product_id
        
    except Exception as e:
        print(f"❌ Erreur publication produit: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()


def get_produits_marketplace(status: str = 'active', limit: Optional[int] = None) -> List[Dict]:
    """Récupère les produits du marketplace"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        query = "SELECT * FROM produits_marketplace WHERE status = ? ORDER BY published_at DESC"
        if limit:
            query += f" LIMIT {limit}"
        
        cursor.execute(query, (status,))
        rows = cursor.fetchall()
        
        # Récupérer les noms de colonnes
        columns = [description[0] for description in cursor.description]
        
        produits = []
        for row in rows:
            produit = dict(zip(columns, row))
            # Parser les JSON
            if produit.get('features_json'):
                try:
                    produit['features'] = json.loads(produit['features_json'])
                except:
                    produit['features'] = {}
            if produit.get('events_json'):
                try:
                    produit['events'] = json.loads(produit['events_json'])
                except:
                    produit['events'] = []
            produits.append(produit)
        
        return produits
        
    except Exception as e:
        print(f"❌ Erreur récupération produits: {e}")
        return []
    finally:
        conn.close()


def enregistrer_evenement(product_id: str, event_type: str, user_id: Optional[str] = None,
                          session_id: Optional[str] = None, device_type: Optional[str] = None,
                          source: Optional[str] = None, metadata: Optional[Dict] = None):
    """Enregistre un événement pour le tracking ML"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        metadata_json = json.dumps(metadata, ensure_ascii=False) if metadata else None
        
        cursor.execute("""
            INSERT INTO product_events (product_id, event_type, user_id, session_id, device_type, source, metadata_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (product_id, event_type, user_id, session_id, device_type, source, metadata_json))
        
        conn.commit()
        print(f"✅ Événement enregistré: {event_type} pour {product_id}")
        
    except Exception as e:
        print(f"❌ Erreur enregistrement événement: {e}")
        conn.rollback()
    finally:
        conn.close()


# Initialiser la DB au chargement du module
init_marketplace_db()

