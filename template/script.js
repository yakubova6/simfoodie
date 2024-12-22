document.addEventListener('DOMContentLoaded', async function() {
    const restaurantId = new URLSearchParams(window.location.search).get('id');

    if (!restaurantId) {
        console.error('ID ресторана не указан');
        return; 
    }

    // Загружаем данные о ресторане
    await loadRestaurantData(restaurantId);
    // Загружаем меню ресторана
    await loadMenuData(restaurantId);

    async function loadRestaurantData(restaurantId) {
        try {
            const response = await fetch(`http://localhost:3000/api/restaurant?id=${restaurantId}`);
            if (!response.ok) {
                throw new Error('Сеть не в порядке');
            }
            const data = await response.json();
            console.log(data); 

            // Проверка наличия необходимых данных
            if (!data.latitude || !data.longitude) {
                console.error('Широта и/или долгота не указаны');
                return;
            }

            // Отображаем данные на странице
            document.getElementById('title').innerText = data.name;
            document.getElementById('description').innerText = `Описание заведения: ${data.description || 'Описание заведения отсутствует'}`;
            document.getElementById('address').innerText = `Адрес: ${data.address}`;
            document.getElementById('establishment-image').src = data.image || 'placeholder-establishment.jpg';

            // Инициализация карты Яндекс
            initMap(data.latitude, data.longitude);
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        }
    }

    async function loadMenuData(restaurantId) {
        try {
            const response = await fetch(`http://localhost:3000/api/menu?id=${restaurantId}`);
            if (!response.ok) {
                throw new Error('Ошибка сети при загрузке меню');
            }
            const menu = await response.json();
            console.log('Меню, полученное с сервера:', menu); // Логируем меню
            displayMenu(menu);
        } catch (error) {
            console.error('Ошибка при получении меню:', error);
        }
    }

    let currentDisplayCount = 5; // Количество блюд, отображаемых изначально
    const incrementCount = 5; // Количество блюд, добавляемых при нажатии "Показать больше"

    function displayMenu(dishes) {
        const menuContainer = document.getElementById('menu');
        menuContainer.innerHTML = ''; // Очищаем контейнер перед добавлением нового меню

        // Ограничиваем количество отображаемых блюд
        const displayedDishes = dishes.slice(0, currentDisplayCount);
        
        displayedDishes.forEach(dish => {
            const dishElement = document.createElement('div');
            dishElement.className = 'dish';
            dishElement.innerHTML = `
                <div style="color: black; font-size: 1.2em; font-weight: bold;">${dish.name}</div>
                <p style="margin: 0;">Цена: ${dish.price} руб.</p>
            `;

            // Стили для улучшения читабельности
            dishElement.style.border = '1px solid #ccc'; 
            dishElement.style.padding = '10px'; 
            dishElement.style.marginBottom = '10px'; 
            dishElement.style.borderRadius = '5px'; 
            dishElement.style.backgroundColor = '#f9f9f9'; 

            menuContainer.appendChild(dishElement);
        });

        // Добавляем кнопку "Показать больше", если есть еще блюда
        if (currentDisplayCount < dishes.length) {
            const showMoreButton = document.createElement('button');
            showMoreButton.innerText = 'Показать больше';
            showMoreButton.style.marginTop = '10px'; 
            showMoreButton.onclick = () => {
                currentDisplayCount += incrementCount; 
                displayMenu(dishes); 
            };
            menuContainer.appendChild(showMoreButton);
        }
    }

    // Обработка клика по заголовку меню
    document.querySelector('.menu-header').addEventListener('click', async () => {
        const menuElement = document.getElementById('menu');
        const arrow = document.getElementById('arrow');
        
        if (menuElement.style.display === 'none' || menuElement.style.display === '') {
            menuElement.style.display = 'block'; 
            // Загружаем меню только при открытии
            await loadMenuData(restaurantId);
            arrow.style.transform = 'rotate(180deg)'; 
        } else {
            menuElement.style.display = 'none'; 
            arrow.style.transform = 'rotate(0deg)'; 
        }
    });

    // Функция для инициализации карты
    function initMap(latitude, longitude) {
        ymaps.ready(() => {
            const myMap = new ymaps.Map("map", {
                center: [latitude, longitude],
                zoom: 14 
            });

            const myPlacemark = new ymaps.Placemark([latitude, longitude], {
                balloonContent: "Здесь находится заведение"
            });

            myMap.geoObjects.add(myPlacemark);
        });
    }

    // Обработка отправки отзыва
    document.getElementById('submit-review').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const reviewText = document.getElementById('review-text').value;

        const reviewData = {
            restaurant_id: restaurantId,
            user_name: username,
            user_email: email,
            content: reviewText
        };

        try {
            const response = await fetch('http://localhost:3000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                alert('Отзыв успешно отправлен!');
                // Очистка полей после отправки
                document.getElementById('username').value = '';
                document.getElementById('email').value = '';
                document.getElementById('review-text').value = '';
            } else {
                throw new Error('Ошибка при отправке отзыва');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось отправить отзыв. Попробуйте позже.');
        }
    });
});