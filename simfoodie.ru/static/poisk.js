document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const dish = document.getElementById('dishInput').value.trim();
    searchRestaurants(dish);
});

function searchRestaurants(dish) {
    fetch('/api/restaurants')
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = ''; 

            if (dish) {
                const filteredRestaurants = data.filter(restaurant => 
                    restaurant.menu.some(item => item.toLowerCase().includes(dish.toLowerCase()))
                );

                if (filteredRestaurants.length > 0) {
                    filteredRestaurants.forEach(restaurant => {
                        const restaurantDiv = document.createElement('div');
                        restaurantDiv.innerHTML = `<h2>${restaurant.name}</h2>
                                                   <p>Адрес: ${restaurant.address}</p>
                                                   <p>Блюда: ${restaurant.menu.join(', ')}</p>`;
                        resultsDiv.appendChild(restaurantDiv);
                    });
                } else {
                    resultsDiv.innerHTML = '<p>Рестораны с таким блюдом не найдены.</p>';
                }
            } else {
                data.forEach(restaurant => {
                    const restaurantDiv = document.createElement('div');
                    restaurantDiv.innerHTML = `<h2>${restaurant.name}</h2>
                                               <p>Адрес: ${restaurant.address}</p>
                                               <p>Блюда: ${restaurant.menu.join(', ')}</p>`;
                    resultsDiv.appendChild(restaurantDiv);
                });
            }
        })
        .catch(error => {
            console.error('Ошибка при получении данных:', error);
        });
}
