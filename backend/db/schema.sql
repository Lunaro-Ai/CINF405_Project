CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  release_year INT,
  platform     VARCHAR(100),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_entries (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id      INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  status       VARCHAR(20) NOT NULL CHECK (status IN ('Want to Play','Playing','Completed','Dropped')),
  date_added   TIMESTAMPTZ DEFAULT NOW(),
  date_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

CREATE TABLE IF NOT EXISTS journal_notes (
  id           SERIAL PRIMARY KEY,
  entry_id     INT NOT NULL REFERENCES game_entries(id) ON DELETE CASCADE,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text         TEXT NOT NULL CHECK (char_length(text) <= 5000),
  date_written TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id           SERIAL PRIMARY KEY,
  entry_id     INT NOT NULL REFERENCES game_entries(id) ON DELETE CASCADE,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating       INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text         TEXT,
  date_written TIMESTAMPTZ DEFAULT NOW(),
  shared       BOOLEAN DEFAULT FALSE,
  UNIQUE(entry_id)
);

CREATE TABLE IF NOT EXISTS challenges (
  id           SERIAL PRIMARY KEY,
  entry_id     INT NOT NULL REFERENCES game_entries(id) ON DELETE CASCADE,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  done         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
