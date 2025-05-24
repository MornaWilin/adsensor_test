CREATE TABLE IF NOT EXISTS films (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS  subcategories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS  film_subcategory (
  subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
  film_id INTEGER REFERENCES films(id),
  PRIMARY KEY (subcategory_id, film_id)
);

  INSERT INTO films (id, name) VALUES
    (1, 'The Matrix'),
    (2, 'Inception'),
    (3, 'Interstellar'),
    (4, 'The Dark Knight'),
    (5, 'Pulp Fiction');

CREATE OR REPLACE FUNCTION get_catalog_json()
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'films', (
                SELECT json_agg(json_build_object('id', f.id, 'name', f.name))
                FROM films f
            ),
            'categories', (
                SELECT json_agg(
                    json_build_object(
                        'id', c.id,
                        'name', c.name,
                        'subCategories', (
                            SELECT json_agg(
                                json_build_object(
                                    'id', s.id,
                                    'name', s.name,
                                    'filmIds', (
                                        SELECT json_agg(fs.film_id)
                                        FROM film_subcategory fs
                                        WHERE fs.subcategory_id = s.id
                                    )
                                )
                            )
                            FROM subcategories s
                            WHERE s.category_id = c.id
                        )
                    )
                )
                FROM categories c
            )
        )
    );
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION generate_subcategory_id()
RETURNS TRIGGER AS $$
DECLARE
  max_index INT;
BEGIN
  -- Get the last index in this category
  SELECT 
    COALESCE(
      MAX(CAST(SUBSTRING(id::TEXT FROM LENGTH(NEW.category_id::TEXT) + 2) AS INT)),
      0
    )
  INTO max_index
  FROM subcategories
  WHERE category_id = NEW.category_id;

  -- Build new ID: concat category_id + 0 + (index + 1), then cast to INT
  NEW.id := (NEW.category_id::TEXT || '0' || (max_index + 1)::TEXT)::BIGINT;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_subcategory_id ON subcategories;

CREATE TRIGGER set_subcategory_id
BEFORE INSERT ON subcategories
FOR EACH ROW
EXECUTE FUNCTION generate_subcategory_id();
