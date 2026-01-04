"""
Module pour gérer le journal des ventes
Permet d'enregistrer et consulter les ventes avec dates et localisations
pour analyser les tendances saisonnières
"""
import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional
import sys

# Chemin de la base de données
DB_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DB_PATH = os.path.join(DB_DIR, "journal_ventes.db")

# Créer le dossier data s'il n'existe pas
os.makedirs(DB_DIR, exist_ok=True)


def init_journal_db():
    """Initialise la base de données du journal des ventes"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Vérifier si la table boutiques existe et sa structure
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='boutiques'
    """)
    table_exists = cursor.fetchone()
    
    if table_exists:
        # Vérifier les colonnes existantes
        cursor.execute("PRAGMA table_info(boutiques)")
        columns = {row[1]: row[2] for row in cursor.fetchall()}
        
        # Migrer si nécessaire (ancienne structure avec telephone/email)
        if 'telephone' in columns or 'email' in columns:
            try:
                # Créer une table temporaire avec la nouvelle structure
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS boutiques_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nom TEXT NOT NULL UNIQUE,
                        description TEXT,
                        adresse TEXT,
                        contact TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Copier les données
                cursor.execute("""
                    INSERT INTO boutiques_new (id, nom, description, adresse, contact, created_at)
                    SELECT 
                        id, 
                        nom, 
                        description, 
                        adresse,
                        COALESCE(telephone, email, '') as contact,
                        created_at
                    FROM boutiques
                """)
                
                # Supprimer l'ancienne table et renommer la nouvelle
                cursor.execute("DROP TABLE boutiques")
                cursor.execute("ALTER TABLE boutiques_new RENAME TO boutiques")
                conn.commit()
            except Exception as e:
                conn.rollback()
                # Si la migration échoue, créer la table avec la nouvelle structure
                cursor.execute("DROP TABLE IF EXISTS boutiques")
                cursor.execute("""
                    CREATE TABLE boutiques (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nom TEXT NOT NULL UNIQUE,
                        description TEXT,
                        adresse TEXT,
                        contact TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
        
        # Vérifier si la colonne contact existe, sinon l'ajouter
        if 'contact' not in columns:
            try:
                cursor.execute("ALTER TABLE boutiques ADD COLUMN contact TEXT")
                conn.commit()
            except:
                pass
    
    # Table des boutiques (créer si n'existe pas)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS boutiques (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL UNIQUE,
            description TEXT,
            adresse TEXT,
            contact TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Table des ventes (avec référence à la boutique)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ventes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            boutique_id INTEGER NOT NULL,
            date_vente TEXT NOT NULL,
            produit_nom TEXT NOT NULL,
            prix REAL NOT NULL,
            quantite INTEGER DEFAULT 1,
            localisation TEXT,
            client_info TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (boutique_id) REFERENCES boutiques(id) ON DELETE CASCADE
        )
    """)
    
    # Index pour optimiser les recherches par date
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_date_vente ON ventes(date_vente)
    """)
    
    # Index pour les recherches par produit
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_produit ON ventes(produit_nom)
    """)
    
    # Index pour les recherches par boutique
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_boutique ON ventes(boutique_id)
    """)
    
    # Créer une boutique par défaut si aucune n'existe
    cursor.execute("SELECT COUNT(*) FROM boutiques")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO boutiques (nom, description) 
            VALUES (?, ?)
        """, ("Boutique Principale", "Boutique par défaut"))
    
    conn.commit()
    conn.close()
    
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8')
    print(f"✅ Base de données journal des ventes initialisée: {DB_PATH}")


def ajouter_vente(
    boutique_id: int,
    date_vente: str,
    produit_nom: str,
    prix: float,
    quantite: int = 1,
    localisation: Optional[str] = None,
    client_info: Optional[str] = None,
    notes: Optional[str] = None
) -> int:
    """Ajoute une vente au journal"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Vérifier le format de date (format ISO: YYYY-MM-DD)
    try:
        datetime.strptime(date_vente, "%Y-%m-%d")
    except ValueError:
        raise ValueError(f"Format de date invalide: {date_vente}. Utilisez YYYY-MM-DD")
    
    # Vérifier que la boutique existe
    cursor.execute("SELECT id FROM boutiques WHERE id = ?", (boutique_id,))
    if not cursor.fetchone():
        raise ValueError(f"Boutique avec l'ID {boutique_id} n'existe pas")
    
    cursor.execute("""
        INSERT INTO ventes (boutique_id, date_vente, produit_nom, prix, quantite, localisation, client_info, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (boutique_id, date_vente, produit_nom, prix, quantite, localisation, client_info, notes))
    
    vente_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return vente_id


