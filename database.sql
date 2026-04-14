CREATE DATABASE feedback_db;
USE feedback_db;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  rating INT,
  comments TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rating ON feedback(rating);
CREATE INDEX idx_date ON feedback(submitted_at);

INSERT INTO admins (username, password)
VALUES ('admin', '$2b$10$nNsj4f.wISVy7dxC04sU1uxRhmEYgXgVqcZcR459K5s/gfuVtUQE6');