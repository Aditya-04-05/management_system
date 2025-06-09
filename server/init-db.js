const pool = require("./db");
const bcrypt = require("bcrypt");

const initializeDatabase = async () => {
  try {
    console.log("Checking if admin user exists...");

    // Check if users table exists
    try {
      const tableCheck = await pool.query("SELECT to_regclass('public.users')");

      if (!tableCheck.rows[0].to_regclass) {
        console.log("Users table does not exist. Creating tables...");

        // Create users table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            CONSTRAINT valid_role CHECK (role IN ('admin', 'user'))
          )
        `);

        console.log("Users table created.");
      }
    } catch (tableErr) {
      console.error("Error checking for users table:", tableErr);
      // Create users table anyway
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          user_id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'user',
          CONSTRAINT valid_role CHECK (role IN ('admin', 'user'))
        )
      `);
      console.log("Users table created.");
    }

    // Check if admin user exists
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE username = 'admin'"
    );

    console.log("User check result:", userCheck.rows);

    if (userCheck.rows.length === 0) {
      console.log("Creating admin user...");

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      console.log("Password hashed:", hashedPassword);

      // Create admin user
      const insertResult = await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *",
        ["admin", hashedPassword, "admin"]
      );

      console.log("Admin user created:", insertResult.rows[0]);
    } else {
      console.log("Admin user already exists:", userCheck.rows[0]);
    }

    console.log("Database initialization complete.");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    pool.end();
  }
};

initializeDatabase();