def get_ventes(
    boutique_id: Optional[int] = None,
    date_debut: Optional[str] = None,
    date_fin: Optional[str] = None,
    produit_nom: Optional[str] = None,
    localisation: Optional[str] = None,
    limit: Optional[int] = None
) -> List[Dict]:
    """Récupère les ventes avec filtres optionnels"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = """
        SELECT v.*, b.nom as boutique_nom 
        FROM ventes v 
        LEFT JOIN boutiques b ON v.boutique_id = b.id 
        WHERE 1=1
    """
    params = []
    
    if boutique_id:
        query += " AND v.boutique_id = ?"
        params.append(boutique_id)
    
    if date_debut:
        query += " AND v.date_vente >= ?"
        params.append(date_debut)
    
    if date_fin:
        query += " AND v.date_vente <= ?"
        params.append(date_fin)
    
    if produit_nom:
        query += " AND v.produit_nom LIKE ?"
        params.append(f"%{produit_nom}%")
    
    if localisation:
        query += " AND v.localisation LIKE ?"
        params.append(f"%{localisation}%")
    
    query += " ORDER BY v.date_vente DESC"
    
    if limit:
        query += " LIMIT ?"
        params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    ventes = []
    for row in rows:
        ventes.append({
            "id": row["id"],
            "boutique_id": row["boutique_id"],
            "boutique_nom": row.get("boutique_nom", ""),
            "date_vente": row["date_vente"],
            "produit_nom": row["produit_nom"],
            "prix": row["prix"],
            "quantite": row["quantite"],
            "localisation": row["localisation"],
            "client_info": row["client_info"],
            "notes": row["notes"],
            "created_at": row["created_at"],
            "total": row["prix"] * row["quantite"]
        })
    
    return ventes


def get_vente_par_id(vente_id: int) -> Optional[Dict]:
    """Récupère une vente par son ID"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT v.*, b.nom as boutique_nom 
        FROM ventes v 
        LEFT JOIN boutiques b ON v.boutique_id = b.id 
        WHERE v.id = ?
    """, (vente_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row["id"],
            "boutique_id": row["boutique_id"],
            "boutique_nom": row.get("boutique_nom", ""),
            "date_vente": row["date_vente"],
            "produit_nom": row["produit_nom"],
            "prix": row["prix"],
            "quantite": row["quantite"],
            "localisation": row["localisation"],
            "client_info": row["client_info"],
            "notes": row["notes"],
            "created_at": row["created_at"],
            "total": row["prix"] * row["quantite"]
        }
    return None


def modifier_vente(
    vente_id: int,
    boutique_id: Optional[int] = None,
    date_vente: Optional[str] = None,
    produit_nom: Optional[str] = None,
    prix: Optional[float] = None,
    quantite: Optional[int] = None,
    localisation: Optional[str] = None,
    client_info: Optional[str] = None,
    notes: Optional[str] = None
) -> bool:
    """Modifie une vente existante"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Construire la requête dynamiquement
    updates = []
    params = []
    
    if boutique_id is not None:
        # Vérifier que la boutique existe
        cursor.execute("SELECT id FROM boutiques WHERE id = ?", (boutique_id,))
        if not cursor.fetchone():
            conn.close()
            raise ValueError(f"Boutique avec l'ID {boutique_id} n'existe pas")
        updates.append("boutique_id = ?")
        params.append(boutique_id)
    
    if date_vente:
        try:
            datetime.strptime(date_vente, "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"Format de date invalide: {date_vente}. Utilisez YYYY-MM-DD")
        updates.append("date_vente = ?")
        params.append(date_vente)
    
    if produit_nom:
        updates.append("produit_nom = ?")
        params.append(produit_nom)
    
    if prix is not None:
        updates.append("prix = ?")
        params.append(prix)
    
    if quantite is not None:
        updates.append("quantite = ?")
        params.append(quantite)
    
    if localisation is not None:
        updates.append("localisation = ?")
        params.append(localisation)
    
    if client_info is not None:
        updates.append("client_info = ?")
        params.append(client_info)
    
    if notes is not None:
        updates.append("notes = ?")
        params.append(notes)
    
    if not updates:
        conn.close()
        return False
    
    params.append(vente_id)
    query = f"UPDATE ventes SET {', '.join(updates)} WHERE id = ?"
    
    cursor.execute(query, params)
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return affected > 0


def supprimer_vente(vente_id: int) -> bool:
    """Supprime une vente"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM ventes WHERE id = ?", (vente_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return affected > 0


def get_statistiques(
    boutique_id: Optional[int] = None,
    date_debut: Optional[str] = None,
    date_fin: Optional[str] = None
) -> Dict:
    """Récupère des statistiques sur les ventes"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    query = "SELECT COUNT(*), SUM(prix * quantite), AVG(prix), SUM(quantite) FROM ventes WHERE 1=1"
    params = []
    
    if boutique_id:
        query += " AND boutique_id = ?"
        params.append(boutique_id)
    
    if date_debut:
        query += " AND date_vente >= ?"
        params.append(date_debut)
    
    if date_fin:
        query += " AND date_vente <= ?"
        params.append(date_fin)
    
    cursor.execute(query, params)
    row = cursor.fetchone()
    
    # Statistiques par produit
    query_produits = """
        SELECT produit_nom, SUM(prix * quantite) as total, SUM(quantite) as qte
        FROM ventes WHERE 1=1
    """
    params_produits = []
    
    if boutique_id:
        query_produits += " AND boutique_id = ?"
        params_produits.append(boutique_id)
    
    if date_debut:
        query_produits += " AND date_vente >= ?"
        params_produits.append(date_debut)
    
    if date_fin:
        query_produits += " AND date_vente <= ?"
        params_produits.append(date_fin)
    
    query_produits += " GROUP BY produit_nom ORDER BY total DESC LIMIT 10"
    cursor.execute(query_produits, params_produits)
    top_produits = cursor.fetchall()
    
    # Statistiques par localisation
    query_localisation = """
        SELECT localisation, SUM(prix * quantite) as total, COUNT(*) as nb_ventes
        FROM ventes WHERE localisation IS NOT NULL AND localisation != ''
    """
    params_loc = []
    
    if boutique_id:
        query_localisation += " AND boutique_id = ?"
        params_loc.append(boutique_id)
    
    if date_debut:
        query_localisation += " AND date_vente >= ?"
        params_loc.append(date_debut)
    
    if date_fin:
        query_localisation += " AND date_vente <= ?"
        params_loc.append(date_fin)
    
    query_localisation += " GROUP BY localisation ORDER BY total DESC LIMIT 10"
    cursor.execute(query_localisation, params_loc)
    top_localisations = cursor.fetchall()
    
    conn.close()
    
    return {
        "nb_ventes": row[0] or 0,
        "ca_total": row[1] or 0.0,
        "prix_moyen": row[2] or 0.0,
        "quantite_totale": row[3] or 0,
        "top_produits": [
            {"produit": p[0], "ca": p[1], "quantite": p[2]}
            for p in top_produits
        ],
        "top_localisations": [
            {"localisation": l[0], "ca": l[1], "nb_ventes": l[2]}
            for l in top_localisations
        ]
    }


def get_ventes_par_periode(annee: int, mois: Optional[int] = None, boutique_id: Optional[int] = None) -> List[Dict]:
    """Récupère les ventes pour une période spécifique (utile pour comparer d'une année sur l'autre)"""
    if mois:
        date_debut = f"{annee}-{mois:02d}-01"
        if mois == 12:
            date_fin = f"{annee}-12-31"
        else:
            date_fin = f"{annee}-{mois+1:02d}-01"
    else:
        date_debut = f"{annee}-01-01"
        date_fin = f"{annee}-12-31"
    
    return get_ventes(boutique_id=boutique_id, date_debut=date_debut, date_fin=date_fin)


# =========================
# FONCTIONS GESTION BOUTIQUES
# =========================

def creer_boutique(
    nom: str,
    description: Optional[str] = None,
    adresse: Optional[str] = None,
    contact: Optional[str] = None
) -> int:
    """Crée une nouvelle boutique"""
    # S'assurer que la base de données est initialisée
    init_journal_db()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO boutiques (nom, description, adresse, contact)
            VALUES (?, ?, ?, ?)
        """, (nom, description, adresse, contact))
        
        boutique_id = cursor.lastrowid
        conn.commit()
        return boutique_id
    except sqlite3.IntegrityError as e:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise
    finally:
        conn.close()


def get_boutiques() -> List[Dict]:
    """Récupère toutes les boutiques"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM boutiques ORDER BY nom")
    rows = cursor.fetchall()
    conn.close()
    
    boutiques = []
    for row in rows:
        boutiques.append({
            "id": row["id"],
            "nom": row["nom"],
            "description": row["description"],
            "adresse": row["adresse"],
            "contact": row["contact"],
            "created_at": row["created_at"]
        })
    
    return boutiques


