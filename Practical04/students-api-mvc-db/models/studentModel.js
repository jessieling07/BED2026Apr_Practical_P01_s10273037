const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all students
async function getAllStudents() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, name, email FROM Students";
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get student by ID
async function getStudentById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, name, email FROM Students WHERE id = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Student not found
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Create new student
async function createStudent(studentData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "INSERT INTO Students (name, email) VALUES (@name, @email); SELECT SCOPE_IDENTITY() AS id;";
    const request = connection.request();
    request.input("name", studentData.name);
    request.input("email", studentData.email);
    const result = await request.query(query);

    const newStudentId = result.recordset[0].id;
    return await getStudentById(newStudentId);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}
// Update student
async function updateStudent(id, studentData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "UPDATE Students SET name = @name, email = @email WHERE id = @id";
    const request = connection.request();
    request.input("id", id);
    request.input("name", studentData.name);
    request.input("email", studentData.email);
    await request.query(query);

    return await getStudentById(id); // Return updated student
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Delete student
async function deleteStudent(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM Students WHERE id = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    return result.rowsAffected[0] > 0; // true if a row was deleted
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent, 
  deleteStudent, 
};