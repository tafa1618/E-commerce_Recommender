import os
from woocommerce import API
from dotenv import load_dotenv

load_dotenv()

class WooCommerceConnector:
    def __init__(self):
        self.wcapi = API(
            url=os.getenv("WC_URL"),
            consumer_key=os.getenv("WC_CONSUMER_KEY"),
            consumer_secret=os.getenv("WC_CONSUMER_SECRET"),
            version="wc/v3",
            timeout=30,
            query_string_auth=True,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

    def test_connection(self):
        """Vérifie si la connexion aux API WooCommerce fonctionne."""
        try:
            print(f"🔗 Tentative de connexion à : {os.getenv('WC_URL')}")
            response = self.wcapi.get("products", params={"per_page": 1})
            if response.status_code == 200:
                print("✅ Connexion WooCommerce établie avec succès.")
                return True
            else:
                print(f"❌ Erreur de connexion : {response.status_code}")
                print(f"📝 Réponse : {response.text}")
                # Essayer un appel sans auth pour vérifier si l'API répond
                return False
        except Exception as e:
            print(f"❌ Exception lors de la connexion : {str(e)}")
            return False

    def publish_product(self, product_data):
        """
        Publie un produit sur WooCommerce.
        product_data doit être un dictionnaire formaté pour l'API WooCommerce.
        """
        try:
            response = self.wcapi.post("products", product_data)
            if response.status_code in [200, 201]:
                return response.json()
            else:
                print(f"❌ Erreur lors de la publication : {response.text}")
                return None
        except Exception as e:
            print(f"❌ Exception lors de la publication : {str(e)}")
            return None

if __name__ == "__main__":
    connector = WooCommerceConnector()
    connector.test_connection()
