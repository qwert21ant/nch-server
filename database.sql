create TABLE task(
    id SERIAL PRIMARY KEY,
    answers VARCHAR(1024)
);

create TABLE users(
    id SERIAL PRIMARY KEY,
    ip VARCHAR(255),
    key VARCHAR(255),
    fingerprint VARCHAR(256),
    role VARCHAR(255),
    name VARCHAR(255)
);