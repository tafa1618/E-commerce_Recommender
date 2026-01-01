"""
Génération de CSV pour créer une boutique (WordPress/WooCommerce ou Shopify)
"""
import csv
from datetime import datetime
from typing import List, Dict


def generate_boutique_csv_wordpress(produits: List[Dict]) -> str:
    """
    Génère un CSV importable dans WordPress/WooCommerce.
    
    Args:
        produits: Liste de produits depuis Jumia
        
    Returns:
        Nom du fichier CSV généré
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"boutique_wordpress_{timestamp}.csv"

    # Headers WooCommerce
    headers = [
        "Type",
        "SKU",
        "Name",
        "Published",
        "Is featured?",
        "Visibility in catalog",
        "Short description",
        "Description",
        "Date sale price starts",
        "Date sale price ends",
        "Tax status",
        "Tax class",
        "In stock?",
        "Stock",
        "Backorders allowed?",
        "Sold individually?",
        "Weight (kg)",
        "Length (cm)",
        "Width (cm)",
        "Height (cm)",
        "Allow customer reviews?",
        "Purchase note",
        "Sale price",
        "Regular price",
        "Categories",
        "Tags",
        "Shipping class",
        "Images",
        "Download limit",
        "Download expiry days",
        "Parent",
        "Grouped products",
        "Upsells",
        "Cross-sells",
        "External URL",
        "Button text",
        "Position"
    ]

    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)

        for i, p in enumerate(produits, 1):
            # Générer un SKU basé sur l'index
            sku = f"JUMIA-{i:04d}"
            
            # Description (utiliser la catégorie si pas de description)
            description = p.get("description", "") or f"Produit {p.get('categorie', '')} de Jumia Sénégal"
            
            # Catégorie
            categorie = p.get("categorie", "Non catégorisé")
            
            # Image
            image = p.get("image", "")
            
            # Prix
            prix = p.get("prix", 0)
            prix_texte = p.get("prix_texte", f"{prix} FCFA")
            
            writer.writerow([
                "simple",  # Type
                sku,  # SKU
                p.get("nom", ""),  # Name
                "1",  # Published
                "0",  # Is featured?
                "visible",  # Visibility
                f"Prix: {prix_texte}",  # Short description
                description,  # Description
                "",  # Date sale price starts
                "",  # Date sale price ends
                "taxable",  # Tax status
                "",  # Tax class
                "1",  # In stock?
                "100",  # Stock
                "0",  # Backorders
                "0",  # Sold individually
                "",  # Weight
                "",  # Length
                "",  # Width
                "",  # Height
                "1",  # Allow reviews
                "",  # Purchase note
                "",  # Sale price
                str(prix),  # Regular price
                categorie,  # Categories
                p.get("marque", ""),  # Tags
                "",  # Shipping class
                image,  # Images
                "",  # Download limit
                "",  # Download expiry
                "",  # Parent
                "",  # Grouped products
                "",  # Upsells
                "",  # Cross-sells
                "",  # External URL
                "",  # Button text
                str(i)  # Position
            ])

    return filename


def generate_boutique_csv_shopify(produits: List[Dict]) -> str:
    """
    Génère un CSV importable dans Shopify.
    
    Args:
        produits: Liste de produits depuis Jumia
        
    Returns:
        Nom du fichier CSV généré
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"boutique_shopify_{timestamp}.csv"

    # Headers Shopify
    headers = [
        "Handle",
        "Title",
        "Body (HTML)",
        "Vendor",
        "Type",
        "Tags",
        "Published",
        "Option1 Name",
        "Option1 Value",
        "Variant SKU",
        "Variant Grams",
        "Variant Inventory Tracker",
        "Variant Inventory Qty",
        "Variant Inventory Policy",
        "Variant Fulfillment Service",
        "Variant Price",
        "Variant Compare At Price",
        "Variant Requires Shipping",
        "Variant Taxable",
        "Variant Barcode",
        "Image Src",
        "Image Position",
        "Image Alt Text",
        "Gift Card",
        "SEO Title",
        "SEO Description",
        "Google Shopping / Google Product Category",
        "Google Shopping / Gender",
        "Google Shopping / Age Group",
        "Google Shopping / MPN",
        "Google Shopping / AdWords Grouping",
        "Google Shopping / AdWords Labels",
        "Google Shopping / Condition",
        "Google Shopping / Custom Product",
        "Google Shopping / Custom Label 0",
        "Google Shopping / Custom Label 1",
        "Google Shopping / Custom Label 2",
        "Google Shopping / Custom Label 3",
        "Google Shopping / Custom Label 4",
        "Variant Image",
        "Variant Weight Unit",
        "Variant Tax Code",
        "Cost per item"
    ]

    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)

        for i, p in enumerate(produits, 1):
            # Handle (slug du nom)
            handle = p.get("nom", "").lower().replace(" ", "-").replace("'", "").replace(",", "")[:100]
            
            # Description
            description = p.get("description", "") or f"Produit {p.get('categorie', '')} de Jumia Sénégal"
            
            # Vendor (marque)
            vendor = p.get("marque", "Jumia")
            
            # Type (catégorie)
            product_type = p.get("categorie", "General")
            
            # Tags
            tags = p.get("marque", "")
            if p.get("categorie"):
                tags = f"{tags}, {p.get('categorie')}" if tags else p.get("categorie")
            
            # Prix
            prix = p.get("prix", 0)
            
            # Image
            image = p.get("image", "")
            
            # SKU
            sku = f"JUMIA-{i:04d}"
            
            writer.writerow([
                handle,  # Handle
                p.get("nom", ""),  # Title
                description,  # Body (HTML)
                vendor,  # Vendor
                product_type,  # Type
                tags,  # Tags
                "TRUE",  # Published
                "Title",  # Option1 Name
                "Default Title",  # Option1 Value
                sku,  # Variant SKU
                "",  # Variant Grams
                "shopify",  # Variant Inventory Tracker
                "100",  # Variant Inventory Qty
                "deny",  # Variant Inventory Policy
                "manual",  # Variant Fulfillment Service
                str(prix),  # Variant Price
                "",  # Variant Compare At Price
                "TRUE",  # Variant Requires Shipping
                "TRUE",  # Variant Taxable
                "",  # Variant Barcode
                image,  # Image Src
                "1",  # Image Position
                p.get("nom", ""),  # Image Alt Text
                "FALSE",  # Gift Card
                p.get("nom", ""),  # SEO Title
                description[:160],  # SEO Description
                "",  # Google Shopping Category
                "",  # Gender
                "",  # Age Group
                "",  # MPN
                "",  # AdWords Grouping
                "",  # AdWords Labels
                "new",  # Condition
                "FALSE",  # Custom Product
                "",  # Custom Label 0
                "",  # Custom Label 1
                "",  # Custom Label 2
                "",  # Custom Label 3
                "",  # Custom Label 4
                image,  # Variant Image
                "kg",  # Variant Weight Unit
                "",  # Variant Tax Code
                ""  # Cost per item
            ])

    return filename

