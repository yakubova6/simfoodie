const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Используем CORS и JSON парсер
app.use(cors());
app.use(express.json());

// Обслуживание статических файлов из папок
app.use('/simfoodie.ru/static', express.static(path.join(__dirname, 'simfoodie.ru', 'static')));
app.use('/simfoodie.ru', express.static(path.join(__dirname, 'simfoodie.ru')));
app.use('/search', express.static(path.join(__dirname, 'search')));
app.use('/template', express.static(path.join(__dirname, 'template')));

// Создаем подключение к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'RegIs59_', 
    database: 'simfoodie' 
});

// Подключение к базе данных
db.connect(err => {
    if (err) {
        console.error('Ошибка подключения: ' + err.stack);
        return;
    }
    console.log('Подключено к базе данных.');
});

process.on('SIGINT', () => {
    db.end(err => {
        if (err) {
            console.error('Ошибка завершения подключения к базе данных:', err);
        } else {
            console.log('Подключение к базе данных закрыто.');
        }
        process.exit();
    });
});

// Обработчик для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'simfoodie.ru', 'index.html')); // Отправляем index.html
});

// Обработчик для страницы поиска
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'search', 'search.html')); // Отправляем search.html
});

// Обработчик для страницы ресторана с передачей ID
app.get('/search/restaurant.html', (req, res) => {
    const restaurantId = req.query.id; // Получаем ID ресторана из параметров запроса
    if (!restaurantId) {
        return res.status(400).json({ error: 'Не указан идентификатор ресторана' });
    }
    res.sendFile(path.join(__dirname, 'template', 'restaurant.html')); // Отправляем restaurant.html
});

// Эндпоинт для получения данных о ресторане по ID
app.get('/api/restaurant', async (req, res) => {
    const restaurantId = parseInt(req.query.id, 10);
    if (isNaN(restaurantId)) {
        return res.status(400).json({ error: 'Неверный идентификатор ресторана' });
    }

    try {
        const [results] = await db.promise().query(
            'SELECT id, name, address, image, latitude, longitude, description FROM restaurants WHERE id = ?',
            [restaurantId]
        );

        if (results.length === 0) {
            return res.status(404).json({ error: 'Ресторан не найден' });
        }
        res.json(results[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Эндпоинт для поиска ресторанов
app.get('/api/search', (req, res) => {
    const query = req.query.q;

    const sql = `
    SELECT DISTINCT r.id, r.name, r.address, r.image, r.description
    FROM restaurants r
    JOIN dishes d ON r.id = d.restaurant
    WHERE d.name LIKE ?
    `;

    db.query(sql, [`%${query}%`], (err, results) => {
        if (err) {
            console.error('Ошибка выполнения запроса:', err);
            return res.status(500).json({ error: 'Ошибка выполнения запроса' });
        }
        res.json(results);
    });
});

// Эндпоинт для получения меню ресторана по ID
app.get('/api/menu', (req, res) => {
    const restaurantId = parseInt(req.query.id, 10);
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
            res.json(results); // Возвращаем меню ресторана
        }
    );
});

// Эндпоинт для отправки отзыва
app.post('/api/reviews', (req, res) => {
    const { restaurant_id, user_name, user_email, content } = req.body;

    // Проверка входных данных
    if (!restaurant_id || !user_name || !content) {
        return res.status(400).json({ error: 'Все поля должны быть заполнены' });
    }

    // Сохранение отзыва в БД
    const sql = 'INSERT INTO reviews (restaurant_id, user_name, user_email, content) VALUES (?, ?, ?, ?)';
    db.query(sql, [restaurant_id, user_name, user_email, content], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Отзыв успешно добавлен' });
    });
});

// Обработчик для обработки несуществующих маршрутов
app.use((req, res) => {
    res.status(404).send('404: Not Found');
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
