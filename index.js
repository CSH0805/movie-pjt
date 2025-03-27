const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');  // Add this line

const app = express();
const PORT = 3000;

// Use cors to allow cross-origin requests
app.use(cors());

// SQLite3 데이터베이스 연결
const db = new sqlite3.Database(path.join(__dirname, 'movies.db'));

// 정적 파일 제공 (index.html, script.js, styles.css)
app.use(express.static(__dirname));

// 영화 리스트 API
app.get('/movies', (req, res) => {
    const query = `SELECT id, original_title, poster_path, vote_average FROM movies`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
