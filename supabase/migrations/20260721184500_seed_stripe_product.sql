-- Seed product used by the Stripe test checkout
INSERT INTO products (id, name, unit_price, currency, is_active)
VALUES ('magnet-hommage-37mm', 'Magnet hommage 37mm', 800, 'eur', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  unit_price = EXCLUDED.unit_price,
  currency = EXCLUDED.currency,
  is_active = EXCLUDED.is_active;
