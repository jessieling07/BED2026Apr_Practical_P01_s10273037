-- Switch to your database
USE bed_db;

-- Create the books table
CREATE TABLE books (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    author NVARCHAR(255) NOT NULL
);

-- Create a dedicated SQL Server login
CREATE LOGIN nodejs_user WITH PASSWORD = 'StrongPassword123!';

-- Create a database user mapped to the login
CREATE USER nodejs_user FOR LOGIN nodejs_user;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON books TO nodejs_user;