"""
Scraper pour Alibaba.com - Extraction de produits
"""
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import time
import re

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}


def nettoyer_prix(prix_str: str) -> float:
    """
    Nettoie une chaîne de prix et retourne un float.
    
    Args:
        prix_str: Chaîne contenant le prix (ex: "$12.50", "USD 15.99", etc.)
        
    Returns:
        Prix en float, ou 0 si erreur
    """
    if not prix_str:
        return 0.0
    
    # Extraire les chiffres et points
    prix_clean = re.sub(r'[^\d.]', '', prix_str)
    try:
        return float(prix_clean)
    except:
        return 0.0


def extraire_donnees_produit(element) -> Optional[Dict]:
    """
    Extrait les données d'un produit depuis un élément HTML Alibaba.
    
    Args:
        element: Élément BeautifulSoup contenant les données du produit
        
    Returns:
        Dictionnaire avec les données du produit ou None
    """
    try:
        # Nom du produit - sélecteurs améliorés
        nom_elem = element.select_one(
            'h2 a, .title a, .product-title a, .title-text a, '
            '[data-content-name], .gallery-offer-title a, '
            '.offer-title a, a.title, .product-name a'
        )
        nom = nom_elem.get_text(strip=True) if nom_elem else "Produit sans nom"
        
        # Si pas de nom trouvé, essayer de trouver dans les attributs data
        if nom == "Produit sans nom":
            nom_attr = element.get('data-product-name') or element.get('data-title') or element.get('title', '')
            if nom_attr:
                nom = nom_attr.strip()
        
        # Lien - sélecteurs améliorés
        lien_elem = element.select_one(
            'h2 a, .title a, .product-title a, .title-text a, '
            'a[href*="/product-detail/"], a[href*="/offer/"], '
            'a[href*="/product/"], .gallery-offer-title a'
        )
        lien = ""
        if lien_elem:
            href = lien_elem.get('href', '')
            if href.startswith('//'):
                lien = f"https:{href}"
            elif href.startswith('/'):
                lien = f"https://www.alibaba.com{href}"
            elif href.startswith('http'):
                lien = href
            else:
                lien = f"https://www.alibaba.com/{href}"
        
        # Prix - Alibaba a plusieurs formats de prix - sélecteurs améliorés
        prix = 0.0
        prix_texte = ""
        
        # Chercher le prix dans différents sélecteurs possibles
        prix_selectors = [
            '.price', '.price-value', '.moq-price', 
            '[data-content-name="price"]', '.price-range',
            '.gallery-offer-price', '.offer-price',
            '.price-box', '.price-info', '.product-price'
        ]
        
        for selector in prix_selectors:
            prix_elem = element.select_one(selector)
            if prix_elem:
                prix_texte = prix_elem.get_text(strip=True)
                prix = nettoyer_prix(prix_texte)
                if prix > 0:
                    break
        
        # Si pas de prix trouvé, chercher dans tous les spans et divs
        if not prix or prix == 0:
            all_text_elements = element.select('span, div, p')
            for elem in all_text_elements:
                text = elem.get_text(strip=True)
                if ('$' in text or 'USD' in text or 'CNY' in text) and any(char.isdigit() for char in text):
                    # Vérifier que c'est bien un prix (contient un nombre)
                    if re.search(r'\d+', text):
                        prix_texte = text
                        prix = nettoyer_prix(text)
                        if prix > 0:
                            break
        
        # Image
        image = ""
        img_elem = element.select_one('img[src], img[data-src], img[data-lazy]')
        if img_elem:
            image = img_elem.get('src') or img_elem.get('data-src') or img_elem.get('data-lazy', '')
            if image.startswith('//'):
                image = f"https:{image}"
            elif image.startswith('/'):
                image = f"https://www.alibaba.com{image}"
        
        # Marque/Vendor
        marque = ""
        vendor_elem = element.select_one('.supplier, .vendor, .company-name, [data-content-name="supplier"]')
        if vendor_elem:
            marque = vendor_elem.get_text(strip=True)
        
        # Catégorie (peut être dans le breadcrumb ou les tags)
        categorie = ""
        cat_elem = element.select_one('.category, .product-category, [data-content-name="category"]')
        if cat_elem:
            categorie = cat_elem.get_text(strip=True)
        
        # Note/Évaluation
        note = "N/A"
        rating_elem = element.select_one('.rating, .star-rating, [data-content-name="rating"]')
        if rating_elem:
            note_text = rating_elem.get_text(strip=True)
            # Extraire un nombre de la note
            note_match = re.search(r'(\d+\.?\d*)', note_text)
            if note_match:
                note = note_match.group(1)
        
        # MOQ (Minimum Order Quantity)
        moq = ""
        moq_elem = element.select_one('.moq, .min-order, [data-content-name="moq"]')
        if moq_elem:
            moq = moq_elem.get_text(strip=True)
        
        return {
            "nom": nom,
            "prix": prix,
            "prix_texte": prix_texte or f"${prix:.2f}" if prix else "Prix sur demande",
            "lien": lien,
            "image": image,
            "marque": marque,
            "categorie": categorie,
            "note": note,
            "moq": moq,
            "source": "Alibaba"
        }
    except Exception as e:
        print(f"Erreur extraction produit: {e}")
        return None


