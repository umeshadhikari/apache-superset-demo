# Superset configuration for Payment Hub Demo
# See https://superset.apache.org/docs/installation/configuring-superset

import os

# Secret key — MUST be overridden via SUPERSET_SECRET_KEY env var in any non-demo environment.
SECRET_KEY = os.environ.get("SUPERSET_SECRET_KEY", "superset-secret-key-change-in-production")

# Allow embedding dashboards in iframes
FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
}

# CSRF and Talisman — disabled only when SUPERSET_ENV=development (the default for this demo).
# Set SUPERSET_ENV=production to re-enable these security controls.
_is_dev = os.environ.get("SUPERSET_ENV", "development") == "development"
WTF_CSRF_ENABLED = not _is_dev
TALISMAN_ENABLED = not _is_dev

# Content Security Policy — allow Angular dev server and backend to embed Superset in iframes.
TALISMAN_CONFIG = {
    "content_security_policy": {
        "frame-ancestors": ["'self'", "http://localhost:4200", "http://localhost:8080"],
    }
}

# CORS — allow Angular dev server and Spring Boot backend
ENABLE_CORS = True
CORS_OPTIONS = {
    "supports_credentials": True,
    "allow_headers": ["*"],
    "resources": {r"/api/*": {"origins": ["http://localhost:4200", "http://localhost:8080"]}},
}

# HTTP headers for embedding
HTTP_HEADERS = {"X-Frame-Options": "ALLOWALL"}

# Guest token configuration
GUEST_ROLE_NAME = "Gamma"
GUEST_TOKEN_JWT_EXP_SECONDS = 300  # 5-minute expiry; the Embedded SDK will refresh automatically
