const bcrypt = require("bcryptjs");
const {
  initializeDatabase,
  getDatabase,
  saveDatabase
} = require("./database");

// DEMO ACCOUNT — change these fictional details if you wish
const name = "EcoSlate Teacher";
const email = "teacher@example.com";
const password = "TeacherDemo123!";

async function createTeacher() {
  try {
    await initializeDatabase();

    const db = getDatabase();

    const check = db.prepare(
      "SELECT id FROM users WHERE email = ?"
    );

    check.bind([email]);
    const exists = check.step();
    check.free();

    if (exists) {
      console.log("This teacher account already exists!");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [name, email, passwordHash, "teacher"]
    );

    saveDatabase();

    console.log("Teacher account created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role: teacher");

  } catch (error) {
    console.error("Error:", error.message);
  }
}

createTeacher();