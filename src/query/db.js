const mysql = require("mysql2");

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "#Operamini123#",
  database: "IRCTC", 
  multipleStatements: true, 
});

const initializedatabase = () => {
  const queries = `CREATE DATABASE IF NOT EXISTS IRCTC;
    USE IRCTC;

    CREATE TABLE IF NOT EXISTS users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        FirstName VARCHAR(255) NOT NULL,
        LastName VARCHAR(255) NOT NULL,
        UserName VARCHAR(255) UNIQUE NOT NULL,
        Password VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins(
        id INT AUTO_INCREMENT PRIMARY KEY,
        FirstName VARCHAR(255) NOT NULL,
        LastName VARCHAR(255) NOT NULL,
        UserName VARCHAR(255) UNIQUE NOT NULL,
        Password VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trains(
        id INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Source VARCHAR(255) NOT NULL,
        Destination VARCHAR(255) NOT NULL,
        Seats_Available INT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings(
        UserId INT NOT NULL,
        TrainId INT NOT NULL,
        Seats_Booked INT NOT NULL,
        Booking_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (TrainId) REFERENCES trains(id) ON DELETE CASCADE
    );
    `;

  connection.query(queries, (err) => {
    if (err) {
      console.log("Error in execution, check SQL connections: " + err.message);
    } else {
      console.log("Executed successfully");
    }
  });
};


connection.getConnection(function (err, conn) {
  if (err) {
    console.log("Error in connecting to the MYSQL database: " + err.message);
  } else {
    console.log("Connected to MySQL database successfully");
    initializedatabase();
    conn.release();
  }
});

module.exports = connection;
