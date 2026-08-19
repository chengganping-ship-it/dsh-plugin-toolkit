"""
Simple Dashboard Server for monitoring engine performance

Runs a FastAPI server on port 8080 with:
- Dashboard UI at /
- Metrics API at /api/metrics
- Health check at /api/health
"""
import asyncio
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class DashboardServer:
    """FastAPI dashboard for monitoring the arbitrage engine"""
    
    def __init__(self, engine):
        self.engine = engine
        self.start_time = time.time()
    
    async def start(self):
        """Start the dashboard server"""
        try:
            import uvicorn
            from fastapi import FastAPI
            from fastapi.responses import JSONResponse, HTMLResponse
            
            app = FastAPI(title="Prediction Market Arbitrage Engine")
            
            @app.get("/")
            async def dashboard():
                return HTMLResponse(content=self._render_dashboard())
            
            @app.get("/api/health")
            async def health():
                return {"status": "healthy", "uptime_seconds": time.time() - self.start_time}
            
            @app.get("/api/metrics")
            async def metrics():
                return {
                    "uptime_seconds": time.time() - self.start_time,
                    "total_trades": self.engine.total_trades,
                    "total_pnl": self.engine.total_pnl,
                    "win_count": self.engine.win_count,
                    "loss_count": self.engine.loss_count,
                    "win_rate": self.engine.win_count / max(self.engine.total_trades, 1),
                    "circuit_breaker_level": self.engine.circuit_breaker.level if self.engine.circuit_breaker else "N/A",
                    "kelly_capital": self.engine.kelly.capital if self.engine.kelly else 0,
                }
            
            config = uvicorn.Config(app="src.monitoring.dashboard:app", host="0.0.0.0", port=8080, log_level="info")
            server = uvicorn.Server(config)
            await server.serve()
            
        except ImportError:
            logger.warning("uvicorn not installed. Dashboard disabled.")
        except Exception as e:
            logger.error(f"Dashboard error: {e}")
    
    def _render_dashboard(self) -> str:
        """Render simple HTML dashboard"""
        win_rate = self.engine.win_count / max(self.engine.total_trades, 1)
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Prediction Market Arbitrage Engine</title>
            <meta http-equiv="refresh" content="30">
            <style>
                body {{ font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }}
                .metric {{ background: #16213e; padding: 15px; margin: 10px; border-radius: 8px; display: inline-block; min-width: 200px; }}
                .positive {{ color: #4ecca3; }}
                .negative {{ color: #e74c3c; }}
                h1 {{ color: #4ecca3; }}
            </style>
        </head>
        <body>
            <h1>Prediction Market Arbitrage Engine</h1>
            <div class="metric">
                <div>Uptime</div>
                <strong>{int(time.time() - self.start_time)}s</strong>
            </div>
            <div class="metric">
                <div>Total Trades</div>
                <strong>{self.engine.total_trades}</strong>
            </div>
            <div class="metric">
                <div>Total P&L</div>
                <strong class="{'positive' if self.engine.total_pnl >= 0 else 'negative'}">${self.engine.total_pnl:.2f}</strong>
            </div>
            <div class="metric">
                <div>Win Rate</div>
                <strong>{win_rate:.1%}</strong>
            </div>
            <div class="metric">
                <div>Circuit Breaker</div>
                <strong>{self.engine.circuit_breaker.level if self.engine.circuit_breaker else 'N/A'}</strong>
            </div>
            <div class="metric">
                <div>Capital</div>
                <strong>${self.engine.kelly.capital if self.engine.kelly else 0:.2f}</strong>
            </div>
        </body>
        </html>
        """
