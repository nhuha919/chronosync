CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  content TEXT NOT NULL,
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE intents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  description TEXT
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(200),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  google_event_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE message_intent (
  message_id INT REFERENCES messages(id),
  intent_id INT REFERENCES intents(id),
  PRIMARY KEY (message_id, intent_id)
);
