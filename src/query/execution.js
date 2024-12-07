const connection = require("./db");

const executeQuery = async (query, params) => {
  let conn;

  try {
    conn = await connection.promise().getConnection();
    console.log("Database connection established");

    const [result] = await conn.execute(query, params);
    console.log(
      "Query executed successfully:",
      query,
      "with parameters:",
      params
    );

    return result;
  } catch (error) {
    console.log("Database query error: " + error.message);
    throw new Error(error.message);
  } finally {
    if (conn) {
      conn.release(); 
      console.log("Connection released");
    }
  }
};

module.exports = executeQuery;
