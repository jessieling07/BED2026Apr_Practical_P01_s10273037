USE bed_db;

CREATE TABLE Books (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title VARCHAR(50) NOT NULL UNIQUE, -- Title is required and unique (cannot be NULL)
  author VARCHAR(50) NOT NULL -- Author is required (cannot be NULL)
);

-- Insert data into Books table
INSERT INTO Books (title, author)
VALUES
  ('The Lord of the Rings', 'J.R.R. Tolkien'),
  ('Pride and Prejudice', 'Jane Austen');