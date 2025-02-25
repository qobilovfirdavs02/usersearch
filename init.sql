CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    birth_date DATE,
    nationality VARCHAR(50),
    citizenship VARCHAR(50),
    address VARCHAR(255),
    passport_id VARCHAR(20) UNIQUE NOT NULL,
    photo VARCHAR(255)
);
