import os
import json
from datetime import datetime

class MetaAdsAgent:
    def __init__(self):
        self.api_key = os.getenv("META_ADS_TOKEN") # Will need this later for real API
        
    def generate_ad_draft(self, product_data, evaluation_context):
        """
        Generates a draft for a Meta Ad campaign based on product and AI evaluation.
        """
        # Logic to generate creative text, targeting suggestions, and budget
        product_name = product_data.get("nom", "Produit")
        reasoning = evaluation_context.get("reasoning", "")
        
        # Simple creative generation logic
        headline = f"Découvrez {product_name} - Tafa Business"
        body_text = f"Nouveau chez Tafa Business ! {product_name}.\n"
        if "Payday" in reasoning:
            body_text += "C'est le moment idéal pour se faire plaisir ! Profitez de nos offres de fin de mois. 💳✨"
        else:
            body_text += "La qualité et le style réunis. Commandez maintenant !"
            
        draft = {
            "campaign_name": f"AI_Draft_{product_name}_{datetime.now().strftime('%Y%m%d')}",
            "ad_set_name": f"Targeting_Senegal_{product_name}",
            "creative": {
                "headline": headline,
                "body": body_text,
                "image_url": product_data.get("image")
            },
            "targeting_suggestions": [
                "Intérêts: Shopping en ligne",
                "Lieu: Sénégal",
                "Âge: 18-50"
            ],
            "estimated_daily_budget": "5000 XOF", # Suggested budget
            "status": "DRAFT_PENDING_APPROVAL"
        }
        
        return draft

    def save_draft_to_db(self, draft_data):
        # This will be integrated with the main database/memory
        pass

if __name__ == "__main__":
    agent = MetaAdsAgent()
    sample_product = {"nom": "Smart Watch Ultra", "image": "https://example.com/watch.jpg"}
    sample_ctx = {"reasoning": "Payday period detected."}
    print("Meta Ad Draft:", json.dumps(agent.generate_ad_draft(sample_product, sample_ctx), indent=2, ensure_ascii=False))
