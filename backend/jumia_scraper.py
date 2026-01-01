"""
Scraper pour Jumia Sénégal
Récupère les données des meilleurs produits
"""
import requests
from bs4 import BeautifulSoup
import logging
from typing import List, Dict, Optional
from datetime import datetime
import time

logger = logging.getLogger(__name__)

# Headers pour éviter les blocages
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}


def scraper_jumia_best_sellers(categorie: Optional[str] = None, limit: int = 20) -> List[Dict]:
    """
    Scrape les meilleures ventes de Jumia Sénégal.
    
    Args:
        categorie: Catégorie spécifique (optionnel)
        limit: Nombre maximum de produits à récupérer
        
    Returns:
        Liste de dictionnaires contenant les données des produits
    """
    produits = []
    
    try:
        # URL de base Jumia Sénégal - Meilleures ventes
        if categorie:
            # Nettoyer la catégorie (enlever le slash initial si présent)
            categorie = categorie.strip('/')
            url = f"https://www.jumia.sn/{categorie}/"
        else:
            # Page d'accueil avec les meilleures ventes
            url = "https://www.jumia.sn/"
        
        logger.info(f"Scraping Jumia: {url}")
        
        # Requête avec headers
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        
        # Parser le HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Sélecteurs pour les produits Jumia
        produits_elements = soup.find_all('article', class_='prd', limit=limit)
        
        for element in produits_elements:
            try:
                produit = extraire_donnees_produit(element)
                if produit:
                    produits.append(produit)
            except Exception as e:
                logger.warning(f"Erreur lors de l'extraction d'un produit: {str(e)}")
                continue
        
        logger.info(f"{len(produits)} produits récupérés")
        
    except requests.RequestException as e:
        logger.error(f"Erreur de requête HTTP: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Erreur lors du scraping: {str(e)}")
        raise
    
    return produits


def extraire_donnees_produit(element) -> Optional[Dict]:
    """
    Extrait les données d'un élément produit Jumia.
    
    Args:
        element: Élément BeautifulSoup <article class="prd"> contenant les données du produit
        
    Returns:
        Dictionnaire avec les données du produit ou None
    """
    try:
        # Lien principal avec toutes les données
        core_link = element.find('a', class_='core')
        
        # Nom du produit
        nom_elem = element.find('div', class_='name')
        nom = nom_elem.get_text(strip=True) if nom_elem else "Nom non disponible"
        
        # Si pas de nom dans div.name, essayer data-ga4-item_name
        if nom == "Nom non disponible" and core_link:
            nom = core_link.get('data-ga4-item_name', nom)
        
        # Prix
        prix_elem = element.find('div', class_='prc')
        prix_text = prix_elem.get_text(strip=True) if prix_elem else "0"
        prix = nettoyer_prix(prix_text)
        
        # Prix depuis data-ga4-price si disponible (en USD, à convertir)
        prix_usd = None
        if core_link and core_link.get('data-ga4-price'):
            try:
                prix_usd = float(core_link.get('data-ga4-price'))
            except:
                pass
        
        # Lien
        lien = ""
        if core_link and core_link.get('href'):
            lien = core_link.get('href')
            if lien and not lien.startswith('http'):
                lien = f"https://www.jumia.sn{lien}"
        
        # Remise/promotion
        remise_elem = element.find('div', class_='bdg')
        remise = remise_elem.get_text(strip=True) if remise_elem else None
        
        # Image (lazy loading avec data-src)
        img_elem = element.find('img', class_='img')
        image = ""
        if img_elem:
            image = img_elem.get('data-src') or img_elem.get('src') or ""
            # Nettoyer l'image si elle contient data:image
            if image.startswith('data:image'):
                image = img_elem.get('data-src') or ""
        
        # Marque depuis data-ga4-item_brand
        marque = None
        if core_link:
            marque = core_link.get('data-ga4-item_brand')
        
        # Catégorie
        categorie = None
        if core_link:
            categorie = core_link.get('data-ga4-item_category')
        
        return {
            "nom": nom,
            "prix": prix,
            "prix_texte": prix_text,
            "prix_usd": prix_usd,
            "lien": lien,
            "image": image,
            "remise": remise,
            "marque": marque,
            "categorie": categorie,
            "date_scraping": datetime.now().isoformat()
        }
    except Exception as e:
        logger.warning(f"Erreur extraction produit: {str(e)}")
        return None


