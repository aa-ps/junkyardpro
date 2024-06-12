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

// Helper function to send error response
const sendErrorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({ error: message });
};

// Routes

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username=?";

  try {
    const results = await executeQuery(query, [username]);
    if (results.length > 0) {
      const isValid = await bcrypt.compare(password, results[0].password);
      if (isValid) {
        return res.json(results[0]);
      }
    }
    sendErrorResponse(res, 401, "Invalid credentials");
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

// Register Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    await executeQuery(query, [username, hashedPassword]);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

// Get Years Route
app.get("/years", async (_, res) => {
  const query = "SELECT DISTINCT year FROM vehicles ORDER BY year";

  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

// Get Part Categories Route
app.get("/part-categories", async (_, res) => {
  const query = "SELECT DISTINCT id, name FROM parts_category ORDER BY name";

  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

// Get Parts Route
app.get("/parts", async (_, res) => {
  const query =
    "SELECT DISTINCT id, name, category_id FROM parts ORDER BY name";

  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

// Get Makes Route
app.get("/makes", async (req, res) => {
  const { year } = req.query;
  if (!year) return sendErrorResponse(res, 400, "Year is required");

  const query =
    "SELECT DISTINCT make FROM vehicles WHERE year = ? ORDER BY make";

  try {
    const results = await executeQuery(query, [year]);
    res.json(results);
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

// Get Models Route
app.get("/models", async (req, res) => {
  const { year, make } = req.query;
  if (!year || !make)
    return sendErrorResponse(res, 400, "Year and Make are required");

  const query =
    "SELECT DISTINCT model FROM vehicles WHERE year = ? AND make = ? ORDER BY model";

  try {
    const results = await executeQuery(query, [year, make]);
    res.json(results);
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

// Get Trims Route
app.get("/trims", async (req, res) => {
  const { year, make, model } = req.query;

  if (!year || !make || !model) {
    return sendErrorResponse(res, 400, "Year, Make, and Model are required");
  }

  const query =
    "SELECT DISTINCT trim FROM vehicles WHERE year = ? AND make = ? AND model = ?";

  try {
    const results = await executeQuery(query, [year, make, model]);
    res.json(results);
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

// Get Inventory Route
app.get("/inventory", async (_, res) => {
  const query = `
    SELECT added_vehicles.id, year, make, model, trim 
    FROM added_vehicles 
    JOIN vehicles ON added_vehicles.vehicle_id = vehicles.id 
    ORDER BY added_vehicles.id`;

  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

// Get Inventory Stats Route
app.get("/inventory/stats", async (_, res) => {
  try {
    const vehicleCountQuery = "SELECT COUNT(*) AS count FROM added_vehicles";
    const partCountQuery =
      "SELECT COUNT(*) AS count FROM vehicle_parts WHERE available = TRUE";
    const recentVehiclesQuery = `
      SELECT * 
      FROM added_vehicles 
      JOIN vehicles ON added_vehicles.vehicle_id = vehicles.id 
      ORDER BY added_vehicles.id DESC 
      LIMIT 3`;

    const [vehicleCountResult, partCountResult, recentVehicles] =
      await Promise.all([
        executeQuery(vehicleCountQuery),
        executeQuery(partCountQuery),
        executeQuery(recentVehiclesQuery),
      ]);

    res.json({
      vehicle_count: vehicleCountResult[0].count,
      part_count: partCountResult[0].count,
      recent_vehicles: recentVehicles,
    });
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
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
    return sendErrorResponse(
      res,
      400,
      "All vehicle information and a non-empty parts array are required."
    );
  }

  try {
    const vehicleQuery =
      "SELECT DISTINCT id FROM vehicles WHERE year = ? AND make = ? AND model = ? AND trim = ?";
    const addVehicleQuery =
      "INSERT INTO added_vehicles (vehicle_id) VALUES (?)";
    const addPartsQuery =
      "INSERT INTO vehicle_parts (vehicle_id, part_id, available) VALUES (?, ?, ?)";

    const vehicleResults = await executeQuery(vehicleQuery, [
      year,
      make,
      model,
      trim,
    ]);

    if (vehicleResults.length === 0) {
      return sendErrorResponse(res, 404, "Vehicle not found.");
    }

    const { id: vehicle_id } = vehicleResults[0];
    await executeQuery(addVehicleQuery, [vehicle_id]);

    const [{ id: addedVehicleId }] = await executeQuery(
      "SELECT LAST_INSERT_ID() AS id"
    );

    const addPartsPromises = parts.map(({ id, available }) =>
      executeQuery(addPartsQuery, [addedVehicleId, id, available])
    );
    await Promise.all(addPartsPromises);

    res.status(201).send("Vehicle added successfully.");
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

// View Vehicle Route
app.get("/view-vehicle/:id", async (req, res) => {
  const { id } = req.params;
  if (!id.match(/^\d+$/)) {
    return sendErrorResponse(res, 400, "Invalid vehicle ID format");
  }

  try {
    const findQuery = "SELECT * FROM added_vehicles WHERE id = ?";
    const getVehicleQuery = "SELECT * FROM vehicles WHERE id = ?";
    const getPartsQuery = `
      SELECT *
      FROM vehicle_parts 
      JOIN parts ON vehicle_parts.part_id = parts.id 
      WHERE vehicle_parts.vehicle_id = ?`;

    const [addedVehicle] = await executeQuery(findQuery, [id]);
    if (!addedVehicle) {
      return sendErrorResponse(res, 404, "Vehicle not found");
    }

    const { vehicle_id } = addedVehicle;
    const [vehicleData] = await executeQuery(getVehicleQuery, [vehicle_id]);
    const partsData = await executeQuery(getPartsQuery, [id]);

    if (!vehicleData) {
      return sendErrorResponse(res, 404, "Vehicle details not found");
    }

    res.json({ vehicle: vehicleData, parts: partsData });
  } catch (err) {
    sendErrorResponse(res, 500, err.message);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Resource not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

const startServer = async () => {
  await initDbConnection();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
