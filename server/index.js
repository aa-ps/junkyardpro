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
    console.error("Database query error:", err);
    throw new Error("Database query error");
  }
};

// Helper function to send response
const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json(data);
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
        return sendResponse(res, 200, { user: results[0] });
      }
    }
    sendResponse(res, 401, { error: "Invalid credentials" });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Register Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    await executeQuery(query, [username, hashedPassword]);
    sendResponse(res, 201, { message: "User registered successfully" });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Get Years Route
app.get("/years", async (_, res) => {
  const query = "SELECT DISTINCT year FROM vehicles ORDER BY year";

  try {
    const results = await executeQuery(query);
    sendResponse(res, 200, { years: results });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Get Part Categories Route
app.get("/part-categories", async (_, res) => {
  const query = "SELECT DISTINCT id, name FROM parts_category ORDER BY name";

  try {
    const results = await executeQuery(query);
    sendResponse(res, 200, { partCategories: results });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Get Parts Route
app.get("/parts", async (_, res) => {
  const query =
    "SELECT DISTINCT id, name, category_id FROM parts ORDER BY name";

  try {
    const results = await executeQuery(query);
    sendResponse(res, 200, { parts: results });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Get Makes Route
app.get("/makes", async (req, res) => {
  const { year } = req.query;
  if (!year) return sendResponse(res, 400, { error: "Year is required" });

  const query =
    "SELECT DISTINCT make FROM vehicles WHERE year = ? ORDER BY make";

  try {
    const results = await executeQuery(query, [year]);
    sendResponse(res, 200, { makes: results });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Get Models Route
app.get("/models", async (req, res) => {
  const { year, make } = req.query;
  if (!year || !make)
    return sendResponse(res, 400, { error: "Year and Make are required" });

  const query =
    "SELECT DISTINCT model FROM vehicles WHERE year = ? AND make = ? ORDER BY model";

  try {
    const results = await executeQuery(query, [year, make]);
    sendResponse(res, 200, { models: results });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Get Trims Route
app.get("/trims", async (req, res) => {
  const { year, make, model } = req.query;
  if (!year || !make || !model)
    return sendResponse(res, 400, {
      error: "Year, Make, and Model are required",
    });

  const query =
    "SELECT DISTINCT trim FROM vehicles WHERE year = ? AND make = ? AND model = ? ORDER BY trim";

  try {
    const results = await executeQuery(query, [year, make, model]);
    sendResponse(res, 200, { trims: results });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Get Inventory Route
app.get("/inventory", async (_, res) => {
  const query = `SELECT added_vehicles.id, year, make, model, trim 
    FROM added_vehicles 
    JOIN vehicles ON added_vehicles.vehicle_id = vehicles.id 
    ORDER BY added_vehicles.id`;

  try {
    const results = await executeQuery(query);
    sendResponse(res, 200, { inventory: results });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Get Inventory Stats Route
app.get("/inventory/stats", async (_, res) => {
  try {
    const vehicleCountQuery = "SELECT COUNT(*) AS count FROM added_vehicles";
    const partCountQuery =
      "SELECT COUNT(*) AS count FROM vehicle_parts WHERE available = TRUE";
    const recentVehiclesQuery = `SELECT added_vehicles.*, vehicles.*
      FROM added_vehicles 
      JOIN vehicles ON added_vehicles.vehicle_id = vehicles.id 
      ORDER BY added_vehicles.id DESC 
      LIMIT 3`;

    const [vehicleCount, partCount, recentVehicles] = await Promise.all([
      executeQuery(vehicleCountQuery),
      executeQuery(partCountQuery),
      executeQuery(recentVehiclesQuery),
    ]);

    sendResponse(res, 200, {
      vehicle_count: vehicleCount[0].count,
      part_count: partCount[0].count,
      recent_vehicles: recentVehicles,
    });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Add Vehicle Route
app.post("/vehicle", async (req, res) => {
  const { year, make, model, trim, parts } = req.body;
  if (
    !year ||
    !make ||
    !model ||
    !trim ||
    !Array.isArray(parts) ||
    !parts.length
  )
    return sendResponse(res, 400, {
      error:
        "All vehicle information and a non-empty parts array are required.",
    });

  try {
    const vehicleQuery =
      "SELECT id FROM vehicles WHERE year = ? AND make = ? AND model = ? AND trim = ?";
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
      return sendResponse(res, 404, { error: "Vehicle not found." });
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

    sendResponse(res, 201, { message: "Vehicle added successfully." });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// View Vehicle Route
app.get("/vehicle/:id", async (req, res) => {
  const { id } = req.params;
  if (!id.match(/^\d+$/))
    return sendResponse(res, 400, { error: "Invalid vehicle ID format" });

  try {
    const findQuery = "SELECT * FROM added_vehicles WHERE id = ?";
    const getVehicleQuery = "SELECT * FROM vehicles WHERE id = ?";
    const getPartsQuery = `SELECT parts.*, vehicle_parts.available
      FROM vehicle_parts 
      JOIN parts ON vehicle_parts.part_id = parts.id 
      WHERE vehicle_parts.vehicle_id = ?`;

    const [addedVehicle] = await executeQuery(findQuery, [id]);
    if (!addedVehicle) {
      return sendResponse(res, 404, { error: "Vehicle not found" });
    }

    const [vehicle] = await executeQuery(getVehicleQuery, [
      addedVehicle.vehicle_id,
    ]);
    const parts = await executeQuery(getPartsQuery, [id]);

    sendResponse(res, 200, { vehicle, parts });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Delete Vehicle Route
app.delete("/vehicle/:id", async (req, res) => {
  const { id } = req.params;
  if (!id.match(/^\d+$/))
    return sendResponse(res, 400, { error: "Invalid vehicle ID format" });

  try {
    const findQuery = "SELECT * FROM added_vehicles WHERE id = ?";
    const deleteVehiclePartsQuery =
      "DELETE FROM vehicle_parts WHERE vehicle_id = ?";
    const deleteAddedVehicleQuery = "DELETE FROM added_vehicles WHERE id = ?";

    const [addedVehicle] = await executeQuery(findQuery, [id]);
    if (!addedVehicle) {
      return sendResponse(res, 404, { error: "Vehicle not found" });
    }

    await executeQuery(deleteVehiclePartsQuery, [id]);
    await executeQuery(deleteAddedVehicleQuery, [id]);

    sendResponse(res, 200, { message: "Vehicle deleted successfully" });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

// Update Vehicle Parts Route
app.put("/vehicle/:id", async (req, res) => {
  const { id } = req.params;
  const { parts } = req.body;

  if (!id.match(/^\d+$/))
    return sendResponse(res, 400, { error: "Invalid vehicle ID format" });

  if (!Array.isArray(parts) || parts.length === 0) {
    return sendResponse(res, 400, {
      error: "Parts array is required and cannot be empty",
    });
  }

  for (const part of parts) {
    if (
      typeof part.id !== "number" ||
      typeof part.name !== "string" ||
      typeof part.category_id !== "number" ||
      (part.available != 0 && part.available != 1)
    ) {
      return sendResponse(res, 400, { error: "Invalid data format for part" });
    }
  }

  try {
    const findVehicleQuery = "SELECT * FROM added_vehicles WHERE id = ?";
    const updatePartQuery =
      "UPDATE vehicle_parts SET available = ? WHERE vehicle_id = ? AND part_id = ?";

    const [addedVehicle] = await executeQuery(findVehicleQuery, [id]);
    if (!addedVehicle) {
      return sendResponse(res, 404, { error: "Vehicle not found" });
    }

    const updatePromises = parts.map(({ id: part_id, available }) =>
      executeQuery(updatePartQuery, [available, id, part_id])
    );

    await Promise.all(updatePromises);

    sendResponse(res, 200, { message: "Vehicle parts updated successfully" });
  } catch (err) {
    sendResponse(res, 500, { error: err.message });
  }
});

(async () => {
  await initDbConnection();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
