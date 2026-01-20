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


def get_produits_marketplace(
    status: str = 'active', 
    limit: Optional[int] = None, 
    offset: Optional[int] = None,
    categorie: Optional[str] = None,
    search: Optional[str] = None
) -> Dict:
    """
    Récupère les produits du marketplace avec pagination et recherche
    
    Returns:
        Dict avec 'produits' (List[Dict]) et 'total' (int)
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Requête pour compter le total (sans pagination)
        count_query = "SELECT COUNT(*) FROM produits_marketplace WHERE status = ?"
        count_params = [status]
        
        # Requête pour récupérer les produits
        query = "SELECT * FROM produits_marketplace WHERE status = ?"
        params = [status]
        
        if categorie:
            query += " AND categorie = ?"
            count_query += " AND categorie = ?"
            params.append(categorie)
            count_params.append(categorie)
        
        if search:
            search_pattern = f"%{search}%"
            query += " AND (nom LIKE ? OR description_seo LIKE ? OR meta_description LIKE ? OR mots_cles LIKE ?)"
            count_query += " AND (nom LIKE ? OR description_seo LIKE ? OR meta_description LIKE ? OR mots_cles LIKE ?)"
            params.extend([search_pattern, search_pattern, search_pattern, search_pattern])
            count_params.extend([search_pattern, search_pattern, search_pattern, search_pattern])
        
        # Compter le total
        cursor.execute(count_query, tuple(count_params))
        total = cursor.fetchone()[0]
        
        # Requête principale avec tri
        query += " ORDER BY published_at DESC, created_at DESC"
        
        # Pagination
        if limit:
            query += f" LIMIT {limit}"
            if offset is not None:
                query += f" OFFSET {offset}"
        
        cursor.execute(query, tuple(params))
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
        
        return {
            'produits': produits,
            'total': total,
            'count': len(produits)
        }
        
    except Exception as e:
        print(f"❌ Erreur récupération produits: {e}")
        return {'produits': [], 'total': 0, 'count': 0}
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


def get_categories_phares(limit: int = 6) -> List[Dict]:
    """
    Récupère les catégories phares basées sur :
    - Nombre de produits par catégorie
    - Score de validation Google Trends moyen
    - Nombre d'événements (vues, clics) récents
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Requête intelligente qui combine plusieurs métriques
        query = """
            SELECT 
                categorie,
                COUNT(*) as nombre_produits,
                AVG(COALESCE(validation_score, 0)) as score_moyen,
                SUM(CASE WHEN validated = 1 THEN 1 ELSE 0 END) as produits_valides,
                MAX(published_at) as derniere_publication
            FROM produits_marketplace
            WHERE status = 'active' AND categorie IS NOT NULL AND categorie != ''
            GROUP BY categorie
            HAVING COUNT(*) >= 1
            ORDER BY 
                produits_valides DESC,
                score_moyen DESC,
                nombre_produits DESC,
                derniere_publication DESC
            LIMIT ?
        """
        
        cursor.execute(query, (limit,))
        rows = cursor.fetchall()
        
        categories = []
        for row in rows:
            categories.append({
                'nom': row[0],
                'nombre_produits': row[1],
                'score_moyen': round(row[2], 1) if row[2] else 0,
                'produits_valides': row[3],
                'derniere_publication': row[4]
            })
        
        return categories
        
    except Exception as e:
        print(f"❌ Erreur récupération catégories phares: {e}")
        return []
    finally:
        conn.close()


