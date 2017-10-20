export var mysql = require('mysql');

export var dbcon = null;

export function initDB() {
  dbcon = mysql.createConnection({
    host: process.env.MYSQL_HOST || "mysql",
    port: 3306,
    user: process.env.MYSQL_USER || "uat-tool",
    password: process.env.MYSQL_PASSWORD || "uat-pass",
    database: process.env.MYSQL_DATABASE || "uat"
  });  
}
