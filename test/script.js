document.addEventListener('DOMContentLoaded', function() {
    const restaurantId = getRestaurantIdFromURL(); // Получаем ID ресторана из URL

    if (!restaurantId) {
        console.error('ID ресторана не указан');
        return; // Завершаем выполнение, если ID не найден
    }

    fetch(`http://localhost:3000/api/restaurant?id=${restaurantId}`) // Используем ваш endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error('Сеть не в порядке');
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Для проверки
            
            // Обновляем элементы на странице
            document.getElementById('title').innerText = data.name;
            document.getElementById('description').innerText = data.description || 'Описание заведения отсутствует';
            document.getElementById('address').innerText = `Адрес: ${data.address}`;
            document.getElementById('establishment-image').src = data.image || 'placeholder-establishment.jpg';

            // Проверяем наличие изображения меню
            if (data.menuImage) {
                document.getElementById('menu-image').src = data.menuImage;
            } else {
                document.getElementById('menu-image').src = 'placeholder-menu.jpg';
            }

            // Инициализация карты
            initMap(data.latitude, data.longitude);
        })
        .catch(error => console.error('Ошибка при получении данных:', error));

    // Функция для получения ID ресторана из URL
    function getRestaurantIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Функция инициализации карты для Яндекс.Карт
    function initMap(latitude, longitude) {
        // Создаем карту
        const map = new ymaps.Map('map', {
            center: [latitude || 44.9521, longitude || 34.1028], // Координаты центра карты
            zoom: 10 // Уровень масштабирования
        });

        // Добавляем маркер
        const placemark = new ymaps.Placemark([latitude, longitude], {
            balloonContent: 'Ресторан'
        });

        // Добавляем маркер на карту
        map.geoObjects.add(placemark);
        
        // Установка маркера на карту
        map.setCenter([latitude, longitude], 15); // Установить центр карты и уровень масштабирования
    }

    // Обработчик для отправки отзыва
    document.getElementById('submit-review').addEventListener('click', function() {
        const review = document.getElementById('review-text').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;

        // Проверка, что поля отзыва и имени не пустые
        if (!review || !username || !email) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }

        // Отправка отзыва на сервер
        fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ review, username, email, restaurantId }) // Добавляем restaurantId для связи отзыва с рестораном
        })
        .then(response => {
            if (response.ok) {
                alert('Ваш отзыв отправлен!');
                document.getElementById('review-text').value = ''; // Очистить поле
                document.getElementById('username').value = ''; // Очистить поле имени
                document.getElementById('email').value = ''; // Очистить поле почты
            } else {
                throw new Error('Ошибка при отправке отзыва');
            }
        })
        .catch(error => console.error('Ошибка:', error));
    });
});