def get_boutique_par_id(boutique_id: int) -> Optional[Dict]:
    """Récupère une boutique par son ID"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM boutiques WHERE id = ?", (boutique_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row["id"],
            "nom": row["nom"],
            "description": row["description"],
            "adresse": row["adresse"],
            "contact": row["contact"],
            "created_at": row["created_at"]
        }
    return None


def modifier_boutique(
    boutique_id: int,
    nom: Optional[str] = None,
    description: Optional[str] = None,
    adresse: Optional[str] = None,
    contact: Optional[str] = None
) -> bool:
    """Modifie une boutique existante"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    updates = []
    params = []
    
    if nom:
        updates.append("nom = ?")
        params.append(nom)
    
    if description is not None:
        updates.append("description = ?")
        params.append(description)
    
    if adresse is not None:
        updates.append("adresse = ?")
        params.append(adresse)
    
    if contact is not None:
        updates.append("contact = ?")
        params.append(contact)
    
    if not updates:
        conn.close()
        return False
    
    params.append(boutique_id)
    query = f"UPDATE boutiques SET {', '.join(updates)} WHERE id = ?"
    
    cursor.execute(query, params)
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return affected > 0


def supprimer_boutique(boutique_id: int) -> bool:
    """Supprime une boutique (et toutes ses ventes via CASCADE)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM boutiques WHERE id = ?", (boutique_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return affected > 0

