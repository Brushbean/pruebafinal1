import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: "dpg-d4pkjdadbo4c73bck9og-a.oregon-postgres.render.com",
  port: 5432,
  database: "test1_pol5",
  user: "gael",
  password: "pm7uB2Cyadoht2Rpc57dE96rFL4t0ght",
  ssl: { rejectUnauthorized: false }
});

export default pool;