def scraper_alibaba_recherche(terme: str = "", categorie: str = "", limit: int = 20) -> List[Dict]:
    """
    Scrape les produits Alibaba selon une recherche ou catégorie.
    
    Args:
        terme: Terme de recherche (optionnel)
        categorie: Catégorie spécifique (optionnel)
        limit: Nombre maximum de produits à retourner
        
    Returns:
        Liste de dictionnaires contenant les données des produits
    """
    produits = []
    
    try:
        # Construire l'URL
        if categorie:
            url = f"https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&CatId=&SearchText={categorie}"
        elif terme:
            url = f"https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&CatId=&SearchText={terme}"
        else:
            # Page d'accueil / produits populaires
            url = "https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&CatId=&SearchText="
        
        print(f"Scraping Alibaba: {url}")
        
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Sélecteurs possibles pour les produits Alibaba
        # Alibaba utilise différents sélecteurs selon la page - améliorés
        product_selectors = [
            '.gallery-offer-outter',
            '.gallery-offer',
            '.organic-gallery-offer',
            '.list-item',
            '.item-main',
            '.product-item',
            '.offer-item',
            '[data-content-name="product"]',
            'div[data-product-id]',
            '.card-item',
            '.search-card-item'
        ]
        
        product_elements = []
        for selector in product_selectors:
            elements = soup.select(selector)
            if elements:
                product_elements = elements
                print(f"Trouvé {len(elements)} produits avec le sélecteur: {selector}")
                break
        
        if not product_elements:
            # Fallback: chercher tous les éléments avec des liens vers des produits
            product_links = soup.select('a[href*="/product-detail/"], a[href*="/offer/"], a[href*="/product/"]')
            print(f"Liens produits trouvés: {len(product_links)}")
            
            # Prendre les parents pour avoir le conteneur complet
            seen = set()
            for link in product_links:
                parent = link.find_parent(['div', 'li', 'article', 'section'])
                if parent and id(parent) not in seen:
                    product_elements.append(parent)
                    seen.add(id(parent))
        
        print(f"Total éléments trouvés: {len(product_elements)}")
        
        for element in product_elements[:limit]:
            produit = extraire_donnees_produit(element)
            if produit:
                produits.append(produit)
        
        print(f"Produits extraits avec succès: {len(produits)}")
        
        # Si aucun produit trouvé, retourner des données de démonstration
        if len(produits) == 0:
            print("⚠️ Aucun produit trouvé avec le scraper. Alibaba peut bloquer les scrapers.")
            print("💡 Options: 1) Utiliser Apify (recommandé)")
            print("           2) Vérifier que les sélecteurs CSS sont à jour")
            
            # Retourner des données de démonstration pour tester l'interface
            if limit > 0:
                produits = get_demo_data(limit)
                print(f"📝 Retour de {len(produits)} produits de démonstration")
        
    except requests.exceptions.RequestException as e:
        print(f"Erreur requête HTTP: {e}")
        print("💡 Alibaba peut bloquer les requêtes. Considérez utiliser une API officielle.")
        # Retourner des données de démonstration en cas d'erreur
        if limit > 0:
            produits = get_demo_data(limit)
    except Exception as e:
        print(f"Erreur scraping Alibaba: {e}")
        if limit > 0:
            produits = get_demo_data(limit)
    
    return produits


