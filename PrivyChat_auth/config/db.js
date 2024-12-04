const Pool = require("PG").Pool;

const pool = new Pool({
  user: "jul",
  password: "chat168",
  host: "localhost",
  port: "5432",
  database: "chatapp",
});

module.exports = pool;
