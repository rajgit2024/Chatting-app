const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_NAME,
  password: process.env.PG_PASS,
  port: process.env.PG_PORT,
});



pool.connect()
  .then(client => {
    console.log("Connected to PostgreSQL database successfully!");
    client.release();
  })
  .catch(err => console.error("Error connecting to PostgreSQL:", err));


module.exports = pool;
