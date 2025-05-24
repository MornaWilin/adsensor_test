import express from 'express';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
import cors from 'cors'

const app = express(); 
const port = 3000;


const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'admin123',
  database: process.env.PGDATABASE || 'postgres',
  port: process.env.PGPORT || 5432,
});

app.use(cors(), bodyParser.json());

app.get('/films', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM films');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch');
    }

});

app.get('/data', async (req, res) => {
    
        try {
            const result = await pool.query('SELECT get_catalog_json()');
            res.json(result.rows[0].get_catalog_json);
        } catch (err) {
            console.error(err);
            res.status(500).send('Failed to fetch data');
        }
    });

app.get('/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch categories');
    }
});

app.post("/categories/update", async (req, res) => {
    const client = await pool.connect();
    const { newCategories, updatedCategories, deletedCategories } = req.body;
  
    try {
      await client.query("BEGIN");
  
      // Delete categories
      for (const cat of deletedCategories) {
        await client.query("DELETE FROM subcategories WHERE category_id = $1", [cat]);
        await client.query("DELETE FROM categories WHERE id = $1", [cat]);
      }
  
      // Insert new categories
      for (const cat of newCategories) {
        console.log(cat)
        const { rows: catRows } = await client.query(
          "INSERT INTO categories(name) VALUES($1) RETURNING id",
          [cat.name]
        );
        const categoryId = catRows[0].id;
  
        for (const sub of cat.subCategories) {
          const { rows: subRows } = await client.query(
            "INSERT INTO subcategories(name, category_id) VALUES($1, $2) RETURNING id",
            [sub.name, categoryId]
          );
          const subId = subRows[0].id;
  
          for (const filmId of sub.filmIds) {
            await client.query(
              "INSERT INTO film_subcategory(subcategory_id, film_id) VALUES($1, $2)",
              [subId, filmId]
            );
          }
        }
      }
  
      // Update existing categories
      for (const cat of updatedCategories) {
        await client.query("UPDATE categories SET name = $1 WHERE id = $2", [
          cat.name,
          cat.id,
        ]);
  
        for (const del of cat.deletedSubCategories || []) {
          await client.query("DELETE FROM subcategories WHERE id = $1", [del.id]);
        }
  
        for (const sub of cat.updatedSubCategories) {
          let subId = sub.id;
  
          if (!subId) {
            const { rows: subRows } = await client.query(
              "INSERT INTO subcategories(name, category_id) VALUES($1, $2) RETURNING id",
              [sub.name, cat.id]
            );
            subId = subRows[0].id;
          } else {
            await client.query("UPDATE subcategories SET name = $1 WHERE id = $2", [
              sub.name,
              subId,
            ]);
  
            await client.query(
              "DELETE FROM film_subcategory WHERE subcategory_id = $1",
              [subId]
            );
          }
  
          for (const filmId of sub.filmIds) {
            await client.query(
              "INSERT INTO film_subcategory(subcategory_id, film_id) VALUES($1, $2)",
              [subId, filmId]
            );
          }
        }
      }
  
      await client.query("COMMIT");
      res.json({ success: true });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: "Something went wrong" });
    } finally {
      client.release();
    }
  });
  
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }

export { pool };
export default app; 