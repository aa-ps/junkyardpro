const express = require("express");
const app = express();
const mysql = require("mysql2/promise"); // Importing promise-based version of mysql2
const cors = require("cors");

app.set("view engine", "ejs");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const connectionConfig = {
  host: "host.docker.internal",
  user: "root",
  password: "root",
  database: "db",
};

let connection;

const initDbConnection = async () => {
  connection = await mysql.createConnection(connectionConfig);
};

app.get("/years", async (req, res) => {
  const query = "SELECT DISTINCT year FROM vehicles ORDER BY year";
  try {
    const [results] = await connection.execute(query);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Query Error");
  }
});

app.get("/part-categories", async (req, res) => {
  const query = "SELECT DISTINCT name FROM parts_category ORDER BY name";
  try {
    const [results] = await connection.execute(query);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Query Error");
  }
});

app.get("/parts", async (req, res) => {
  const query = "SELECT name, category_id FROM parts ORDER BY name";
  try {
    const [results] = await connection.execute(query);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Query Error");
  }
});

app.get("/makes", async (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).send("Year is required");

  const query =
    "SELECT DISTINCT make FROM vehicles WHERE year = ? ORDER BY make";
  try {
    const [results] = await connection.execute(query, [year]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Query Error");
  }
});

app.get("/models", async (req, res) => {
  const { year, make } = req.query;
  if (!year || !make) return res.status(400).send("Year and Make are required");

  const query =
    "SELECT DISTINCT model FROM vehicles WHERE year = ? AND make = ? ORDER BY model";
  try {
    const [results] = await connection.execute(query, [year, make]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Query Error");
  }
});

app.get("/trims", async (req, res) => {
  const { year, make, model } = req.query;
  if (!year || !make || !model) {
    return res.status(400).send("Year, Make, and Model are required");
  }

  const query =
    "SELECT DISTINCT trim FROM vehicles WHERE year = ? AND make = ? AND model = ?";
  try {
    const [results] = await connection.execute(query, [year, make, model]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Query Error");
  }
});

app.get("/inventory", async (req, res) => {
  const query = `SELECT * FROM inventory`;
  try {
    const [results] = await connection.execute(query);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Query Error");
  }
});

app.post("/add-vehicle", async (req, res) => {
  const { year, make, model, trim, parts } = req.body;
  if (!Array.isArray(parts) || !parts.length) {
    return res
      .status(400)
      .send("Parts information is required and should be a non-empty array.");
  } else if (!year || !make || !model || !trim) {
    return res.status(400).send("All vehicle information is required.");
  }

  const vehicleQuery = `SELECT DISTINCT id FROM vehicles WHERE year=? AND make=? AND model=? AND trim=?`;

  try {
    const [vehicleResult] = await connection.execute(vehicleQuery, [
      year,
      make,
      model,
      trim,
    ]);
    const {id: vehicle_id} = vehicleResult;

    for (const part of parts) {
      const { name, category_id } = part;
      if (!name || !category_id) {
        return res
          .status(400)
          .send("Each part must have a name and a category.");
      }
    }

    res.json({ vehicle_id, message: "Vehicle and parts added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Query Error");
  }
});

app.get("/", (req, res) => {
  res.send("<h1>Hello</h1>");
});

app.listen(3333, async () => {
  console.log(`Listening at http://localhost:3333`);
  await initDbConnection();
});