def get_produits_par_categorie(categorie: str, limit: int = 4) -> List[Dict]:
    """Récupère les produits d'une catégorie spécifique"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        query = """
            SELECT * FROM produits_marketplace 
            WHERE status = 'active' AND categorie = ?
            ORDER BY validation_score DESC, published_at DESC
            LIMIT ?
        """
        
        cursor.execute(query, (categorie, limit))
        rows = cursor.fetchall()
        
        columns = [description[0] for description in cursor.description]
        
        produits = []
        for row in rows:
            produit = dict(zip(columns, row))
            if produit.get('features_json'):
                try:
                    produit['features'] = json.loads(produit['features_json'])
                except:
                    produit['features'] = {}
            produits.append(produit)
        
        return produits
        
    except Exception as e:
        print(f"❌ Erreur récupération produits par catégorie: {e}")
        return []
    finally:
        conn.close()


def get_produit_by_id(product_id: str) -> Optional[Dict]:
    """
    Récupère un produit par son ID
    
    Args:
        product_id: ID du produit
        
    Returns:
        Dict avec les données du produit ou None si non trouvé
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print(f"🔍 Recherche du produit {product_id} dans la base de données")
        cursor.execute("SELECT * FROM produits_marketplace WHERE product_id = ?", (product_id,))
        row = cursor.fetchone()
        
        if not row:
            print(f"❌ Produit {product_id} non trouvé dans la table produits_marketplace")
            # Vérifier s'il existe des produits dans la base
            cursor.execute("SELECT COUNT(*) FROM produits_marketplace")
            count = cursor.fetchone()[0]
            print(f"ℹ️ Nombre total de produits dans la base: {count}")
            if count > 0:
                # Afficher quelques product_id pour debug
                cursor.execute("SELECT product_id FROM produits_marketplace LIMIT 3")
                sample_ids = cursor.fetchall()
                print(f"ℹ️ Exemples d'IDs: {[r[0] for r in sample_ids]}")
            return None
        
        columns = [description[0] for description in cursor.description]
        produit = dict(zip(columns, row))
        
        print(f"✅ Produit trouvé: {produit.get('nom', 'N/A')}")
        
        # Parser les champs JSON
        if produit.get('features_json'):
            try:
                produit['features'] = json.loads(produit['features_json'])
            except:
                produit['features'] = {}
        else:
            produit['features'] = {}
        
        # Parser les événements
        if produit.get('events_json'):
            try:
                produit['events'] = json.loads(produit['events_json'])
            except:
                produit['events'] = []
        else:
            produit['events'] = []
        
        return produit
        
    except Exception as e:
        print(f"❌ Erreur récupération produit {product_id}: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        conn.close()


def mettre_a_jour_produit(
    product_id: str,
    produit: Dict,
    description_seo: Optional[Dict] = None,
    validation_data: Optional[Dict] = None,
    niche_data: Optional[Dict] = None
) -> Optional[str]:
    """
    Met à jour un produit existant
    
    Args:
        product_id: ID du produit à modifier
        produit: Données du produit à modifier
        description_seo: Description SEO optionnelle
        validation_data: Données de validation optionnelles
        niche_data: Données de niche optionnelles
        
    Returns:
        product_id si succès, None sinon
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Vérifier que le produit existe
        cursor.execute("SELECT id FROM produits_marketplace WHERE product_id = ?", (product_id,))
        existing = cursor.fetchone()
        
        if not existing:
            print(f"❌ Produit non trouvé: {product_id}")
            return None
        
        # Mettre à jour le produit
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
            description_seo.get('description_seo', '') if description_seo else None,
            description_seo.get('meta_description', '') if description_seo else None,
            description_seo.get('mots_cles', '') if description_seo else None,
            produit.get('prix', 0),
            produit.get('prix_texte', ''),
            produit.get('image', ''),
            produit.get('lien', ''),
            produit.get('categorie', ''),
            produit.get('marque', ''),
            produit.get('note', ''),
            produit.get('remise', ''),
            produit.get('source', 'Manuel'),
            validation_data.get('score', None) if validation_data else None,
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
        
        conn.commit()
        print(f"✅ Produit modifié: {product_id}")
        return product_id
        
    except Exception as e:
        print(f"❌ Erreur modification produit {product_id}: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()


# Initialiser la DB au chargement du module
init_marketplace_db()

