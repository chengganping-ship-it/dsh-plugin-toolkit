import os
from functools import lru_cache


class Settings:
    APP_NAME: str = "ATS Keyword Gap API"
    APP_VERSION: str = "1.0.0"

    API_KEY_HEADER: str = "X-API-Key"

    # Comma-separated list of valid API keys (format: key_id:secret)
    # In production, this would be in a database
    VALID_API_KEYS: dict = {}

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 30

    # Pricing per tier (USD cents per request)
    TIER_FREE: str = "free"
    TIER_BASIC: str = "basic"
    TIER_PRO: str = "pro"
    TIER_PRICES: dict = {
        "free": 0,
        "basic": 2,    # $0.02 per request
        "pro": 1,       # $0.01 per request (volume discount)
    }

    # Tier call limits per month
    TIER_LIMITS: dict = {
        "free": 100,
        "basic": 5000,
        "pro": -1,  # unlimited
    }

    # API key -> tier mapping
    KEY_TIERS: dict = {}

    def __init__(self):
        keys_env = os.getenv("ATS_API_KEYS", "")
        if keys_env:
            for entry in keys_env.split(","):
                parts = entry.strip().split(":")
                if len(parts) == 2:
                    key_id, secret = parts
                    self.VALID_API_KEYS[key_id] = secret

        tiers_env = os.getenv("ATS_KEY_TIERS", "")
        if tiers_env:
            for entry in tiers_env.split(","):
                parts = entry.strip().split(":")
                if len(parts) == 2:
                    key_id, tier = parts
                    self.KEY_TIERS[key_id] = tier


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# Default dev key for testing
DEFAULT_API_KEY_ID = "test-key-id"
DEFAULT_API_KEY_SECRET = "test-key-secret"
get_settings().VALID_API_KEYS[DEFAULT_API_KEY_ID] = DEFAULT_API_KEY_SECRET
get_settings().KEY_TIERS[DEFAULT_API_KEY_ID] = Settings.TIER_PRO

# Comprehensive skill/keyword taxonomy for matching
SKILL_KEYWORDS: set = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c\\+\\+", "c#", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r programming", "r language", "perl", "elixir",
    "clojure", "haskell", "lua", "dart", "matlab",

    # Web & Frontend
    "react", "angular", "vue", "vuejs", "svelte", "next\\.js", "nextjs", "node\\.js",
    "nodejs", "express", "django", "flask", "rails", "ruby on rails", "spring boot",
    "spring", "graphql", "restful", "rest api", "rest", "websocket", "webpack",
    "babel", "jquery", "bootstrap", "tailwind", "tailwindcss", "sass", "less",
    "html5?", "css3?", "redux", "mobx", "redux toolkit",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "terraform",
    "ansible", "jenkins", "circleci", "travis", "github actions", "ci\\/cd",
    "continuous integration", "continuous deployment", "microservices", "serverless",
    "lambda", "cloud functions", "azure functions",
    "datadog", "grafana", "prometheus", "elk stack", "splunk", "new relic",

    # Data & ML
    "machine learning", "deep learning", "neural network", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn", "pandas",
    "numpy", "scipy", "matplotlib", "seaborn", "plotly", "tableau", "power bi",
    "snowflake", "redshift", "bigquery", "spark", "hadoop", "airflow", "dagster",
    "mlflow", "kubeflow", "databricks", "dbt", "looker",

    # Databases
    "sql", "mysql", "postgresql", "postgres", "mongodb", "dynamodb", "cassandra",
    "redis", "elasticsearch", "neo4j", "sqlite", "oracle", "sql server",
    "microsoft sql", "supabase", "firebase", "realm",

    # System Design
    "distributed system", "high availability", "scalability", "load balancing",
    "caching", "cdn", "message queue", "rabbitmq", "kafka", "event-driven",
    "design pattern", "solid principles", "cap theorem", "sharding", "partitioning",

    # Security
    "oauth", "jwt", "ssl", "tls", "encryption", "authentication",
    "authorization", "penetration testing", "vulnerability", "xss", "csrf",
    "sql injection", "cybersecurity", "security",

# Methodology & Practices
    "agile", "scrum", "kanban", "tdd", "bdd", "ddd", "ci\\/cd",
    "pair programming", "code review", "refactoring", "design pattern",
    "microservices", "monolith", "soa",

    # Leadership & Soft Skills
    "technical lead", "team lead", "architect", "mentor", "mentoring",
    "cross-functional", "stakeholder management", "project management",
    "agile coach", "scrum master", "product owner",

    # General Tech
    "git", "version control", "github", "gitlab", "bitbucket", "jira",
    "confluence", "slack", "linux", "unix", "bash", "shell scripting",
    "networking", "tcp\\/ip", "http", "http\\/2", "http\\/3", "grpc",
    "protobuf", "avro", "json", "xml", "yaml",

    # Specific techniques
    "data pipeline", "etl", "elt", "data lake", "data warehouse",
    "feature engineering", "model deployment", "model training",
    "a\\/b testing", "ab testing", "statistics", "hypothesis testing",
    "time series", "anomaly detection", "recommendation system",

    # Soft skills
    "written communication", "verbal communication", "presentation",
    "collaboration", "problem solving", "critical thinking",
}


STOPWORDS: set = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "need", "must",
    "this", "that", "these", "those", "i", "you", "he", "she", "it",
    "we", "they", "me", "him", "her", "us", "them", "my", "your", "his",
    "its", "our", "their", "what", "which", "who", "when", "where",
    "how", "not", "no", "yes", "all", "each", "every", "both", "few",
    "more", "most", "other", "some", "such", "than", "too", "very",
    "just", "now", "then", "also", "if", "else", "up", "out", "about",
    "into", "through", "during", "before", "after", "above", "below",
    "between", "under", "again", "further", "once", "here", "there",
    "any", "own", "same", "different", "only", "because", "until",
    "while", "since", "although", "however", "therefore", "thus",
    "job", "description", "requirements", "preferred", "qualifications",
    "experience", "years", "required", "responsibilities", "duties",
    "ability", "skills", "knowledge", "strong", "excellent", "good",
    "working", "understanding", "familiar", "proficient", "expert",
    "candidate", "position", "role", "team", "company", "office",
    "remote", "hybrid", "full-time", "part-time", "contract",
    "negotiable", "compensation", "benefits", "salary", "bonus",
    "equity", "pto", "vacation", "insurance", "dental", "vision",
    "401k", "retirement", "maternity", "paternity", "schedule",
    "monday", "tuesday", "wednesday", "thursday", "friday",
    "weekend", "overtime", "travel", "relocation", "visa", "sponsorship",
}
