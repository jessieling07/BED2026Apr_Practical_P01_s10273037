const express = require('express');
const sql = require('mssql');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbConfig = {
    user: 'booksapi_user',
    password: '12345J',
    server: 'JESSIE\\SQLEXPRESS',
    database: 'bed_db',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function startServer() {
    try {
        await sql.connect(dbConfig);
        console.log('Connected to SQL Server successfully.');
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to connect:', err.message);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    await sql.close();
    console.log('Database connection closed.');
    process.exit(0);
});

// GET all students
app.get('/students', async (req, res) => {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request().query('SELECT * FROM Students');
        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// GET one student by ID
app.get('/students/:id', async (req, res) => {
    const studentId = parseInt(req.params.id);
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('student_id', sql.Int, studentId)
            .query('SELECT * FROM Students WHERE student_id = @student_id');
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: `Student with ID ${studentId} not found.` });
        }
        res.status(200).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// POST - create new student
app.post('/students', async (req, res) => {
    const { name, address } = req.body;
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const insertResult = await connection.request()
            .input('name', sql.VarChar(100), name)
            .input('address', sql.VarChar(255), address || null)
            .query(`
                INSERT INTO Students (name, address)
                OUTPUT INSERTED.student_id
                VALUES (@name, @address)
            `);
        const newId = insertResult.recordset[0].student_id;
        const newStudent = await connection.request()
            .input('student_id', sql.Int, newId)
            .query('SELECT * FROM Students WHERE student_id = @student_id');
        res.status(201).json(newStudent.recordset[0]);
    } catch (err) {
        if (err.number === 515) {
            return res.status(400).json({ error: 'Bad Request', details: 'name is required.' });
        }
        res.status(500).json({ error: 'Database error', details: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// PUT - update student
app.put('/students/:id', async (req, res) => {
    const studentId = parseInt(req.params.id);
    const { name, address } = req.body;
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const check = await connection.request()
            .input('student_id', sql.Int, studentId)
            .query('SELECT * FROM Students WHERE student_id = @student_id');
        if (check.recordset.length === 0) {
            return res.status(404).json({ error: `Student with ID ${studentId} not found.` });
        }
        await connection.request()
            .input('student_id', sql.Int, studentId)
            .input('name', sql.VarChar(100), name)
            .input('address', sql.VarChar(255), address || null)
            .query('UPDATE Students SET name = @name, address = @address WHERE student_id = @student_id');
        const updated = await connection.request()
            .input('student_id', sql.Int, studentId)
            .query('SELECT * FROM Students WHERE student_id = @student_id');
        res.status(200).json(updated.recordset[0]);
    } catch (err) {
        if (err.number === 515) {
            return res.status(400).json({ error: 'Bad Request', details: 'name is required.' });
        }
        res.status(500).json({ error: 'Database error', details: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// DELETE - delete student
app.delete('/students/:id', async (req, res) => {
    const studentId = parseInt(req.params.id);
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const check = await connection.request()
            .input('student_id', sql.Int, studentId)
            .query('SELECT * FROM Students WHERE student_id = @student_id');
        if (check.recordset.length === 0) {
            return res.status(404).json({ error: `Student with ID ${studentId} not found.` });
        }
        await connection.request()
            .input('student_id', sql.Int, studentId)
            .query('DELETE FROM Students WHERE student_id = @student_id');
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

startServer();