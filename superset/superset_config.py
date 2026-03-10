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
    "frame_options": "ALLOWALL",
    "content_security_policy": None
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

# ── FIS Global Custom Theme ─────────────────────────────────
# Hide the Superset logo — use a transparent 1px image
APP_ICON = "/static/assets/images/favicon.png"
APP_NAME = "Payment Hub"
# Favicons can also be overridden
FAVICONS = [{"href": "/static/assets/images/favicon.png"}]

# Inject custom CSS globally into every Superset page
CUSTOM_STYLE_SHEETS = ["/static/assets/fis-superset-theme.css"]

# FIS-branded colour scheme for ECharts visualisations
EXTRA_CATEGORICAL_COLOR_SCHEMES = [
    {
        "id": "fisGlobal",
        "description": "FIS Global brand colours",
        "label": "FIS Global",
        "isDefault": True,
        "colors": [
            "#4BCD3E", "#00c1d5", "#00565b", "#8dc63f", "#0a2540",
            "#3fb835", "#006d75", "#7ec8e3", "#2ecc71", "#1abc9c",
        ],
    }
]
