const mysql = require('mysql2');

// Настройка подключения к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Замените на ваше имя пользователя
    password: 'root@localhost', // Замените на ваш пароль
    database: 'SimFoodie<3_database' // Замените на ваше название базы данных
});

// Подключение к базе данных
db.connect(err => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('MySQL подключен...');
});

// Функция для получения информации о заведении
const getEstablishmentById = (id, callback) => {
    const query = 'SELECT * FROM establishments WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
    });
};

// Функция для получения отзывов о заведении
const getReviewsByEstablishmentId = (establishmentId, callback) => {
    const query = 'SELECT * FROM reviews WHERE establishment_id = ?';
    db.query(query, [establishmentId], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

const axios = require('axios');
const cheerio = require('cheerio');

const FORM_URL = 'https://formoid.net/?call=forms_entries&param=54177'; // Замените на URL вашей формы

// Функция для получения отзывов с Formoid
const scrapeReviews = async () => {
    try {
        const { data } = await axios.get(FORM_URL);
        const $ = cheerio.load(data);
        
        const reviews = [];

        // Предположим, что отзывы находятся в элементах с классом 'review'
        $('.review').each((index, element) => {
            const reviewText = $(element).find('.review-text').text();
            const reviewDate = $(element).find('.review-date').text();
            reviews.push({ text: reviewText, date: reviewDate });
        });

        return reviews;
    } catch (error) {
        console.error('Ошибка при скрейпинге отзывов:', error);
        throw error;
    }
};

module.exports = {
    scrapeReviews,
    // Другие функции
};

// Функция для добавления отзыва
const addReview = (establishmentId, reviewText, callback) => {
    const query = 'INSERT INTO reviews (establishment_id, review_text) VALUES (?, ?)';
    db.query(query, [establishmentId, reviewText], (err) => {
        if (err) return callback(err);
        callback(null);
    });
};


// Экспорт функций
module.exports = {
    getEstablishmentById,
    getReviewsByEstablishmentId,
    addReview
};

