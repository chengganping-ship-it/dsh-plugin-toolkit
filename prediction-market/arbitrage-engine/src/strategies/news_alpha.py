"""
LLM News Alpha Strategy

Extracts trading signals from news using large language models.
Enters positions before human traders react.

Key insight: News has immediate impact on prediction markets.
If LLM can evaluate news faster than humans, you get alpha.

Pipeline:
1. Ingest news from RSS feeds
2. LLM evaluates impact on active markets
3. Generate trade signals with confidence
4. Execute trades
5. Track P&L for model refinement
"""
import time
import json
import logging
from typing import Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TradeSignal:
    """Generated trade signal"""
    market_question: str
    direction: str  # "YES" or "NO"
    impact: float  # [0, 1]
    confidence: float  # [0, 1]
    reasoning: str
    suggested_position_pct: float
    news_timestamp: float
    signal_timestamp: float


class NewsAlphaEngine:
    """
    LLM-powered news analysis for prediction market trading.
    
    Uses Chain-of-Thought prompting to evaluate news impact.
    """
    
    # News sources
    RSS_FEEDS = [
        "https://feeds.reuters.com/reuters/businessNews",
        "https://feeds.reuters.com/reuters/worldNews",
        "https://www.cnbc.com/id/100003114/device/rss/rss.html",  # Top News
        "https://www.cnbc.com/id/100376527/device/rss/rss.html",  # Economics
        "https://www.coindesk.com/arc/outboundfeeds/rss/",
        "https://cryptopanic.com/news/rss/",
    ]
    
    def __init__(self, llm_api_key: str, llm_provider: str, model_name: str,
                 poly_client=None, kalshi_client=None):
        self.llm_api_key = llm_api_key
        self.llm_provider = llm_provider
        self.model_name = model_name
        self.poly = poly_client
        self.kalshi = kalshi_client
        
        # Track processed articles to avoid duplicates
        self.processed_urls = set()
        self.signal_history = []
        
        # Performance tracking
        self.total_signals = 0
        self.executed_signals = 0
        self.pnl_attributed = 0.0
    
    async def scan_news(self) -> list:
        """
        Scan all news sources and generate trade signals.
        
        Returns:
            List of TradeSignal objects
        """
        signals = []
        
        # Fetch news from all sources
        articles = await self._fetch_all_news()
        
        # Get active markets for context
        markets = await self._get_active_market_questions()
        
        # Process each article
        for article in articles:
            if article["url"] in self.processed_urls:
                continue
            
            signal = await self._analyze_article(article, markets)
            self.processed_urls.add(article["url"])
            
            if signal and signal.confidence > 0.6:
                signals.append(signal)
                self.total_signals += 1
        
        # Sort by confidence
        signals.sort(key=lambda x: x.confidence, reverse=True)
        return signals
    
    async def _fetch_all_news(self) -> list:
        """Fetch articles from all RSS feeds"""
        import aiohttp
        import feedparser
        
        articles = []
        
        for feed_url in self.RSS_FEEDS:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(feed_url, timeout=10) as resp:
                        if resp.status == 200:
                            content = await resp.text()
                            feed = feedparser.parse(content)
                            
                            for entry in feed.entries[:20]:  # Top 20 per source
                                articles.append({
                                    "title": entry.get("title", ""),
                                    "content": entry.get("summary", entry.get("description", "")),
                                    "url": entry.get("link", ""),
                                    "published": entry.get("published_parsed", time.gmtime()),
                                    "source": feed_url
                                })
            except Exception as e:
                logger.debug(f"Failed to fetch {feed_url}: {e}")
        
        return articles
    
    async def _analyze_article(self, article: dict, markets: list) -> Optional[TradeSignal]:
        """
        Analyze a single article using LLM.
        
        Args:
            article: Dict with title, content, url, published, source
            markets: List of active market questions
            
        Returns:
            TradeSignal or None if no actionable insight
        """
        prompt = self._build_analysis_prompt(article, markets)
        
        try:
            response = await self._call_llm(prompt)
            return self._parse_signal(response, article)
        except Exception as e:
            logger.error(f"LLM analysis failed: {e}")
            return None
    
    def _build_analysis_prompt(self, article: dict, markets: list) -> str:
        """Build structured prompt for news analysis"""
        
        # Format top markets
        market_list = "\n".join([f"- {m}" for m in markets[:30]])
        
        return f"""You are a prediction market trader with expertise in evaluating news impact.

NEWS HEADLINE: {article['title']}
NEWS CONTENT: {article['content'][:500]}
SOURCE: {article['source']}
PUBLISHED: {article['published']}

ACTIVE PREDICTION MARKETS (sample):
{market_list}

TASK:
1. Determine if this news affects any active prediction markets
2. If yes, assess which direction (YES-favoring or NO-favoring)
3. Quantify confidence (0-1) based on news clarity and relevance
4. Provide 50-word reasoning
5. Suggest position size (0-10% of portfolio)

OUTPUT FORMAT (JSON only, no other text):
{{
  "affected": true/false,
  "market_question": "exact question text if affected",
  "direction": "YES" or "NO" or "NEUTRAL",
  "impact": 0.0-1.0,
  "confidence": 0.0-1.0,
  "reasoning": "explanation",
  "position_pct": 0.0-0.1
}}"""
    
    async def _call_llm(self, prompt: str) -> str:
        """Call LLM API"""
        import aiohttp
        
        if self.llm_provider == "openai":
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.llm_api_key}"}
            body = {
                "model": self.model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3
            }
        elif self.llm_provider == "deepseek":
            url = "https://api.deepseek.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.llm_api_key}"}
            body = {
                "model": self.model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3
            }
        else:
            raise ValueError(f"Unsupported LLM provider: {self.llm_provider}")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=body, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data["choices"][0]["message"]["content"]
                raise RuntimeError(f"LLM API error: {resp.status}")
    
    def _parse_signal(self, response: str, article: dict) -> Optional[TradeSignal]:
        """Parse LLM JSON response into TradeSignal"""
        try:
            # Extract JSON from response (handle markdown)
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            
            data = json.loads(json_str)
            
            if not data.get("affected", False):
                return None
            
            return TradeSignal(
                market_question=data.get("market_question", ""),
                direction=data.get("direction", "NEUTRAL"),
                impact=data.get("impact", 0),
                confidence=data.get("confidence", 0),
                reasoning=data.get("reasoning", ""),
                suggested_position_pct=data.get("position_pct", 0),
                news_timestamp=article.get("published", time.time()),
                signal_timestamp=time.time()
            )
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"Failed to parse signal: {e}")
            return None
    
    async def _get_active_market_questions(self) -> list:
        """Get list of active market questions"""
        questions = []
        
        if self.poly:
            try:
                markets = await self.poly.get_markets(limit=50)
                for m in markets:
                    q = m.get("question", "")
                    if q:
                        questions.append(q)
            except:
                pass
        
        return questions
