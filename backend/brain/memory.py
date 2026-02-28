import sqlite3
import json
from datetime import datetime

class DecisionMemory:
    def __init__(self, db_path="brain_memory.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS decision_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trend_id TEXT,
                    score REAL,
                    reasoning TEXT,
                    action TEXT,
                    context_json TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS niche_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    niche_name TEXT,
                    keywords TEXT,
                    performance_score REAL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

    def log_decision(self, trend_id, score, reasoning, action, context):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO decision_logs (trend_id, score, reasoning, action, context_json)
                VALUES (?, ?, ?, ?, ?)
            """, (trend_id, score, reasoning, action, json.dumps(context)))

    def get_recent_decisions(self, limit=10):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT * FROM decision_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
            return cursor.fetchall()

if __name__ == "__main__":
    mem = DecisionMemory()
    mem.log_decision("test_trend", 85.5, "High potential", "publish", {"payday": True})
    print("Recent Decisions:", mem.get_recent_decisions())
