const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// CORS 설정
app.use(cors());

// 현재 디렉토리에서 정적 파일을 제공
app.use(express.static(__dirname));
app.use(express.json());

// SQLite3 데이터베이스 연결
const db = new sqlite3.Database(path.join(__dirname, 'movies.db'));

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

// 영화 상세 API (id로 영화 정보 가져오기)
app.get('/movies/:id', (req, res) => {
    const movieId = req.params.id;
    const query = `SELECT * FROM movies WHERE id = ?`;

    db.get(query, [movieId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

// 댓글 작성 API
app.post('/comments', (req, res) => {
    const { movie_id, comment_text } = req.body;

    console.log("댓글 작성 요청 데이터:", { movie_id, comment_text });

    if (!movie_id || !comment_text) {
        return res.status(400).json({ error: "영화 ID와 댓글 내용을 모두 제공해야 합니다." });
    }

    const movieIdInt = parseInt(movie_id, 10);

    if (isNaN(movieIdInt)) {
        console.error("유효하지 않은 영화 ID:", movie_id); // 유효하지 않은 ID에 대한 오류 로깅
        return res.status(400).json({ error: "유효한 영화 ID가 아닙니다." });
    }

    const query = `INSERT INTO comments (movie_id, comment_text) VALUES (?, ?)`;

    db.run(query, [movieIdInt, comment_text], function (err) {
        if (err) {
            console.error("댓글 작성 중 오류 발생:", err.message);
            console.error("쿼리 실행 오류:", query);
            return res.status(500).json({ error: "댓글 작성 실패. 다시 시도해주세요." });
        }

        const newComment = {
            id: this.lastID,
            movie_id: movieIdInt,
            comment_text: comment_text,
            created_at: new Date().toISOString()
        };

        console.log("새로 작성된 댓글:", newComment);
        res.status(201).json(newComment);
    });
});




// 댓글 불러오기 API
app.get('/comments/:movieId', (req, res) => {
    const movieId = req.params.movieId;

    const query = `SELECT * FROM comments WHERE movie_id = ? ORDER BY created_at DESC`;

    db.all(query, [movieId], (err, rows) => {
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
