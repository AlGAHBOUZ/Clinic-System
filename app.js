// app.js
const express = require('express');
const sql = require('mssql');
const { Connection } = require('tedious');
const app = express();
const port = 3000;

const config = {
    server: 'localhost',
    database: 'Clinic_Database',
    user: 'sa',
    password: 'yourStrong(!)Password',
    options: {
        trustedConnection: false,
        enableArithAbort: true,
        encrypt: true,
        trustServerCertificate: true,
    },
};

const connection = new Connection(config);

connection.on('connect', (err) => {
    if (err) {
        console.error('Error connecting to SQL Server:', err.message);
    } else {
        console.log('Connected to SQL Server');
    }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.post('/add-patient', async (req, res) => {
    const { name, phone, age, branch, diagnosis, gender, generalNotes, sessionNotes } = req.body;

    try {
        await sql.connect(config);

        const result = await sql.query`INSERT INTO Patients (patient_name, phone_number, age, branch, diagnosis, gender, general_notes, session_notes)
        VALUES(${name}, ${phone}, ${age}, ${branch}, ${diagnosis}, ${gender}, ${generalNotes}, ${sessionNotes})`;

        res.redirect('/add-patient.html?success=true'); // Redirect to add-patient.html with success=true
    } catch (error) {
        console.error('Error inserting data:', error.message);
        res.send('Error inserting data');
    } finally {
        await sql.close();
    }
});

app.get('/search-patient', async (req, res) => {
    const name = req.query.name;

    try {
        await sql.connect(config);

        const result = await sql.query`EXEC select_patient @name = ${name}`;
        const patients = result.recordset;

        res.json(patients);
    } catch (error) {
        console.error('Error searching for patients:', error.message);
        res.status(500).send('Internal Server Error');
    } finally {
        await sql.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
