import threading
import time
import logging
from typing import List, Dict, Any
from datetime import datetime
from app.agents.market.alerts import get_sector_recommendations
from .email_service import send_market_report

logger = logging.getLogger(__name__)

class AlertsManager:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(AlertsManager, cls).__new__(cls)
                    cls._instance.latest_alerts = []
                    cls._instance.last_updated = None
                    cls._instance.is_running = False
        return cls._instance

    def start_monitoring(self):
        if not self.is_running:
            self.is_running = True
            thread = threading.Thread(target=self._monitor_loop, daemon=True)
            thread.start()
            logger.info("Background news monitoring service started.")

    def _monitor_loop(self):
        while self.is_running:
            try:
                logger.info("Executing periodic sector alert refresh...")
                self.latest_alerts = get_sector_recommendations()
                self.last_updated = datetime.now()
                logger.info(f"Sector alerts refreshed at {self.last_updated}")
                
                # Send automated email report
                send_market_report(self.latest_alerts)
                
                # Sleep for 12 hours (43200 seconds)
                time.sleep(43200)
            except Exception as e:
                logger.error(f"Error in background monitoring loop: {e}")
                time.sleep(300) # Wait 5 mins on error then retry

    def get_alerts(self) -> Dict[str, Any]:
        return {
            "success": True,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None,
            "alerts": self.latest_alerts
        }

# Global singleton instance
alerts_manager = AlertsManager()
