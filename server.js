const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Используем CORS
app.use(cors());
app.use(express.json()); // Позволяем обрабатывать JSON в запросах

// Создаем подключение к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Имя пользователя
    password: 'RegIs59_', // Ваш пароль
    database: 'simfoodie' // Имя вашей базы данных
});

// Проверка подключения
db.connect(err => {
    if (err) {
        console.error('Ошибка подключения: ' + err.stack);
        return;
    }
    console.log('Подключено к базе данных.');
});

// Эндпоинт для получения данных о ресторане по ID
app.get('/api/restaurant', (req, res) => {
    const restaurantId = parseInt(req.query.id, 10);
    if (isNaN(restaurantId)) {
        return res.status(400).json({ error: 'Неверный идентификатор ресторана' });
    }

    db.query(
        'SELECT id, name, address, raiting, image, latitude, longitude FROM restaurants WHERE id = ?',
        [restaurantId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Ресторан не найден' });
            }
            res.json(results[0]); // Возвращаем данные о ресторане
        }
    );
});

// Эндпоинт для отправки отзыва
app.post('/api/reviews', (req, res) => {
    const { review } = req.body;

    // Здесь вы можете добавить код для сохранения отзыва в базу данных
    // Например:
    // db.query('INSERT INTO reviews (content) VALUES (?)', [review], (err, results) => { ... });

    res.status(201).json({ message: 'Отзыв успешно сохранен' });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});