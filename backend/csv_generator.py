# csv_export.py
import csv
from datetime import datetime


def generate_csv(produits):
    """
    Génère un fichier CSV importable dans WooCommerce
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"produits_wordpress_{timestamp}.csv"

    headers = [
        "Name",
        "Description",
        "Regular price",
    ]

    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)

        for p in produits:
            writer.writerow([
                p.get("nom", ""),
                p.get("description", ""),
                p.get("prix_recommande", 0),
            ])

    return filename
