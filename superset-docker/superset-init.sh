#!/bin/bash
set -e

echo "==> Waiting for Postgres..."
until python3 -c "
import socket, sys
hosts = ['postgres', 'demo-postgres', 'localhost']
for host in hosts:
    try:
        s = socket.create_connection((host, 5432), timeout=2)
        s.close()
        print(f'Connected to {host}:5432')
        sys.exit(0)
    except Exception as e:
        print(f'Cannot reach {host}:5432 - {e}')
sys.exit(1)
"; do
    echo "    Postgres not ready, retrying..."
    sleep 2
done
echo "==> Postgres is up."

echo "==> Installing psycopg2 into Superset venv..."
/app/.venv/bin/python -m pip install psycopg2-binary --quiet

echo "==> Verifying psycopg2 installation..."
/app/.venv/bin/python -c "import psycopg2; print('psycopg2 OK:', psycopg2.__version__)"

echo "==> Running Superset DB migrations..."
superset db upgrade

echo "==> Creating admin user..."
superset fab create-admin \
  --username admin \
  --firstname Admin \
  --lastname User \
  --email admin@demo.local \
  --password admin \
  || true

echo "==> Initialising Superset..."
superset init

echo "==> Adding PostgreSQL database connection..."
superset set-database-uri \
  --database_name "Demo PostgreSQL" \
  --uri "postgresql+psycopg2://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_DB}" \
  || true

echo "==> Starting Superset server..."
exec superset run -h 0.0.0.0 -p 8088 --with-threads --reload