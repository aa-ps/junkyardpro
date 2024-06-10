const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = 3333;

const connectionConfig = {
  host: "host.docker.internal",
  user: "root",
  password: "root",
  database: "db",
};

let connection;

const initDbConnection = async () => {
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log("Database connected successfully.");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

const executeQuery = async (query, params = []) => {
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (err) {
    console.error("Database Query Error:", err);
    throw new Error("Database Query Error");
  }
};

// Routes

app.get("/years", async (req, res) => {
  const query = "SELECT DISTINCT year FROM vehicles ORDER BY year";
  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/part-categories", async (req, res) => {
  const query = "SELECT DISTINCT id, name FROM parts_category ORDER BY name";
  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/parts", async (req, res) => {
  const query = "SELECT DISTINCT id, name, category_id FROM parts ORDER BY name";
  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/makes", async (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).send("Year is required");

  const query =
    "SELECT DISTINCT make FROM vehicles WHERE year = ? ORDER BY make";
  try {
    const results = await executeQuery(query, [year]);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/models", async (req, res) => {
  const { year, make } = req.query;
  if (!year || !make) return res.status(400).send("Year and Make are required");

  const query =
    "SELECT DISTINCT model FROM vehicles WHERE year = ? AND make = ? ORDER BY model";
  try {
    const results = await executeQuery(query, [year, make]);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/trims", async (req, res) => {
  const { year, make, model } = req.query;
  if (!year || !make || !model)
    return res.status(400).send("Year, Make, and Model are required");

  const query =
    "SELECT DISTINCT trim FROM vehicles WHERE year = ? AND make = ? AND model = ?";
  try {
    const results = await executeQuery(query, [year, make, model]);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/inventory", async (req, res) => {
  const query = "SELECT * FROM added_vehicles";
  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/add-vehicle", async (req, res) => {
  const { year, make, model, trim, parts } = req.body;

  if (
    !year ||
    !make ||
    !model ||
    !trim ||
    !Array.isArray(parts) ||
    !parts.length
  ) {
    return res
      .status(400)
      .send(
        "All vehicle information and a non-empty parts array are required."
      );
  }

  const vehicleQuery =
    "SELECT DISTINCT id FROM vehicles WHERE year = ? AND make = ? AND model = ? AND trim = ?";
  const addVehicleQuery = "INSERT INTO added_vehicles (vehicle_id) VALUES (?)";

  try {
    const vehicleResults = await executeQuery(vehicleQuery, [
      year,
      make,
      model,
      trim,
    ]);

    if (vehicleResults.length === 0) {
      return res.status(404).send("Vehicle not found.");
    }

    const { id: vehicle_id } = vehicleResults[0];
    await executeQuery(addVehicleQuery, [vehicle_id]);

    const addedVehicleId = (
      await executeQuery("SELECT LAST_INSERT_ID() AS id")
    )[0].id;

    const addPartsPromises = parts.map(({id, name, category_id, available}) =>
      executeQuery(
        "INSERT INTO vehicle_parts (vehicle_id, part_id, available) VALUES (?, ?, ?)",
        [addedVehicleId, id, available]
      )
    );

    await Promise.all(addPartsPromises);

    res.status(201).send("Vehicle added successfully.");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

initDbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
