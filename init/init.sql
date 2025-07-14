CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    sender_id VARCHAR(20),
    message_id VARCHAR(50),
    status VARCHAR(50),
    cost VARCHAR(20),
    status_code INT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