def nettoyer_prix(prix_text: str) -> float:
    """
    Nettoie et convertit le texte de prix en nombre.
    
    Args:
        prix_text: Texte contenant le prix (ex: "15 000 FCFA")
        
    Returns:
        Prix en nombre (float)
    """
    try:
        # Enlever "FCFA", espaces, et caractères non numériques sauf point/virgule
        prix_clean = prix_text.replace('FCFA', '').replace(' ', '').replace(',', '')
        # Garder seulement les chiffres et le point
        prix_clean = ''.join(c for c in prix_clean if c.isdigit() or c == '.')
        return float(prix_clean) if prix_clean else 0.0
    except:
        return 0.0


def scraper_jumia_categorie(categorie: str, limit: int = 20) -> List[Dict]:
    """
    Scrape une catégorie spécifique de Jumia.
    
    Args:
        categorie: Nom de la catégorie (ex: "telephones-tablettes", "electronique")
        limit: Nombre maximum de produits
        
    Returns:
        Liste de produits
    """
    return scraper_jumia_best_sellers(categorie=categorie, limit=limit)


def scraper_jumia_recherche(terme: str, limit: int = 20, use_fuzzy: bool = True) -> List[Dict]:
    """
    Scrape les résultats de recherche Jumia pour un terme donné.
    Utilise une recherche fuzzy si activée pour améliorer les résultats.
    
    Args:
        terme: Terme de recherche
        limit: Nombre maximum de produits à récupérer
        use_fuzzy: Utiliser la recherche fuzzy (défaut: True)
        
    Returns:
        Liste de dictionnaires contenant les données des produits
    """
    if use_fuzzy:
        # Utiliser la recherche fuzzy
        from fuzzy_search import fuzzy_search_jumia
        return fuzzy_search_jumia(terme, scraper_jumia_recherche_simple, limit)
    else:
        return scraper_jumia_recherche_simple(terme, limit)


def scraper_jumia_recherche_simple(terme: str, limit: int = 20) -> List[Dict]:
    """
    Scrape les résultats de recherche Jumia pour un terme donné (sans fuzzy).
    
    Args:
        terme: Terme de recherche
        limit: Nombre maximum de produits à récupérer
        
    Returns:
        Liste de dictionnaires contenant les données des produits
    """
    produits = []
    
    try:
        # URL de recherche Jumia - plusieurs formats possibles
        terme_clean = terme.strip()
        terme_encoded = terme_clean.replace(' ', '+')
        
        # Essayer plusieurs formats d'URL de recherche
        urls_a_essayer = [
            f"https://www.jumia.sn/catalog/?q={terme_encoded}",
            f"https://www.jumia.sn/catalog/?q={terme_clean}",
            f"https://www.jumia.sn/catalog/?q={terme_encoded}&page=1",
        ]
        
        for url in urls_a_essayer:
            logger.info(f"Recherche Jumia: {url}")
            
            try:
                # Requête avec headers
                response = requests.get(url, headers=HEADERS, timeout=15)
                response.raise_for_status()
                
                # Parser le HTML
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Sélecteurs pour les produits Jumia - plusieurs sélecteurs possibles
                produits_elements = []
                
                # Sélecteur principal pour les pages de recherche
                produits_elements = soup.find_all('article', class_='prd', limit=limit * 2)  # Prendre plus pour filtrer
                
                # Si pas de résultats, essayer d'autres sélecteurs
                if not produits_elements:
                    # Essayer les liens de produits
                    produits_elements = soup.find_all('a', {'data-name': True}, limit=limit * 2)
                    # Prendre les parents
                    produits_elements = [elem.find_parent('article') or elem.find_parent('div') for elem in produits_elements if elem.find_parent('article') or elem.find_parent('div')]
                
                if not produits_elements:
                    # Essayer de trouver les produits par structure
                    produits_elements = soup.select('article.prd, .prd, [data-name]', limit=limit * 2)
                
                # Essayer aussi les sélecteurs spécifiques aux pages de recherche
                if not produits_elements:
                    produits_elements = soup.select('.sku, .product-item, .item, [data-sku]', limit=limit * 2)
                
                if produits_elements:
                    logger.info(f"Trouvé {len(produits_elements)} éléments produits")
                    
                    for element in produits_elements:
                        try:
                            produit = extraire_donnees_produit(element)
                            if produit:
                                produits.append(produit)
                                if len(produits) >= limit:
                                    break
                        except Exception as e:
                            logger.error(f"Erreur extraction produit: {e}")
                            continue
                    
                    # Si on a des résultats, on s'arrête
                    if produits:
                        break
                        
            except requests.exceptions.RequestException as e:
                logger.warning(f"Erreur requête pour {url}: {e}")
                continue
        
        logger.info(f"Produits trouvés pour '{terme}': {len(produits)}")
        
    except Exception as e:
        logger.error(f"Erreur scraping recherche Jumia: {e}")
    
    return produits

