"""
Kalshi API Client
CFTC-regulated prediction market exchange

API Docs: https://docs.kalshi.com/
"""
import time
import json
import hmac
import hashlib
from typing import Optional


class KalshiClient:
    """
    Client for Kalshi prediction market exchange.
    
    Kalshi is CFTC-regulated (DCM license), operates like traditional futures.
    Uses REST API with HMAC-SHA256 authentication.
    """
    
    def __init__(self, api_key: str, private_key: str, email: str):
        self.api_key = api_key
        self.private_key = private_key
        self.email = email
        self.base_url = "https://trading-api.kalshi.com/v2"
        self.api_version = "v2"
    
    def _sign_request(self, method: str, path: str, body: str = "") -> dict:
        """
        Create HMAC-SHA256 signature for Kalshi API.
        
        Args:
            method: HTTP method (GET, POST, DELETE)
            path: API path (e.g., "/markets")
            request_body: JSON body string
            
        Returns:
            Dict with auth headers
        """
        timestamp = str(int(time.time() * 1000))
        message = f"{timestamp}{method.upper()}{path}{body}"
        
        signature = hmac.new(
            self.private_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return {
            "KALSHI-ACCESS-KEY": self.api_key,
            "KALSHI-ACCESS-SIGNATURE": signature,
            "KALSHI-ACCESS-TIMESTAMP": timestamp,
            "Content-Type": "application/json"
        }
    
    async def get_markets(self, ticker: Optional[str] = None, 
                         status: str = "active",
                         limit: int = 50) -> list:
        """
        Get list of available markets.
        
        Args:
            ticker: Filter by market ticker
            status: Market status filter
            limit: Max results
            
        Returns:
            List of market dicts
        """
        import aiohttp
        
        path = f"/trade-api/{self.api_version}/markets"
        params = {"status": status, "limit": limit}
        
        async with aiohttp.ClientSession() as session:
            url = self.base_url.replace("/v2", path)
            async with session.get(url, params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("markets", [])
                return []
    
    async def get_market(self, ticker: str) -> dict:
        """
        Get details for a specific market.
        
        Args:
            ticker: Market ticker symbol
            
        Returns:
            Market details dict
        """
        import aiohttp
        
        path = f"/trade-api/{self.api_version}/markets/{ticker}"
        
        async with aiohttp.ClientSession() as session:
            url = self.base_url.replace("/v2", path)
            async with session.get(url) as resp:
                if resp.status == 200:
                    return await resp.json()
                return {}
    
    async def get_orderbook(self, ticker: str) -> dict:
        """
        Get L2 order book for a market.
        
        Returns:
            Dict with yes/no bids and asks
        """
        import aiohttp
        
        path = f"/trade-api/{self.api_version}/markets/{ticker}/orderbook"
        
        async with aiohttp.ClientSession() as session:
            url = self.base_url.replace("/v2", path)
            async with session.get(url) as resp:
                if resp.status == 200:
                    return await resp.json()
                return {}
    
    async def get_price(self, ticker: str, side: str = "yes") -> float:
        """
        Get current best price for a market side.
        
        Args:
            ticker: Market ticker
            side: "yes" or "no"
            
        Returns:
            Price in cents (0-100)
        """
        orderbook = await self.get_orderbook(ticker)
        
        if side == "yes":
            bids = orderbook.get("yes_bids", [])
            return bids[0]["price"] / 100 if bids else 0.5
        else:
            asks = orderbook.get("yes_asks", [])
            return asks[0]["price"] / 100 if asks else 0.5
    
    async def place_order(self, ticker: str, side: str, action: str, 
                         count: int, price: float) -> dict:
        """
        Place a limit order.
        
        Args:
            ticker: Market ticker
            side: "yes" or "no"
            action: "buy" or "sell"
            count: Number of contracts
            price: Limit price (in cents, 0-100)
            
        Returns:
            Order response
        """
        import aiohttp
        
        path = "/trade-api/v2/orders"
        
        body = {
            "ticker": ticker,
            "side": side,
            "action": action,
            "count": count,
            "type": "limit",
            "price": int(price * 100)  # Convert to cents
        }
        
        headers = self._sign_request("POST", path, json.dumps(body))
        
        async with aiohttp.ClientSession() as session:
            url = self.base_url.replace("/v2", path)
            async with session.post(url, json=body, headers=headers) as resp:
                if resp.status in [200, 201]:
                    return await resp.json()
                error_text = await resp.text()
                return {"error": f"HTTP {resp.status}: {error_text}"}
    
    async def cancel_order(self, order_id: str) -> dict:
        """Cancel an open order"""
        import aiohttp
        
        path = f"/trade-api/v2/orders/{order_id}"
        headers = self._sign_request("DELETE", path)
        
        async with aiohttp.ClientSession() as session:
            url = self.base_url.replace("/v2", path)
            async with session.delete(url, headers=headers) as resp:
                if resp.status == 200:
                    return await resp.json()
                return {"error": resp.status}
    
    async def get_balance(self) -> dict:
        """Get account balance"""
        import aiohttp
        
        path = "/trade-api/v2/portfolio/balances"
        headers = self._sign_request("GET", path)
        
        async with aiohttp.ClientSession() as session:
            url = self.base_url.replace("/v2", path)
            async with session.get(url, headers=headers) as resp:
                if resp.status == 200:
                    return await resp.json()
                return {}
    
    async def get_positions(self) -> list:
        """Get current positions"""
        import aiohttp
        
        path = "/trade-api/v2/portfolio/positions"
        headers = self._sign_request("GET", path)
        
        async with aiohttp.ClientSession() as session:
            url = self.base_url.replace("/v2", path)
            async with session.get(url, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("positions", [])
                return []
    
    async def get_fills(self) -> list:
        """Get recent fills"""
        import aiohttp
        
        path = "/trade-api/v2/portfolio/fills"
        headers = self._sign_request("GET", path)
        
        async with aiohttp.ClientSession() as session:
            url = self.base_url.replace("/v2", path)
            async with session.get(url, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("fills", [])
                return []
