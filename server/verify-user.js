
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

async function verifyUser() {
  const SQL = await initSqlJs();

  const filePath = path.join(__dirname, "ecoslate.db");

  const fileBuffer = fs.readFileSync(filePath);
  const db = new SQL.Database(fileBuffer);

  const result = db.exec(
    "SELECT name, email, password_hash, role FROM users"
  );

  if (result.length === 0) {
    console.log("No registered users found.");
  } else {
    for (const user of result[0].values) {
      const [name, email, hash, role] = user;

      console.log("Name:", name);
      console.log("Email:", email);
      console.log("Role:", role);
      console.log(
        "Password securely hashed:",
        /^\$2[aby]\$/.test(hash)
      );
      console.log("----------------------");
    }
  }

  db.close();
}

verifyUser().catch(console.error);
