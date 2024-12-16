document.getElementById('search-input').addEventListener('input', function() {
    const query = this.value.trim();
    if (query.length > 2) {
        fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка сети');
                }
                return response.json();
            })
            .then(data => {
                console.log('Полученные данные:', data); // Логируем данные
                displayResults(data);
            })
            .catch(error => console.error('Ошибка:', error));
    } else {
        document.getElementById('search-results').innerHTML = ''; // Очищаем результаты, если запрос слишком короткий
    }
});

function displayResults(restaurants) {
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = ''; // Очищаем предыдущие результаты

    if (!Array.isArray(restaurants)) {
        resultsDiv.innerHTML = '<p>Ошибка получения данных.</p>';
        return;
    }

    if (restaurants.length === 0) {
        resultsDiv.innerHTML = '<p>Рестораны не найдены.</p>';
        return;
    }

    restaurants.forEach(restaurant => {
        const restaurantItem = document.createElement('div');
        restaurantItem.className = 'restaurant-item';
        restaurantItem.innerHTML = `
            <h3>${restaurant.name}</h3>
            <p>Адрес: ${restaurant.address}</p>
            <p>Описание: ${restaurant.description || 'Нет описания'}</p>
            <img src="${restaurant.image || 'placeholder-image.jpg'}" alt="${restaurant.name}" style="width: 100px; height: auto;">
        `;

        // Добавляем обработчик события клика для перехода на страницу ресторана
        restaurantItem.addEventListener('click', () => {
            window.location.href = `restaurant.html?id=${restaurant.id}`; 
        });

        resultsDiv.appendChild(restaurantItem);
    });
}