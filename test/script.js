document.addEventListener('DOMContentLoaded', function() {
    const restaurantId = 2; // Замените на нужный ID ресторана

    fetch(`http://localhost:3000/api/restaurant?id=${restaurantId}`) // Используем созданный endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error('Сеть не в порядке');
            }
            return response.json();
        })
        .then(data => {
            // Проверяем, что данные пришли корректно
            console.log(data); // Выводим данные в консоль для проверки
            
            // Обновляем элементы на странице
            document.getElementById('title').innerText = data.name;
            document.getElementById('address').innerText = `Адрес: ${data.address}`;
            document.getElementById('establishment-image').src = data.image || 'placeholder-establishment.jpg'; // Изображение по умолчанию

            // Проверяем, есть ли меню
            if (data.menuImage) {
                document.getElementById('menu-image').src = data.menuImage;
            } else {
                document.getElementById('menu-image').src = 'placeholder-menu.jpg'; // Замените на изображение по умолчанию
            }

            // Инициализация карты
            initMap(data.latitude, data.longitude); // Передаем координаты ресторана
        })
        .catch(error => console.error('Ошибка при получении данных:', error));

    // Функция инициализации карты
    function initMap(latitude, longitude) {
        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10, // Уровень зума
            center: {lat: latitude || 44.9521, lng: longitude || 34.1028} // Центр карты (по умолчанию Симферополь)
        });

        // Добавление маркера на карте
        new google.maps.Marker({
            position: {lat: latitude, lng: longitude},
            map: map,
            title: 'Ресторан'
        });
    }

    // Обработчик для отправки отзыва
    document.getElementById('submit-review').addEventListener('click', function() {
        const review = document.getElementById('review-text').value;

        // Проверка, что поле отзыва не пустое
        if (!review) {
            alert('Пожалуйста, напишите отзыв.');
            return;
        }

        // Отправка отзыва на сервер
        fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ review })
        })
        .then(response => {
            if (response.ok) {
                alert('Ваш отзыв отправлен!');
                document.getElementById('review-text').value = ''; // Очистить поле
            } else {
                throw new Error('Ошибка при отправке отзыва');
            }
        })
        .catch(error => console.error('Ошибка:', error));
    });
});