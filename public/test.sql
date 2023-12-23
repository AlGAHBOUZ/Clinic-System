-- Use the newly created database
USE Clinic_Database;
GO

-- Create a table for patient information
CREATE TABLE Patients (
    PatientID INT IDENTITY(1,1) PRIMARY KEY,
    patient_name VARCHAR(255),
    age INT,
    branch VARCHAR(50),
    diagnosis VARCHAR(50),
    gender VARCHAR(10),
    general_notes TEXT,
);

CREATE TABLE Patient_Numbers(

    PatientID INT IDENTITY(1,1) PRIMARY KEY,
    PhoneNumber NVARCHAR(50)
)


-- Create a table for employees
CREATE TABLE Employees (
    EmployeeID INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255),
    age INT,
    salary_type VARCHAR(50),
    salary_amount DECIMAL(10, 2),
    total_salary DECIMAL(10, 2),
    notes TEXT
);

CREATE TABLE Employee_Numbers(

    EmployeeID INT IDENTITY(1,1) PRIMARY KEY,
    PhoneNumber NVARCHAR(50)
)

-- Create a junction table for the many-to-many relationship between Employees and Patients


-- Create a table for sessions
CREATE TABLE Sessions (
    SessionID INT IDENTITY(1,1) PRIMARY KEY, 
    Type NVARCHAR(100) NOT NULL,
    Price INT NOT NULL
);

-- Create a table to track sessions for patients
CREATE TABLE Patient_Sessions (
    PatientSessionID INT IDENTITY(1,1) PRIMARY KEY,
    PatientID INT,
    SessionID INT,
    NurseID INT,
    Quantity INT,
    Notes TEXT,
    SessionDate DATE,
    PaidThisSession DECIMAL(10, 2),
    PaidOverall DECIMAL(10, 2),
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID),
    FOREIGN KEY (SessionID) REFERENCES Sessions(SessionID),
    FOREIGN KEY (NurseID) REFERENCES Employees(EmployeeID)
);

