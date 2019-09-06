USE dinoProject;
CREATE TABLE IF NOT EXISTS highscoreTable (
	sessionID VARCHAR(255) PRIMARY KEY,
	highscore INT(255)
);

CREATE TABLE IF NOT EXISTS logTable (
	sessionID VARCHAR(255) PRIMARY KEY,
	logFile BLOB
);
