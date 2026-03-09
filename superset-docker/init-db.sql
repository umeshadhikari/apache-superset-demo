-- init-db.sql
-- This script runs automatically when the PostgreSQL container starts
-- for the first time. Add your demo seed data here.

-- Example: create a sample table for the Angular demo
CREATE TABLE IF NOT EXISTS demo_metrics (
    id            SERIAL PRIMARY KEY,
    metric_name   VARCHAR(100) NOT NULL,
    metric_value  NUMERIC(12, 2) NOT NULL,
    recorded_at   TIMESTAMP DEFAULT NOW()
);

-- Seed some sample rows
INSERT INTO demo_metrics (metric_name, metric_value, recorded_at) VALUES
    ('page_views',       12453.00, '2026-03-01 08:00:00'),
    ('unique_visitors',   3841.00, '2026-03-01 08:00:00'),
    ('bounce_rate',         42.30, '2026-03-01 08:00:00'),
    ('avg_session_sec',    187.50, '2026-03-01 08:00:00'),
    ('page_views',       13102.00, '2026-03-02 08:00:00'),
    ('unique_visitors',   4012.00, '2026-03-02 08:00:00'),
    ('bounce_rate',         39.80, '2026-03-02 08:00:00'),
    ('avg_session_sec',    195.20, '2026-03-02 08:00:00');
