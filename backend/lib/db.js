import mysql from "mysql2/promise";

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root_password_123",
    database: "tecnihidros_bd",
    port: 3306
});

export default db;