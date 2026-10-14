-- SalesBridge demo data
--
-- Adds customers, products, and ~60 sales (with line items) to the existing schema
-- from the README's "Database SetUp" section. Safe to run more than once:
--   * customers and products use ON CONFLICT DO NOTHING (existing rows are kept)
--   * the sales block is skipped if the sales table already has 10+ rows
--
-- Run it with:
--   psql -U postgres -h 127.0.0.1 -d SalesBridge -f database/seed.sql
--
-- Notes
--   * Sale dates are relative to NOW(): about 60 sales spread over the last ~200 days,
--     weighted toward recent days, at business hours (9am-7pm), so the dashboard's
--     weekly, monthly, and category charts all have data. A few sales land "today".
--   * Product stock levels are NOT reduced by these sales; they are the "current" stock.
--     Six products start below their low-stock threshold (20) on purpose.
--   * No login accounts are created here. Register users through the app.

-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------
INSERT INTO customers (name, email, phone, rewardpointsbalance) VALUES
    ('David Okafor',     'david.okafor@example.com',     '555-0102',  340),
    ('Priya Natarajan',  'priya.n@example.com',          '555-0103',   92),
    ('Liam Brooks',      'liam.brooks@example.com',      '555-0104', 2110),
    ('Sofia Reyes',      'sofia.reyes@example.com',      '555-0105',   15),
    ('Ethan Walker',     'ethan.walker@example.com',     '555-0106',  680),
    ('Grace Kim',        'grace.kim@example.com',        '555-0107',  455),
    ('Noah Patel',       'noah.patel@example.com',       '555-0108', 1990),
    ('Isabella Rossi',   'isabella.rossi@example.com',   '555-0109',   60),
    ('Marcus Lee',       'marcus.lee@example.com',       '555-0110',  810),
    ('Ava Johnson',      'ava.johnson@example.com',      '555-0111',  275),
    ('Mateo Garcia',     'mateo.garcia@example.com',     '555-0112',  520),
    ('Hannah Schmidt',   'hannah.schmidt@example.com',   '555-0113',  130)
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Products (24 across Electronics, Home Goods, Apparel, Other)
-- ---------------------------------------------------------------------------
INSERT INTO products (sku, productname, price, stocklevel, category, lowstockthreshold) VALUES
    -- Electronics
    ('SKU-1001', 'Wireless Earbuds',          59.99,  80, 'Electronics', 20),
    ('SKU-1188', 'USB-C Fast Charger',        24.99,  12, 'Electronics', 20),
    ('SKU-2865', 'Bluetooth Speaker',         44.50,   6, 'Electronics', 20),
    ('SKU-1305', 'Smartwatch',               129.00,  35, 'Electronics', 20),
    ('SKU-1420', 'Portable Power Bank',       29.99,  58, 'Electronics', 20),
    ('SKU-1577', 'Wireless Mouse',            19.99,  90, 'Electronics', 20),
    -- Home Goods
    ('SKU-3042', 'Ceramic Cookware Set',      89.00,  19, 'Home Goods',  20),
    ('SKU-3110', 'Throw Blanket',             32.00,  55, 'Home Goods',  20),
    ('SKU-3299', 'Table Lamp',                27.75,  41, 'Home Goods',  20),
    ('SKU-3351', 'Scented Candle Set',        21.50,  64, 'Home Goods',  20),
    ('SKU-3408', 'Bath Towel Set',            38.00,  47, 'Home Goods',  20),
    ('SKU-3516', 'Kitchen Knife Block',       74.99,  15, 'Home Goods',  20),
    -- Apparel
    ('SKU-4021', 'Men''s Denim Jacket',       69.99,  30, 'Apparel',     20),
    ('SKU-4188', 'Women''s Running Shoes',    79.99,   8, 'Apparel',     20),
    ('SKU-4290', 'Cotton T-Shirt (3-pack)',   22.50, 120, 'Apparel',     20),
    ('SKU-4333', 'Wool Beanie',               16.00,  70, 'Apparel',     20),
    ('SKU-4402', 'Yoga Leggings',             44.00,  38, 'Apparel',     20),
    ('SKU-4519', 'Hooded Sweatshirt',         49.99,  26, 'Apparel',     20),
    -- Other
    ('SKU-5010', 'Reusable Water Bottle',     14.99,  73, 'Other',       20),
    ('SKU-5044', 'Notebook Set',               9.99,  17, 'Other',       20),
    ('SKU-5091', 'Desk Organizer',            19.25,  26, 'Other',       20),
    ('SKU-5127', 'Sticker Pack',               6.50, 200, 'Other',       20),
    ('SKU-5203', 'Board Game',                34.99,  22, 'Other',       20),
    ('SKU-5266', 'Compact Umbrella',          18.00,  45, 'Other',       20)
