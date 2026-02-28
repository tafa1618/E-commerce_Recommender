import os
import json
from .calendar import SenegalContext
from connectors.wp_connector import WooCommerceConnector
from dotenv import load_dotenv

load_dotenv()

class AIOrchestrator:
    def __init__(self):
        self.context = SenegalContext()
        self.wc = WooCommerceConnector()
        self.decision_logs = []

    def evaluate_trend(self, trend_data):
        """
        Analyzes a trend against the current context.
        Returns a relevance score and automated action suggestions.
        """
        boost = self.context.get_marketing_boost_factor()
        market_ctx = self.context.get_current_context()
        
        score = trend_data.get("base_score", 50) * boost
        
        reasoning = f"Trend evaluated with boost factor {boost}. "
        if market_ctx['is_payday_period']:
            reasoning += "Context: Payday period detected. "
        if market_ctx['upcoming_events']:
            reasoning += f"Context: Upcoming events: {market_ctx['upcoming_events']}. "

        decision = {
            "trend_id": trend_data.get("id"),
            "final_score": min(score, 100),
            "reasoning": reasoning,
            "recommended_action": "publish" if score > 80 else "review",
            "timestamp": json.dumps(market_ctx, default=str)
        }
        
        self.decision_logs.append(decision)
        return decision

    def suggest_niche(self, products):
        """Analyzes a list of products to find an emerging niche."""
        # Logic to be expanded in Phase 5
        pass

if __name__ == "__main__":
    orchestrator = AIOrchestrator()
    dummy_trend = {"id": "trend_001", "base_score": 70}
    print("AI Decision:", orchestrator.evaluate_trend(dummy_trend))
