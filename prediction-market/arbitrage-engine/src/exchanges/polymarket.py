"""
Polymarket CLOB (Central Limit Order Book) Client
Uses py-clob-client-v2 and gamma API for data

API Docs: https://docs.polymarket.com/
GitHub: https://github.com/Polymarket/py-clob-client
"""
import asyncio
import time
import json
from typing import Optional
from dataclasses import dataclass


@dataclass
class OrderBook:
    """Order book snapshot"""
    token_id: str
    bids: list  # [(price, size), ...]
    asks: list
    timestamp: float


@dataclass 
class Position:
    """Current position"""
    token_id: str
    side: str  # "yes" or "no"
    size: float
    avg_price: float
    unrealized_pnl: float


class PolymarketClient:
    """
    Client for Polymarket prediction market CLOB.
    
    Architecture:
    - Orders are signed EIP-712 messages (gasless until settlement)
    - Matching happens off-chain, settlement on Polygon
    - Non-custodial: you hold the keys
    """
    
    def __init__(self, private_key: str, chain_id: int = 137):
        self.private_key = private_key
        self.chain_id = chain_id
        self.host = "https://clob.polymarket.com"
        self.gamma_host = "https://gamma-api.polymarket.com"
        
        self._client = None
        self._api_creds = None
    
    async def initialize(self):
        """Initialize CLOB client and derive API credentials"""
        try:
            from py_clob_client_v2.client import ClobClient
            self._client = ClobClient(
                host=self.host,
                key=self.private_key,
                chain_id=self.chain_id
            )
            self._api_creds = self._client.create_or_derive_api_key()
            return True
        except ImportError:
            print("py-clob-client-v2 not installed. Run: pip install py-clob-client-v2")
            return False
    
    async def get_markets(self, active: bool = True, closed: bool = False, 
                         tag_id: Optional[int] = None, limit: int = 50) -> list:
        """
        Get list of active markets from Gamma API.
        
        Args:
            active: Only active markets
            closed: Exclude closed
            tag_id: Filter by tag (2=Politics, 100639=Sports, etc.)
            limit: Max results
            
        Returns:
            List of market dicts with question, outcomes, prices, condition_id
        """
        import aiohttp
        
        params = {
            "active": str(active).lower(),
            "closed": str(closed).lower(),
            "limit": limit
        }
        if tag_id:
            params["tag_id"] = tag_id
        
        url = f"{self.gamma_host}/markets"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as resp:
                if resp.status == 200:
                    return await resp.json()
                return []
    
    async def get_orderbook(self, token_id: str) -> Optional[OrderBook]:
        """
        Get L2 order book for a specific token.
        
        Args:
            token_id: ERC-1155 token ID for the position
            
        Returns:
            OrderBook with sorted bids and asks
        """
        import aiohttp
        
        url = f"{self.host}/book"
        params = {"token_id": token_id}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return OrderBook(
                        token_id=token_id,
                        bids=[(float(b['price']), float(b['size'])) for b in data.get('bids', [])],
                        asks=[(float(a['price']), float(a['size'])) for a in data.get('asks', [])],
                        timestamp=time.time()
                    )
                return None
    
    async def get_price(self, token_id: str, side: str = "buy") -> float:
        """
        Get current best price for a token.
        
        Args:
            token_id: Token ID
            side: "buy" (ask) or "sell" (bid)
            
        Returns:
            Price in USDC (0.00 to 1.00)
        """
        import aiohttp
        
        url = f"{self.host}/price"
        params = {"token_id": token_id, "side": side}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=self._get_auth_headers()) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return float(data.get("price", 0))
                return 0.0
    
    async def place_order(self, token_id: str, price: float, size: float, 
                         side: str, order_type: str = "GTC") -> dict:
        """
        Place a limit order.
        
        Args:
            token_id: Token ID to trade
            price: Limit price (0-1 USDC)
            size: Number of shares
            side: "buy" or "sell"
            order_type: "GTC" (Good Till Cancelled) or "FOK" (Fill or Kill)
            
        Returns:
            Order response dict
        """
        if not self._client:
            raise RuntimeError("Client not initialized")
        
        # Build and sign order using py-clob-client
        order_args = {
            "token_id": token_id,
            "price": str(price),
            "size": str(size),
            "side": side.upper(),
        }
        
        # In production, this would sign and submit:
        # order = self._client.create_order(order_args)
        # response = self._client.post_order(order)
        # return response
        
        return {"status": "simulated", "order": order_args}
    
    async def cancel_order(self, order_id: str) -> dict:
        """Cancel an open order"""
        if self._client:
            return self._client.cancel(order_id)
        return {"status": "not_initialized"}
    
    async def get_positions(self) -> list:
        """
        Get current positions across all markets.
        
        Returns:
            List of Position objects
        """
        import aiohttp
        
        url = f"{self.host}/positions"
        headers = self._get_auth_headers()
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return [
                        Position(
                            token_id=p.get("token_id", ""),
                            side=p.get("side", ""),
                            size=float(p.get("size", 0)),
                            avg_price=float(p.get("avg_price", 0)),
                            unrealized_pnl=float(p.get("unrealized_pnl", 0))
                        )
                        for p in data.get("positions", [])
                    ]
                return []
    
    async def get_balance(self) -> float:
        """
        Get USDC.e balance in Polymarket account.
        
        Returns:
            Balance in USDC
        """
        import aiohttp
        
        url = f"{self.host}/balance"
        headers = self._get_auth_headers()
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return float(data.get("balance", 0))
                return 0.0
    
    def _get_auth_headers(self) -> dict:
        """Get HMAC authentication headers"""
        if not self._api_creds:
            return {}
        
        timestamp = str(int(time.time() * 1000))
        message = f"{timestamp}GET"
        
        import hmac
        import hashlib
        
        signature = hmac.new(
            self._api_creds["secret"].encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return {
            "POLY-API-KEY": self._api_creds["key"],
            "POLY-SIGNATURE": signature,
            "POLY-TIMESTAMP": timestamp,
        }
