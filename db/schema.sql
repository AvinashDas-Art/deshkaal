-- देशकाल: पाठकों का डेटाबेस (Cloudflare D1)
CREATE TABLE IF NOT EXISTS users   (email TEXT PRIMARY KEY, name TEXT, saved TEXT DEFAULT '[]', favs TEXT DEFAULT '[]', created INTEGER);
CREATE TABLE IF NOT EXISTS tokens  (token TEXT PRIMARY KEY, email TEXT, name TEXT, exp INTEGER);
CREATE TABLE IF NOT EXISTS sessions(sid TEXT PRIMARY KEY, email TEXT, exp INTEGER);
CREATE TABLE IF NOT EXISTS subscribers(email TEXT PRIMARY KEY, created INTEGER, source TEXT);
