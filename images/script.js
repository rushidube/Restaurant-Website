// Backend API URL
const API_URL = "http://localhost:5000/api/cart";

// References to HTML elements
const menuContainer = document.getElementById("menu-items");
const orderItemsContainer = document.getElementById("order-items");
const cartViewItems = document.getElementById("cart-view-items");
const totalEl = document.getElementById("total");
const cartCountEl = document.getElementById("cart-count");
const clearCartBtn = document.getElementById("clear-cart-btn");

// Table booking references
const tableContainer = document.getElementById("tables");
const bookedTablesList = document.getElementById("booked-tables");

// Array of menu items
const menuItems = [
  { id: 1, name: "Spring Rolls", category: "appetizers", price: 5.99, img: "images/spring_rolls.webp" },
  { id: 2, name: "Grilled Chicken", category: "main-course", price: 12.99, img: "images/grilled_chicken.jpg" },
  { id: 3, name: "Cheesecake", category: "desserts", price: 6.99, img: "images/cheesecake.jpg" },
  { id: 4, name: "Caesar Salad", category: "appetizers", price: 7.49, img: "images/caesar_salad.jpg" },
  { id: 5, name: "Fried Rice", category: "main-course", price: 9.99, img: "images/fried_rice.jpg" },
  { id: 6, name: "Spaghetti Bolognese", category: "main-course", price: 14.99, img: "images/spaghetti_bolognese.jpeg" },
  { id: 7, name: "Chocolate Cake", category: "desserts", price: 5.49, img: "images/chocolate_cake.jpg" },
  { id: 8, name: "Vegetable Stir-Fry", category: "main-course", price: 10.99, img: "images/vegetable_stir_fry.jpg" },
  { id: 9, name: "Garlic Bread", category: "appetizers", price: 4.49, img: "images/garlic_bread.jpg" },
  { id: 10, name: "Lemon Tart", category: "desserts", price: 6.49, img: "images/lemon_tart.jpg" },
  { id: 11, name: "Tomato Soup", category: "appetizers", price: 3.99, img: "images/tomato_soup.jpg" },
  { id: 12, name: "Dosa", category: "main-course", price: 3.99, img: "images/Dosa.jpg" },
  { id: 13, name: "Apple Pie", category: "desserts", price: 5.99, img: "images/apple_pie.jpg" },
  { id: 14, name: "Caprese Salad", category: "appetizers", price: 6.99, img: "images/caprese_salad.jpg" },
  { id: 15, name: "Clams Casino", category: "appetizers", price: 8.49, img: "images/clams_casino.jpg" }

];

// Table Booking Data
const availableTables = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5"];
let bookedTables = [];

// Render menu items
function renderMenu() {
  menuContainer.innerHTML = "";
  const searchTerm = document.getElementById("search-bar").value.toLowerCase();
  const selectedCategory = document.getElementById("category").value;
  const maxPrice = parseFloat(document.getElementById("price-filter").value) || Infinity;

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm) &&
    (selectedCategory === "all" || item.category === selectedCategory) &&
    item.price <= maxPrice
  );

  filteredItems.forEach(item => {
    const itemEl = document.createElement("div");
    itemEl.className = "menu-item";
    itemEl.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>$${item.price.toFixed(2)}</p>
      <button onclick="addToCart(${item.id})">Add to Cart</button>
    `;
    menuContainer.appendChild(itemEl);
  });
}

// Add an item to the cart
function addToCart(id) {
  const item = menuItems.find(item => item.id === id);
  const orderItemEl = document.createElement("li");
  orderItemEl.className = "order-item";
  orderItemEl.innerHTML = `${item.name} - $${item.price.toFixed(2)}`;
  orderItemsContainer.appendChild(orderItemEl);
  updateTotal();

  try {
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
  } catch (err) {
    console.error("Error adding to cart:", err);
  }
}

// Update the total price in the "Your Order" section
function updateTotal() {
  const orderItems = orderItemsContainer.getElementsByClassName("order-item");
  let total = 0;
  Array.from(orderItems).forEach(item => {
    const price = parseFloat(item.innerHTML.split(" - $")[1]);
    total += price;
  });
  totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

// Fetch and display the cart items
async function updateCart() {
  try {
    const response = await fetch(API_URL);
    const cartItems = await response.json();
    cartViewItems.innerHTML = "";
    let total = 0;

    if (cartItems.length === 0) {
      cartViewItems.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      cartItems.forEach(item => {
        total += item.price;
        const cartItemEl = document.createElement("div");
        cartItemEl.className = "cart-item";
        cartItemEl.innerHTML = `
          <span>${item.name}</span>
          <span>$${item.price.toFixed(2)}</span>
        `;
        cartViewItems.appendChild(cartItemEl);
      });
    }
    cartCountEl.textContent = cartItems.length;
  } catch (err) {
    console.error("Error fetching cart:", err);
  }
}

// Submit the order
async function submitOrder() {
  const confirmation = confirm("Are you sure you want to submit your order?");
  if (confirmation) {
    clearOrderSection();
    await updateCart();
    alert("Order submitted successfully!");
  }
}

// Clear the "Your Order" section and reset the total
function clearOrderSection() {
  orderItemsContainer.innerHTML = "";
  totalEl.textContent = "Total: $0";
}

// Clear the cart
async function clearCart() {
  const confirmation = confirm("Are you sure you want to clear your cart?");
  if (confirmation) {
    try {
      await fetch(API_URL, { method: "DELETE" });
      updateCart();
      alert("Your cart has been cleared!");
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  }
}


// Event listener for the "Submit" button
document.querySelector(".submit_btn").addEventListener("click", submitOrder);

// Event listener for the "Clear Cart" button
clearCartBtn.addEventListener("click", clearCart);

// Event listeners for filtering menu items
document.getElementById("search-bar").addEventListener("input", renderMenu);
document.getElementById("category").addEventListener("change", renderMenu);
document.getElementById("price-filter").addEventListener("input", renderMenu);

// Initial render
renderMenu();
updateCart();
updateTableBookings();