require('dotenv').config()
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const TABLE_QUERIES = {
  createUsersTable: `
    CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    );
  `,
  createVehiclesTable: `
    CREATE TABLE IF NOT EXISTS vehicles (
        id INT NOT NULL AUTO_INCREMENT,
        year INT NOT NULL,
        make VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        trim VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
    );
  `,
  createPartsCategoryTable: `
    CREATE TABLE IF NOT EXISTS parts_category (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
    );
  `,
  createPartsTable: `
    CREATE TABLE IF NOT EXISTS parts (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (category_id) REFERENCES parts_category(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `,
  createAddedVehiclesTable: `
    CREATE TABLE IF NOT EXISTS added_vehicles (
      id INT NOT NULL AUTO_INCREMENT,
      vehicle_id INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `,
  createVehiclePartsTable: `
    CREATE TABLE IF NOT EXISTS vehicle_parts (
        id INT NOT NULL AUTO_INCREMENT,
        vehicle_id INT NOT NULL,
        part_id INT NOT NULL,
        available BOOLEAN NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (vehicle_id) REFERENCES added_vehicles(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE (vehicle_id, part_id)
    );
  `,
  createInventoryTable: `
    CREATE TABLE IF NOT EXISTS inventory (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        vehicle_id INT NOT NULL,
        vehicle_part_id INT NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES added_vehicles(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (vehicle_part_id) REFERENCES vehicle_parts(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `,
};

(async function main() {
  let connection;
  try {
    connection = mysql.createPool({
      host: process.env.DB_HOST || "host.docker.internal",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "db",
      waitForConnections: true,
      connectionLimit: 100,
      queueLimit: 0,
    });

    for (const query of Object.values(TABLE_QUERIES)) {
      await connection.execute(query);
    }

    await generateData(connection);
  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
})();

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });
}

async function generateData(connection) {
  const vehiclesFilePath = path.join(__dirname, "data/vehicles.csv");
  const partsFilePath = path.join(__dirname, "data/concise_parts.csv"); // use parts.csv or concise_parts.csv

  try {
    const vehicleRows = await readCSV(vehiclesFilePath);
    const partsAndCategories = await readCSV(partsFilePath);

    if (vehicleRows.length > 0) {
      console.log("Inserting vehicle data...");
      const vehicleValues = vehicleRows.map((row) => [
        row.year,
        row.make,
        row.model,
        row.trim || "N/A",
      ]);
      await connection.query(
        "INSERT INTO vehicles (year, make, model, trim) VALUES ?",
        [vehicleValues]
      );
      console.log("Vehicle data inserted.");
    }

    const categoryValues = Object.keys(partsAndCategories[0]).map((name) => [
      name,
    ]);
    if (categoryValues.length > 0) {
      console.log("Inserting part categories...");
      await connection.query("INSERT INTO parts_category (name) VALUES ?", [
        categoryValues,
      ]);
      console.log("Part categories inserted.");

      const [categoryRows] = await connection.query(
        "SELECT id, name FROM parts_category"
      );
      const categoryMap = new Map();
      categoryRows.forEach((row) => categoryMap.set(row.name, row.id));

      console.log("Inserting parts data...");
      const partValues = partsAndCategories.flatMap((row) =>
        Object.entries(row)
          .filter(([, partName]) => partName.trim() !== "")
          .map(([category, partName]) => [partName, categoryMap.get(category)])
      );

      if (partValues.length > 0) {
        await connection.query(
          "INSERT INTO parts (name, category_id) VALUES ?",
          [partValues]
        );
        console.log("Parts data inserted.");
      }
    }
  } catch (err) {
    console.error("Error in generateData:", err);
    throw err;
  }
  console.log("Data generation completed.");
}
