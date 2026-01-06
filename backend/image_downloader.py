"""
Module pour télécharger et sauvegarder les images des produits
"""
import os
import requests
import hashlib
from urllib.parse import urlparse
from pathlib import Path
from typing import Optional

# Dossier pour stocker les images du marketplace
MARKETPLACE_IMAGES_DIR = Path("data/marketplace_images")
MARKETPLACE_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# URL de base pour servir les images (relatif au dossier public Next.js)
PUBLIC_IMAGES_URL = "/images/products"


def download_image(image_url: str, product_id: str) -> Optional[str]:
    """
    Télécharge une image depuis une URL et la sauvegarde localement.
    
    Args:
        image_url: URL de l'image à télécharger
        product_id: ID du produit (pour nommer le fichier)
        
    Returns:
        Chemin relatif de l'image sauvegardée (pour Next.js public/) ou None si erreur
    """
    try:
        if not image_url or not image_url.startswith(('http://', 'https://')):
            return None
        
        # Télécharger l'image
        response = requests.get(image_url, timeout=10, stream=True)
        response.raise_for_status()
        
        # Déterminer l'extension du fichier
        parsed_url = urlparse(image_url)
        path = parsed_url.path
        ext = os.path.splitext(path)[1] or '.jpg'
        
        # Créer un nom de fichier unique basé sur product_id et hash de l'URL
        url_hash = hashlib.md5(image_url.encode()).hexdigest()[:8]
        filename = f"{product_id}_{url_hash}{ext}"
        
        # Chemin complet pour sauvegarder (dans data/marketplace_images)
        local_path = MARKETPLACE_IMAGES_DIR / filename
        
        # Sauvegarder l'image
        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Retourner le chemin relatif pour Next.js (sera copié dans public/images/products)
        return f"images/products/{filename}"
        
    except Exception as e:
        print(f"❌ Erreur téléchargement image {image_url}: {e}")
        return None


def copy_image_to_public(image_path: str, marketplace_public_dir: str) -> Optional[str]:
    """
    Copie une image depuis data/marketplace_images vers le dossier public du marketplace.
    
    Args:
        image_path: Chemin relatif de l'image (images/products/filename.jpg)
        marketplace_public_dir: Chemin vers le dossier public du marketplace
        
    Returns:
        Chemin final de l'image dans public/ ou None si erreur
    """
    try:
        source_path = MARKETPLACE_IMAGES_DIR / os.path.basename(image_path)
        if not source_path.exists():
            return None
        
        # Créer le dossier de destination dans public/
        dest_dir = Path(marketplace_public_dir) / "images" / "products"
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        # Copier le fichier
        dest_path = dest_dir / os.path.basename(image_path)
        import shutil
        shutil.copy2(source_path, dest_path)
        
        # Retourner le chemin relatif pour Next.js
        return f"/images/products/{os.path.basename(image_path)}"
        
    except Exception as e:
        print(f"❌ Erreur copie image vers public: {e}")
        return None