ON CONFLICT (sku) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Sales and sale items
-- Everything is derived from arithmetic on the order number (n), so the result is
-- deterministic and each sale's total always equals the sum of its line items.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    existing_sales integer;
    base_id        integer;
    p_count        integer;
    c_count        integer;
    seed_user      integer;
BEGIN
    SELECT count(*) INTO existing_sales FROM sales;
    IF existing_sales >= 10 THEN
        RAISE NOTICE 'sales already has % rows - skipping the sales seed', existing_sales;
        RETURN;
    END IF;

    SELECT count(*)                  INTO p_count   FROM products;
    SELECT count(*)                  INTO c_count   FROM customers;
    SELECT min(userid)               INTO seed_user FROM users;   -- NULL is fine if no users yet
    SELECT coalesce(max(saleid), 0)  INTO base_id   FROM sales;

    CREATE TEMP TABLE seed_products ON COMMIT DROP AS
        SELECT row_number() OVER (ORDER BY sku) AS rn, sku, price FROM products;

    CREATE TEMP TABLE seed_customers ON COMMIT DROP AS
        SELECT row_number() OVER (ORDER BY customerid) AS rn, customerid FROM customers;

    -- One order per n (1..60). n = 1 is the most recent; saleid is assigned so
    -- that older sales get lower ids (sid = base + 61 - n).
    CREATE TEMP TABLE seed_orders ON COMMIT DROP AS
        SELECT n,
               base_id + 61 - n AS sid,
               c.customerid,
               LEAST(
                   date_trunc('day', now())
                       - ((200 * n * n / 3600) * interval '1 day')       -- more recent days are denser
                       + ((9 + (n * 5) % 11) * interval '1 hour')        -- 9am to 7pm
                       + (((n * 17) % 60) * interval '1 minute'),
                   now() - (n * interval '17 minutes')                   -- never in the future
               ) AS saledate
        FROM generate_series(1, 60) AS n
        JOIN seed_customers c ON c.rn = ((n * 7) % c_count) + 1;

    -- 1 to 3 line items per order, each a different product, quantity 1 to 3.
    CREATE TEMP TABLE seed_lines ON COMMIT DROP AS
        SELECT n,
               k AS lineno,
               p.sku,
               p.price AS unitprice,
               1 + ((n + k) % 3) AS quantity
        FROM generate_series(1, 60) AS n
        CROSS JOIN generate_series(1, 3) AS k
        JOIN seed_products p ON p.rn = ((n * 5 + k * 7) % p_count) + 1
        WHERE k <= 1 + (n % 3);

    INSERT INTO sales (saleid, saledate, totalamount, customerid, userid)
    SELECT o.sid,
           o.saledate,
           (SELECT sum(l.quantity * l.unitprice) FROM seed_lines l WHERE l.n = o.n),
           o.customerid,
           seed_user
    FROM seed_orders o
    ORDER BY o.sid;

    INSERT INTO saleitems (saleid, lineno, quantity, unitprice, sku)
    SELECT o.sid, l.lineno, l.quantity, l.unitprice, l.sku
    FROM seed_lines l
    JOIN seed_orders o USING (n)
    ORDER BY o.sid, l.lineno;

    -- We assigned saleids by hand, so move the serial sequence past them.
    PERFORM setval(pg_get_serial_sequence('sales', 'saleid'), (SELECT max(saleid) FROM sales));

    RAISE NOTICE 'Seeded 60 sales (ids % to %)', base_id + 1, base_id + 60;
END
$$;

-- ---------------------------------------------------------------------------
-- Quick summary
-- ---------------------------------------------------------------------------
SELECT (SELECT count(*) FROM customers)  AS customers,
       (SELECT count(*) FROM products)   AS products,
       (SELECT count(*) FROM sales)      AS sales,
       (SELECT count(*) FROM saleitems)  AS sale_items;
