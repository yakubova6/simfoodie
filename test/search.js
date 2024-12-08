const restaurants = [
{ name: "Boulangerie", dishes: ["пицца", "паста", "бургер"] },
{ name: "Miyagi", dishes: ["суши", "роллы", "пицца"] },
{ name: "NewYourkStreetPizza", dishes: ["бургер", "картошка фри", "коктейли"] },
{ name: "Sheker", dishes: ["паста", "пицца", "салаты"] },
{ name: "Simple Bar", dishes: ["суп", "пицца", "бургер"] }
];

function searchRestaurants(keyword) {
keyword = keyword.toLowerCase();
return restaurants.filter(restaurant =>
restaurant.dishes.some(dish => dish.includes(keyword))
);
}

function displayResults(results) {
const restaurantList = document.getElementById('restaurantList');
restaurantList.innerHTML = '';

if (results.length === 0) {
restaurantList.innerHTML = '<li>Рестораны не найдены</li>';
return;
}

results.forEach(restaurant => {
const li = document.createElement('li');
li.textContent = restaurant.name;
restaurantList.appendChild(li);
});
}

document.getElementById('searchInput').addEventListener('input', function(event) {
const keyword = event.target.value;
const results = searchRestaurants(keyword);
displayResults(results);
});
