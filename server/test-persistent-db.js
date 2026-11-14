
const {
  initializeDatabase,
  getDatabase,
  saveDatabase
} = require("./database");

async function test() {
  // Initialize the database
  await initializeDatabase();

  // Get database connection
  const db = getDatabase();

  // Insert student only if email does not already exist
  db.run(
    `INSERT OR IGNORE INTO students (name, email, password)
     VALUES (?, ?, ?)`,
    ["Test Student", "student@example.com", "test-password"]
  );

  // Save database to file
  saveDatabase();

  // Retrieve student records
  const result = db.exec(
    "SELECT id, name, email FROM students"
  );

  console.log("Persistent database is working!");

  if (result.length > 0) {
    console.log("Student records:");
    console.log(result[0].values);
  } else {
    console.log("No students found.");
  }

  // Close database
  db.close();
}

test().catch((error) => {
  console.error("Database test failed:", error);
});
