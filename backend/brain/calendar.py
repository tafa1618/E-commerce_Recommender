from datetime import datetime, date
import holidays

class SenegalContext:
    def __init__(self):
        self.year = datetime.now().year
        # Holidays package for Senegal
        self.sn_holidays = holidays.Senegal(years=self.year)
        
        # Religious events (Approximate for the year or manually updated)
        # In a real system, these would be calculated or fetched from an API
        self.religious_events = {
            "Tabaski": date(self.year, 6, 16), # Approx for 2024, needs adjustment
            "Korité": date(self.year, 4, 10),
            "Magal de Touba": date(self.year, 8, 23),
            "Gamou": date(self.year, 9, 15)
        }

    def get_current_context(self):
        today = date.today()
        context = {
            "is_payday_period": 25 <= today.day <= 31 or 1 <= today.day <= 5,
            "current_season": self._get_season(today),
            "upcoming_events": self._get_upcoming_events(today),
            "holiday_context": self.sn_holidays.get(today)
        }
        return context

    def _get_season(self, today):
        # Senegal seasons:
        # Hivernage (Rainy): July - October
        # Sec/Cool: November - February
        # Sec/Hot: March - June
        month = today.month
        if 7 <= month <= 10:
            return "Hivernage (Rainy)"
        elif month >= 11 or month <= 2:
            return "Saison Sèche (Cool)"
        else:
            return "Saison Sèche (Hot)"

    def _get_upcoming_events(self, today):
        upcoming = []
        for name, event_date in self.religious_events.items():
            delta = (event_date - today).days
            if 0 <= delta <= 30:
                upcoming.append({"name": name, "days_to": delta})
        return upcoming

    def get_marketing_boost_factor(self):
        """Returns a multiplier for logic based on context (0.5 to 2.5)."""
        ctx = self.get_current_context()
        factor = 1.0
        
        if ctx["is_payday_period"]:
            factor += 0.5
        
        if ctx["upcoming_events"]:
            factor += 1.0 # Significant boost for religious festivals
            
        if ctx["holiday_context"]:
            factor += 0.3
            
        return factor

if __name__ == "__main__":
    sn = SenegalContext()
    print("Market Context Senegal:", sn.get_current_context())
    print("Marketing Boost Factor:", sn.get_marketing_boost_factor())
