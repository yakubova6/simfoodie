document.addEventListener('DOMContentLoaded', async function() {
    const restaurantId = 15; // Получаем ID ресторана из URL

    if (!restaurantId) {
        console.error('ID ресторана не указан');
        return; 
    }

    // Загружаем данные о ресторане
    await loadRestaurantData(restaurantId);
    // Загружаем меню
    await loadMenu(restaurantId);

    // Получение ID ресторана из URL
    function getRestaurantIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Функция для загрузки данных о ресторане
    async function loadRestaurantData(restaurantId) {
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

            // Инициализация карты
            initMap(data.latitude, data.longitude);
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        }
    }

    // Функция для инициализации карты
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

    // Функция для загрузки меню из базы данных
    async function loadMenu(restaurantId) {
        try {
            const response = await fetch(`http://localhost:3000/api/dishes?restaurantId=${restaurantId}`);
            if (!response.ok) {
                throw new Error('Ошибка загрузки меню');
            }
            const dishes = await response.json();
            const menuElement = document.getElementById('menu');
            menuElement.innerHTML = ''; // Очищаем текущее содержимое

            // Добавляем блюда в меню
            dishes.forEach(dish => {
                const dishElement = document.createElement('div');
                dishElement.className = 'menu-item';
                dishElement.innerText = `${dish.name} - ${dish.price}₽`;
                menuElement.appendChild(dishElement);
            });
        } catch (error) {
            console.error('Ошибка при загрузке меню:', error);
            document.getElementById('menu').innerHTML = '<p>Ошибка загрузки меню.</p>';
        }
    }

    // Обработка клика по заголовку меню
    document.querySelector('.menu-header').addEventListener('click', async () => {
        const menuElement = document.getElementById('menu');
        const arrow = document.getElementById('arrow');
        
        if (menuElement.style.display === 'none' || menuElement.style.display === '') {
            menuElement.style.display = 'block'; 
            // Загружаем меню только при открытии
            await loadMenu(restaurantId); 
            arrow.style.transform = 'rotate(180deg)'; 
        } else {
            menuElement.style.display = 'none'; 
            arrow.style.transform = 'rotate(0deg)'; 
        }
    });

    // Обработчик для отправки отзыва
    document.getElementById('submit-review').addEventListener('click', async function() {
        const review = document.getElementById('review-text').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;

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