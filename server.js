const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
app.use(bodyParser.json());

// Azure SQL Database connection configuration
const dbConfig = {
    user: 'your-username',
    password: 'your-password',
    server: 'your-server-name.database.windows.net',
    database: 'your-database-name',
    options: {
        encrypt: true // Use encryption
    }
};

// Connect to the database
sql.connect(dbConfig).then(pool => {
    if (pool.connecting) console.log('Connecting to the database...');
    if (pool.connected) console.log('Connected to the database.');

    // Create
    app.post('/data', async (req, res) => {
        try {
            const { name, value } = req.body;
            await pool.request()
                .input('name', sql.NVarChar, name)
                .input('value', sql.NVarChar, value)
                .query('INSERT INTO YourTable (name, value) VALUES (@name, @value)');
            res.send('Data inserted successfully.');
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    // Read
    app.get('/data', async (req, res) => {
        try {
            const result = await pool.request().query('SELECT * FROM YourTable');
            res.json(result.recordset);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    // Update
    app.put('/data/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { name, value } = req.body;
            await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar, name)
                .input('value', sql.NVarChar, value)
                .query('UPDATE YourTable SET name = @name, value = @value WHERE id = @id');
            res.send('Data updated successfully.');
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    // Delete
    app.delete('/data/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM YourTable WHERE id = @id');
            res.send('Data deleted successfully.');
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(err => console.log('Database connection failed:', err.message));
