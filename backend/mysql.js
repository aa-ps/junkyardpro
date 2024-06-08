const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const createVehiclesTable = `
  CREATE TABLE IF NOT EXISTS vehicles (
      id INT NOT NULL AUTO_INCREMENT,
      year INT NOT NULL,
      make VARCHAR(255) NOT NULL,
      model VARCHAR(255) NOT NULL,
      trim VARCHAR(255) NOT NULL,
      PRIMARY KEY (id)
  );
`;

const createPartsCategoryTable = `
  CREATE TABLE IF NOT EXISTS parts_category (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      PRIMARY KEY (id)
  );
`;

const createPartsTable = `
  CREATE TABLE IF NOT EXISTS parts (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      category_id INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (category_id) REFERENCES parts_category(id)
  );
`;

const createVehiclePartsTable = `
  CREATE TABLE IF NOT EXISTS vehicle_parts (
      id INT NOT NULL AUTO_INCREMENT,
      vehicle_id INT NOT NULL,
      part_id INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (part_id) REFERENCES parts(id),
      UNIQUE (vehicle_id, part_id)
  );
`;

const createInventoryTable = `
  CREATE TABLE IF NOT EXISTS inventory (
      id INT NOT NULL AUTO_INCREMENT,
      vehicle_id INT NOT NULL,
      vehicle_part_id INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (vehicle_part_id) REFERENCES vehicle_parts(id)
  );
`;

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

    await connection.execute(createVehiclesTable);
    await connection.execute(createPartsCategoryTable);
    await connection.execute(createPartsTable);
    await connection.execute(createVehiclePartsTable);
    await connection.execute(createInventoryTable);
    await generateData(connection);
  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
})();

async function generateData(connection) {
  const vehiclesFilePath = path.join(__dirname, "data/vehicles.csv");
  const partsFilePath = path.join(__dirname, "data/parts.csv");

  try {
    const vehicleRows = [];
    let partCategories = [];
    const partRows = [];

    console.log("Reading vehicles CSV...");
    await new Promise((resolve, reject) => {
      fs.createReadStream(vehiclesFilePath)
        .pipe(csv())
        .on("data", (row) => {
          vehicleRows.push(row);
        })
        .on("end", () => {
          console.log("Finished reading vehicles CSV.");
          resolve();
        })
        .on("error", (err) => {
          console.error("Error reading vehicles CSV:", err);
          reject(err);
        });
    });

    console.log("Reading parts CSV...");
    await new Promise((resolve, reject) => {
      fs.createReadStream(partsFilePath)
        .pipe(csv())
        .on("headers", (headers) => {
          partCategories = headers;
        })
        .on("data", (row) => {
          partRows.push(row);
        })
        .on("end", () => {
          console.log("Finished reading parts CSV.");
          resolve();
        })
        .on("error", (err) => {
          console.error("Error reading parts CSV:", err);
          reject(err);
        });
    });

    if (vehicleRows.length > 0) {
      console.log("Inserting vehicle data...");
      const vehicleValues = vehicleRows.map((row) => [
        row.year,
        row.make,
        row.model,
        row.trim ? row.trim : "N/A",
      ]);
      try {
        await connection.query(
          "INSERT INTO vehicles (year, make, model, trim) VALUES ?",
          [vehicleValues]
        );
        console.log("Finished inserting vehicle data.");
      } catch (err) {
        console.error("Error inserting vehicle rows:", err);
        throw err;
      }
    } else {
      console.log("No vehicle data to insert.");
    }

    const categoryMap = new Map();
    if (partCategories.length > 0) {
      console.log("Inserting part categories...");
      const categoryValues = partCategories.map((name) => [name]);
      try {
        await connection.query("INSERT INTO parts_category (name) VALUES ?", [
          categoryValues,
        ]);
        console.log("Finished inserting part categories.");

        // Retrieve the category IDs
        const [rows] = await connection.query(
          "SELECT id, name FROM parts_category"
        );

        rows.forEach((row) => {
          categoryMap.set(row.name, row.id);
        });
      } catch (err) {
        console.error("Error inserting part categories:", err);
        throw err;
      }
    } else {
      console.log("No part categories to insert.");
    }

    if (partRows.length > 0) {
      console.log("Inserting parts data...");
      const partValues = [];

      partRows.forEach((row) => {
        for (const category in row) {
          if (row.hasOwnProperty(category)) {
            const partName = row[category];
            if (partName != "") {
              const categoryId = categoryMap.get(category);
              partValues.push([partName, categoryId]);
            }
          }
        }
      });

      try {
        await connection.query(
          "INSERT INTO parts (name, category_id) VALUES ?",
          [partValues]
        );
        console.log("Finished inserting parts data.");
      } catch (err) {
        console.error("Error inserting parts rows:", err);
        throw err;
      }
    } else {
      console.log("No part data to insert.");
    }
  } catch (err) {
    console.error("Error in generateData:", err);
    throw err;
  }
  console.log("Data generation completed.");
}
