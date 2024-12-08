const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Используем CORS
app.use(cors());
app.use(express.json()); 

// Создаем подключение к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'RegIs59_', 
    database: 'simfoodie' 
});

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
        'SELECT id, name, address, image, latitude, longitude, description FROM restaurants WHERE id = ?',
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

// Эндпоинт для получения блюд по ID ресторана
app.get('/api/dishes', (req, res) => {
    const restaurantId = parseInt(req.query.restaurantId, 10);
    if (isNaN(restaurantId)) {
        return res.status(400).json({ error: 'Неверный идентификатор ресторана' });
    }

    db.query(
        'SELECT id, name, price FROM dishes WHERE restaurant = ?', 
        [restaurantId], 
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results); // Возвращаем список блюд
        }
    );
});

// Эндпоинт для отправки отзыва
app.post('/api/reviews', (req, res) => {
    const { restaurant_id, user_name, user_email, content } = req.body; // Получаем необходимые данные

    // Проверка на наличие необходимых данных
    if (!restaurant_id || !user_name || !user_email || !content) {
        return res.status(400).json({ error: 'restaurant_id, user_name, user_email и content обязательны' });
    }

    // Запрос для сохранения отзыва в базу данных
    const sql = 'INSERT INTO reviews (restaurant_id, user_name, user_email, content) VALUES (?, ?, ?, ?)';
    db.query(sql, [restaurant_id, user_name, user_email, content], (err, results) => {
        if (err) {
            console.error('Ошибка при сохранении отзыва:', err);
            return res.status(500).json({ message: 'Ошибка при сохранении отзыва' });
        }
        
        return res.status(201).json({ message: 'Отзыв успешно сохранен', reviewId: results.insertId });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});