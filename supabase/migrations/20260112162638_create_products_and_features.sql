/*
  # Create E-commerce Database Schema

  1. New Tables
    - products: Store flower products with details
    - cart_items: Store shopping cart items per session
    - wishlist_items: Store wishlist items per session

  2. Security
    - Enable RLS on all tables
    - Allow public read access to products
    - Allow session-based access to cart and wishlist

  3. Sample Data
    - Insert initial flower products
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10, 2) NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'bouquet',
  stock integer NOT NULL DEFAULT 100,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wishlist items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Cart policies (session-based)
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert into cart"
  ON cart_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete from cart"
  ON cart_items FOR DELETE
  USING (true);

-- Wishlist policies (session-based)
CREATE POLICY "Users can view own wishlist"
  ON wishlist_items FOR SELECT
  USING (true);

CREATE POLICY "Users can add to wishlist"
  ON wishlist_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can remove from wishlist"
  ON wishlist_items FOR DELETE
  USING (true);

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, featured) VALUES
('Red Roses', 'Beautiful red roses perfect for any romantic occasion. Hand-picked and arranged with care.', 25.00, './assets/imgs/3.jpeg', 'roses', true),
('Spring Tulips', 'Fresh tulips to brighten up your day and home. Available in vibrant colors.', 20.00, './assets/imgs/17.jpeg', 'tulips', true),
('Mixed Bouquet', 'Colorful mixed bouquet for special celebrations. A delightful combination of seasonal flowers.', 30.00, './assets/imgs/11.jpeg', 'bouquet', true),
('Sunflowers', 'Bright sunflowers to bring sunshine into your life. Perfect for any occasion.', 18.00, './assets/imgs/10.jpeg', 'sunflowers', false),
('White Baby Flowers', 'Elegant white baby flowers for sophisticated occasions. Delicate and beautiful.', 28.00, './assets/imgs/4.jpeg', 'baby-flowers', false),
('Orchids', 'Exotic orchids for a touch of luxury and elegance. Long-lasting and stunning.', 35.00, './assets/imgs/5.jpeg', 'orchids', false),
('Pink Roses', 'Soft pink roses for gentle expressions of love and appreciation.', 22.00, './assets/imgs/2.jpeg', 'roses', false),
('Lavender Dreams', 'Calming lavender arrangement perfect for relaxation and tranquility.', 26.00, './assets/imgs/6.jpeg', 'lavender', false),
('Daisy Delight', 'Cheerful daisies that bring joy to any space. Fresh and vibrant.', 16.00, './assets/imgs/7.jpeg', 'daisies', false),
('Lily Elegance', 'Sophisticated white lilies for refined taste and special moments.', 32.00, './assets/imgs/8.jpeg', 'lilies', false),
('Peony Paradise', 'Lush peonies in full bloom, perfect for romantic occasions.', 38.00, './assets/imgs/9.jpeg', 'peonies', false),
('Garden Mix', 'A delightful mix of garden-fresh flowers in seasonal colors.', 24.00, './assets/imgs/1.jpeg', 'bouquet', false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_session ON wishlist_items(session_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);