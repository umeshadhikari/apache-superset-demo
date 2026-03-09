"""
Superset configuration – tuned for local development & Angular embedding.
"""
import os

# ── Core ──────────────────────────────────────────────────────
SECRET_KEY = os.environ.get("SUPERSET_SECRET_KEY", "change-me")

# ── Proxy / routing fix (required for Docker) ────────────────
ENABLE_PROXY_FIX = True

# ── Disable CSRF for local dev (allows Angular API calls) ────
WTF_CSRF_ENABLED = False

# ── Metadata DB (Superset's own tables) ──────────────────────
SQLALCHEMY_DATABASE_URI = (
    f"postgresql+psycopg2://"
    f"{os.environ.get('DATABASE_USER', 'demo_user')}:"
    f"{os.environ.get('DATABASE_PASSWORD', 'demo_pass')}@"
    f"{os.environ.get('DATABASE_HOST', 'postgres')}:"
    f"{os.environ.get('DATABASE_PORT', '5432')}/"
    f"{os.environ.get('DATABASE_DB', 'demo_db')}"
)

# ── Cache (Redis) ─────────────────────────────────────────────
CACHE_CONFIG = {
    "CACHE_TYPE": "RedisCache",
    "CACHE_DEFAULT_TIMEOUT": 300,
    "CACHE_KEY_PREFIX": "superset_",
    "CACHE_REDIS_HOST": os.environ.get("REDIS_HOST", "redis"),
    "CACHE_REDIS_PORT": int(os.environ.get("REDIS_PORT", 6379)),
    "CACHE_REDIS_DB": 1,
}

# ── CORS – Allow your Angular dev server ─────────────────────
ENABLE_CORS = True
CORS_OPTIONS = {
    "supports_credentials": True,
    "allow_headers": ["*"],
    "resources": [r"/api/*"],
    "origins": [
        "http://localhost:4200",   # Angular default dev server
        "http://127.0.0.1:4200",
        "http://localhost:3000",   # in case you use a different port
    ],
}

# ── Embedding – Allow Superset dashboards in iframes ─────────
# Set to False so dashboards can be loaded inside Angular iframes
HTTP_HEADERS = {
    "X-Frame-Options": "ALLOWALL",
}
TALISMAN_ENABLED = False           # disable CSP in dev mode

# Enable the "public" role so guest/anonymous users can view
# embedded dashboards (optional – turn off if you need auth)
PUBLIC_ROLE_LIKE = "Gamma"

# ── Feature flags ─────────────────────────────────────────────
FEATURE_FLAGS = {
    "EMBEDDABLE_CHARTS": True,
    "EMBEDDED_SUPERSET": True,
    "ENABLE_TEMPLATE_PROCESSING": True,
}

# ── Guest token for embedded SDK ──────────────────────────────
GUEST_ROLE_NAME = "Public"
GUEST_TOKEN_JWT_SECRET = SECRET_KEY
GUEST_TOKEN_JWT_ALGO = "HS256"
GUEST_TOKEN_HEADER_NAME = "X-GuestToken"
