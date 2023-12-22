const express = require('express');
const sql = require('mssql');
const { Connection } = require('tedious');
const PDFDocument = require('pdfkit');
const fs = require('fs');
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
app.use(express.json()); // Add this line to parse JSON-encoded bodies
app.use(express.static('public'));

app.post('/add-patient', async (req, res) => {
    const { name, phone, age, branch, diagnosis, gender, generalNotes, sessionNotes, doctorId, date } = req.body;

    try {
        await sql.connect(config);

        const result = await sql.query`
            INSERT INTO Patients (patient_name, PhoneNumber, age, gender, general_notes, session_notes, DoctorID, time_stamp, BranchName, diagnosis)
            VALUES(${name}, ${phone}, ${age}, ${gender}, ${generalNotes}, ${sessionNotes}, ${doctorId}, ${date}, ${branch}, ${diagnosis})
        `;

        res.redirect('/add-patient.html?success=true'); // Redirect to add-patient.html with success=true
    } catch (error) {
        console.error('Error inserting data:', error.message);
        res.send('Error inserting data');
    } finally {
        await sql.close();
    }
});

app.post('/search-patient', async (req, res) => {
    console.log('Request Body:', req.body);

    const { name, phone, ageFrom, ageTo, gender, branch, diagnosis, dateFrom, dateTo } = req.body;

    try {
        await sql.connect(config);

        const result = await sql.query`EXEC filter_patient 
            @name = ${name || null},
            @PhoneNumber = ${phone || null},  
            @age_from = ${ageFrom || null},
            @age_to = ${ageTo || null},
            @gender = ${gender || null},
            @branch = ${branch || null},
            @diagnosis = ${diagnosis || null},
            @date_from = ${dateFrom || null},
            @date_to = ${dateTo || null}`;

        const patients = result.recordset;

        console.log('Patients Returned:', patients);  // Log the patients data

        res.json(patients);
    } catch (error) {
        console.error('Error searching for patients:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await sql.close();
    }
});



app.get('/generate-reports', async (req, res) => {
    try {
        await sql.connect(config);

        const result = await sql.query`EXEC select_all`;
        const patients = result.recordset;

        const doc = new PDFDocument();

        // Customize your PDF content here based on the patient data
        for (const patient of patients) {
            doc.fontSize(16).text(`Patient Name: ${patient.patient_name}`);
            doc.fontSize(16).text(`Phone Number: ${patient.PhoneNumber}`);
            // Add more patient information as needed
            doc.moveDown();
        }

        // End the PDF document
        doc.end();

        // Set the response headers for PDF download
        res.setHeader('Content-disposition', 'attachment; filename=report.pdf');
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF content directly to the response
        doc.pipe(res);

    } catch (error) {
        console.error('Error generating report:', error.message);
        res.status(500).send('Internal Server Error');
    } finally {
        await sql.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