def get_demo_data(limit: int = 5) -> List[Dict]:
    """
    Retourne des données de démonstration pour tester l'interface.
    Utile quand le scraper est bloqué.
    """
    demo_produits = [
        {
            "nom": "Smartphone Android 128GB - Démo",
            "prix": 89.99,
            "prix_texte": "$89.99",
            "lien": "https://www.alibaba.com/product-detail/demo",
            "image": "https://via.placeholder.com/300x300?text=Smartphone",
            "marque": "Demo Brand",
            "categorie": "Electronics",
            "note": "4.5",
            "moq": "10 pieces",
            "source": "Alibaba (Demo)"
        },
        {
            "nom": "T-shirt Coton 100% - Démo",
            "prix": 5.50,
            "prix_texte": "$5.50",
            "lien": "https://www.alibaba.com/product-detail/demo",
            "image": "https://via.placeholder.com/300x300?text=T-shirt",
            "marque": "Demo Fashion",
            "categorie": "Apparel",
            "note": "4.2",
            "moq": "50 pieces",
            "source": "Alibaba (Demo)"
        },
        {
            "nom": "Casque Bluetooth Sans Fil - Démo",
            "prix": 15.99,
            "prix_texte": "$15.99",
            "lien": "https://www.alibaba.com/product-detail/demo",
            "image": "https://via.placeholder.com/300x300?text=Casque",
            "marque": "Demo Audio",
            "categorie": "Electronics",
            "note": "4.7",
            "moq": "20 pieces",
            "source": "Alibaba (Demo)"
        },
        {
            "nom": "Montre Intelligente Fitness - Démo",
            "prix": 25.00,
            "prix_texte": "$25.00",
            "lien": "https://www.alibaba.com/product-detail/demo",
            "image": "https://via.placeholder.com/300x300?text=Montre",
            "marque": "Demo Tech",
            "categorie": "Electronics",
            "note": "4.3",
            "moq": "15 pieces",
            "source": "Alibaba (Demo)"
        },
        {
            "nom": "Sac à Dos Laptop 15 pouces - Démo",
            "prix": 12.99,
            "prix_texte": "$12.99",
            "lien": "https://www.alibaba.com/product-detail/demo",
            "image": "https://via.placeholder.com/300x300?text=Sac",
            "marque": "Demo Bags",
            "categorie": "Luggage & Bags",
            "note": "4.4",
            "moq": "30 pieces",
            "source": "Alibaba (Demo)"
        }
    ]
    
    return demo_produits[:limit]


def scraper_alibaba_best_sellers(limit: int = 20) -> List[Dict]:
    """
    Scrape les meilleures ventes / produits populaires Alibaba.
    
    Args:
        limit: Nombre maximum de produits
        
    Returns:
        Liste de produits
    """
    return scraper_alibaba_recherche(terme="", categorie="", limit=limit)


def scraper_alibaba_categorie(categorie: str, limit: int = 20) -> List[Dict]:
    """
    Scrape les produits d'une catégorie spécifique Alibaba.
    
    Args:
        categorie: Nom de la catégorie
        limit: Nombre maximum de produits
        
    Returns:
        Liste de produits
    """
    return scraper_alibaba_recherche(categorie=categorie, limit=limit)

