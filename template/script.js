document.addEventListener('DOMContentLoaded', async function() {
    const restaurantId = getRestaurantIdFromURL(); // Получаем ID ресторана из URL

    if (!restaurantId) {
        console.error('ID ресторана не указан');
        return; 
    }

    try {
        const response = await fetch(`http://localhost:3000/api/restaurant?id=${restaurantId}`);
        if (!response.ok) {
            throw new Error('Сеть не в порядке');
        }
        const data = await response.json();
        console.log(data); // Для проверки
        
        // Обновление элементов на странице
        document.getElementById('title').innerText = data.name;
        document.getElementById('description').innerText = data.description || 'Описание заведения отсутствует'; 
        document.getElementById('address').innerText = `Адрес: ${data.address}`;
        document.getElementById('establishment-image').src = data.image || 'placeholder-establishment.jpg';

        // Проверка наличия изображения меню
        document.getElementById('menu-image').src = data.menuImage || 'placeholder-menu.jpg';

        // Инициализация карты
        initMap(data.latitude, data.longitude);
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
    }

    // Получение ID ресторана из URL
    function getRestaurantIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Инициализации карты для Яндекс.Карт
    function initMap(latitude, longitude) {
        const map = new ymaps.Map('map', {
            center: [latitude || 44.9521, longitude || 34.1028], 
            zoom: 10 
        });

        const placemark = new ymaps.Placemark([latitude, longitude], {
            balloonContent: 'Ресторан'
        });

        map.geoObjects.add(placemark);
        map.setCenter([latitude, longitude], 15); 
    }

    // Обработчик для отправки отзыва
    document.getElementById('submit-review').addEventListener('click', async function() {
        const review = document.getElementById('review-text').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const restaurantId = getRestaurantIdFromURL();

        if (!review || !username || !email) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    restaurant_id: restaurantId, 
                    user_name: username,         
                    user_email: email,           
                    content: review              
                })
            });

            if (response.ok) {
                alert('Ваш отзыв отправлен!');
                document.getElementById('review-text').value = '';
                document.getElementById('username').value = ''; 
                document.getElementById('email').value = ''; 
            } else {
                throw new Error('Ошибка при отправке отзыва');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    });
});