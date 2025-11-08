CREATE TYPE user_role AS ENUM ('guru', 'murid');

CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  room_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  code VARCHAR(10) UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
  enrollment_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, room_id)
);

CREATE TABLE hijaiyah (
  hijaiyah_id SERIAL PRIMARY KEY,
  latin_name VARCHAR(50) NOT NULL,
  arabic_char VARCHAR(4) NOT NULL,
  ordinal INT NOT NULL
);

CREATE TABLE jilid (
  jilid_id SERIAL PRIMARY KEY,
  jilid_name VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE jilid_letters (
  id SERIAL PRIMARY KEY,
  jilid_id INT NOT NULL REFERENCES jilid(jilid_id) ON DELETE CASCADE,
  hijaiyah_id INT NOT NULL REFERENCES hijaiyah(hijaiyah_id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 1,
  UNIQUE (jilid_id, hijaiyah_id)
);

CREATE TABLE user_practice_progress (
  practice_id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  hijaiyah_id INT NOT NULL REFERENCES hijaiyah(hijaiyah_id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'belajar',
  attempts INT NOT NULL DEFAULT 0,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, hijaiyah_id)
);

CREATE TABLE user_letter_progress (
  progress_id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  hijaiyah_id INT NOT NULL REFERENCES hijaiyah(hijaiyah_id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'belajar',
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, room_id, hijaiyah_id)
);

CREATE TABLE letter_tests (
  test_id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  hijaiyah_id INT NOT NULL REFERENCES hijaiyah(hijaiyah_id) ON DELETE CASCADE,
  jilid_id INT REFERENCES jilid(jilid_id) ON DELETE SET NULL,
  score INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'belum_lulus',
  tested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_jilid_progress (
  user_jilid_id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  jilid_id INT NOT NULL REFERENCES jilid(jilid_id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'belajar',
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, room_id, jilid_id)
);
