const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const app = express();

// Constants
const PORT = 3333;
const SALT_ROUNDS = 10;
const connectionConfig = {
  host: "host.docker.internal",
  user: "root",
  password: "root",
  database: "db",
};

// Middleware
app.set("view engine", "ejs");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let connection;

// Initialize Database Connection
const initDbConnection = async () => {
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log("Database connected successfully.");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

// Execute Database Query
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

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username=?`;

  try {
    const results = await executeQuery(query, [username]);
    if (results.length > 0) {
      const valid = await bcrypt.compare(password, results[0].password);
      if (valid) {
        return res.json(results);
      }
    }
    res.status(401).send("Invalid credentials");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Register Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const query = `INSERT INTO users (username, password) VALUES (?,?)`;
    const results = await executeQuery(query, [username, hash]);
    res.status(201).json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get Years Route
app.get("/years", async (req, res) => {
  const query = "SELECT DISTINCT year FROM vehicles ORDER BY year";

  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get Part Categories Route
app.get("/part-categories", async (req, res) => {
  const query = "SELECT DISTINCT id, name FROM parts_category ORDER BY name";

  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get Parts Route
app.get("/parts", async (req, res) => {
  const query =
    "SELECT DISTINCT id, name, category_id FROM parts ORDER BY name";

  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get Makes Route
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

// Get Models Route
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

// Get Trims Route
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

// Get Inventory Route
app.get("/inventory", async (req, res) => {
  const query = `
    SELECT added_vehicles.id, year, make, model, trim 
    FROM added_vehicles 
    JOIN vehicles ON added_vehicles.vehicle_id=vehicles.id 
    ORDER BY added_vehicles.id`;

  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get Inventory Stats Route
app.get("/inventory/stats", async (req, res) => {
  try {
    const vehicleCountResult = await executeQuery(
      "SELECT COUNT(*) AS count FROM added_vehicles"
    );
    const partCountResult = await executeQuery(
      "SELECT COUNT(*) AS count FROM vehicle_parts WHERE available=TRUE"
    );
    const recentVehicles = await executeQuery(`
      SELECT * 
      FROM added_vehicles 
      JOIN vehicles ON added_vehicles.vehicle_id=vehicles.id 
      ORDER BY added_vehicles.id DESC 
      LIMIT 3
    `);

    const { count: vehicle_count } = vehicleCountResult[0];
    const { count: part_count } = partCountResult[0];

    res.json({
      vehicle_count,
      part_count,
      recent_vehicles: recentVehicles,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add Vehicle Route
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
  const addPartsQuery =
    "INSERT INTO vehicle_parts (vehicle_id, part_id, available) VALUES (?, ?, ?)";

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

    const addPartsPromises = parts.map(({ id, available }) =>
      executeQuery(addPartsQuery, [addedVehicleId, id, available])
    );

    await Promise.all(addPartsPromises);

    res.status(201).send("Vehicle added successfully.");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Root Route
app.get("/", (req, res) => {
  res.render("index");
});

// Start the Server
initDbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
