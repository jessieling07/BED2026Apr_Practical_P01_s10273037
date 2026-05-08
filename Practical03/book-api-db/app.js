const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded());

app.listen(port, async () => {
  try {
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
  console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});

// --- GET Routes ---

// GET all books
app.get("/books", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request().query(`SELECT id, title, author FROM Books`);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error in GET /books:", error);
    res.status(500).send("Error retrieving books");
  } finally {
    if (connection) {
      try { await connection.close(); }
      catch (e) { console.error("Error closing connection:", e); }
    }
  }
});

// GET book by ID
app.get("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) return res.status(400).send("Invalid book ID");

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", bookId);
    const result = await request.query(`SELECT id, title, author FROM Books WHERE id = @id`);

    if (!result.recordset[0]) return res.status(404).send("Book not found");
    res.json(result.recordset[0]);
  } catch (error) {
    console.error(`Error in GET /books/${bookId}:`, error);
    res.status(500).send("Error retrieving book");
  } finally {
    if (connection) {
      try { await connection.close(); }
      catch (e) { console.error("Error closing connection:", e); }
    }
  }
});

// --- POST Route ---

// POST create new book
app.post("/books", async (req, res) => {
  const newBookData = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("title", newBookData.title);
    request.input("author", newBookData.author);
    const result = await request.query(
      `INSERT INTO Books (title, author) VALUES (@title, @author); SELECT SCOPE_IDENTITY() AS id;`
    );

    const newBookId = result.recordset[0].id;
    const getRequest = connection.request();
    getRequest.input("id", newBookId);
    const newBookResult = await getRequest.query(`SELECT id, title, author FROM Books WHERE id = @id`);

    res.status(201).json(newBookResult.recordset[0]);
  } catch (error) {
    console.error("Error in POST /books:", error);
    res.status(500).send("Error creating book");
  } finally {
    if (connection) {
      try { await connection.close(); }
      catch (e) { console.error("Error closing connection:", e); }
    }
  }
});

// --- PUT Route ---

// PUT update book by ID
app.put("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) return res.status(400).send("Invalid book ID");

  const updatedData = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Update the book
    const updateRequest = connection.request();
    updateRequest.input("id", bookId);
    updateRequest.input("title", updatedData.title);
    updateRequest.input("author", updatedData.author);
    const updateResult = await updateRequest.query(
      `UPDATE Books SET title = @title, author = @author WHERE id = @id`
    );

    // Check if any row was actually updated
    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).send("Book not found");
    }

    // Fetch and return the updated book
    const getRequest = connection.request();
    getRequest.input("id", bookId);
    const getResult = await getRequest.query(`SELECT id, title, author FROM Books WHERE id = @id`);

    res.status(200).json(getResult.recordset[0]);
  } catch (error) {
    console.error(`Error in PUT /books/${bookId}:`, error);
    res.status(500).send("Error updating book");
  } finally {
    if (connection) {
      try { await connection.close(); }
      catch (e) { console.error("Error closing connection:", e); }
    }
  }
});

// --- DELETE Route ---

// DELETE book by ID
app.delete("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) return res.status(400).send("Invalid book ID");

  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    request.input("id", bookId);
    const result = await request.query(`DELETE FROM Books WHERE id = @id`);

    // Check if any row was actually deleted
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Book not found");
    }

    res.status(204).send(); // 204 No Content - successful deletion
  } catch (error) {
    console.error(`Error in DELETE /books/${bookId}:`, error);
    res.status(500).send("Error deleting book");
  } finally {
    if (connection) {
      try { await connection.close(); }
      catch (e) { console.error("Error closing connection:", e); }
    }
  }
});