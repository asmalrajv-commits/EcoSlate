
const initSqlJs = require("sql.js");

async function testDatabase() {
  const SQL = await initSqlJs();

  const db = new SQL.Database();

  db.run(`
    CREATE TABLE students (
      id INTEGER PRIMARY KEY,
      name TEXT
    );
  `);

  db.run(
    "INSERT INTO students (name) VALUES (?)",
    ["EcoSlate Student"]
  );

  const result = db.exec("SELECT * FROM students");

  console.log("SQLite is working!");
  console.log(result[0].values);

  db.close();
}

testDatabase();
