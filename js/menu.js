const defaultMenuItems = [
    // Pizzas
    {
        id: 1,
        name: "Margherita Pizza",
        category: "Pizza",
        price: 199,
        description: "Classic cheese and tomato base with fresh basil.",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=400&fit=crop",
        tags: ["veg", "cheese", "classic", "popular"]
    },
    {
        id: 2,
        name: "Veg Supreme",
        category: "Pizza",
        price: 249,
        description: "Loaded with onions, bell peppers, mushrooms, and olives.",
        image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&h=400&fit=crop",
        tags: ["veg", "spicy", "loaded"]
    },
    {
        id: 3,
        name: "Pepperoni Pizza",
        category: "Pizza",
        price: 299,
        description: "Topped with spicy pepperoni and mozzarella cheese.",
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=400&fit=crop",
        tags: ["non-veg", "spicy", "meat", "popular"]
    },
    // Burgers
    {
        id: 4,
        name: "Classic Cheeseburger",
        category: "Burger",
        price: 149,
        description: "Juicy beef patty, cheddar cheese, and fresh veggies.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop",
        tags: ["non-veg", "cheese", "beef"]
    },
    {
        id: 5,
        name: "Spicy Paneer Burger",
        category: "Burger",
        price: 129,
        description: "Crispy paneer patty with spicy mayo and lettuce.",
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&h=400&fit=crop",
        tags: ["veg", "spicy", "paneer"]
    },
    // Pasta
    {
        id: 6,
        name: "Penne Alfredo",
        category: "Pasta",
        price: 229,
        description: "Creamy white sauce pasta with garlic and parmesan.",
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&h=400&fit=crop",
        tags: ["veg", "creamy", "cheese"]
    },
    {
        id: 7,
        name: "Arrabbiata Pasta",
        category: "Pasta",
        price: 209,
        description: "Spicy red tomato sauce pasta with herbs.",
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&h=400&fit=crop",
        tags: ["veg", "spicy", "tomato"]
    },
    // Drinks
    {
        id: 8,
        name: "Mojito",
        category: "Drinks",
        price: 99,
        description: "Refreshing mint and lime mocktail.",
        image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&h=400&fit=crop",
        tags: ["drink", "refreshing", "cold"]
    },
    {
        id: 9,
        name: "Cold Coffee",
        category: "Drinks",
        price: 119,
        description: "Rich and creamy cold blended coffee.",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=400&fit=crop",
        tags: ["drink", "coffee", "cold"]
    },
    // Desserts
    {
        id: 10,
        name: "Chocolate Brownie",
        category: "Desserts",
        price: 159,
        description: "Warm fudgy brownie with vanilla ice cream.",
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=400&fit=crop",
        tags: ["sweet", "chocolate", "dessert"]
    }
];

// Initialize menuItems from localStorage, or use defaults
var menuItems = JSON.parse(localStorage.getItem('menuItems'));
if (!menuItems || menuItems.length === 0) {
    menuItems = defaultMenuItems;
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
}

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const filterContainer = document.getElementById('category-filters-container');
    
    if (menuContainer) {
        renderMenu(menuItems);
        
        if (filterContainer) {
            const categories = JSON.parse(localStorage.getItem('categories')) || ["Pizza", "Burger", "Pasta", "Drinks", "Desserts"];
            
            // Add 'All Items' button
            const allBtn = document.createElement('button');
            allBtn.className = 'btn btn-primary category-filter active';
            allBtn.setAttribute('data-category', 'All');
            allBtn.innerText = 'All Items';
            filterContainer.appendChild(allBtn);
            
            // Add other category buttons
            categories.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-outline-primary category-filter';
                btn.setAttribute('data-category', cat);
                btn.innerText = cat;
                filterContainer.appendChild(btn);
            });
            
            // Add event listeners to newly created buttons
            const categoryFilters = document.querySelectorAll('.category-filter');
            categoryFilters.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Update active state
                    categoryFilters.forEach(b => b.classList.remove('active', 'btn-primary'));
                    categoryFilters.forEach(b => b.classList.add('btn-outline-primary'));
                    e.target.classList.remove('btn-outline-primary');
                    e.target.classList.add('active', 'btn-primary');
                    
                    const category = e.target.getAttribute('data-category');
                    if (category === 'All') {
                        renderMenu(menuItems);
                    } else {
                        const filtered = menuItems.filter(item => item.category === category);
                        renderMenu(filtered);
                    }
                });
            });
        }
    }
});

function renderMenu(items) {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;
    
    menuContainer.innerHTML = '';
    
    if (items.length === 0) {
        menuContainer.innerHTML = '<div class="col-12 text-center py-5"><h4 class="text-muted">No items found.</h4></div>';
        return;
    }
    
    items.forEach((item, index) => {
        // Stagger animation based on index
        const delayClass = `delay-${(index % 3 + 1) * 100}`;
        
        const card = document.createElement('div');
        card.className = `col-md-6 col-lg-4 fade-in-up ${delayClass}`;
        
        card.innerHTML = `
            <div class="card food-card h-100 text-center">
                <img src="${item.image}" class="card-img-top" alt="${item.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold">${item.name}</h5>
                    <p class="card-text text-muted flex-grow-1">${item.description}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="price">₹${item.price}</span>
                        <button class="btn btn-outline-primary btn-sm" onclick="addToCart(${item.id})">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        menuContainer.appendChild(card);
    });
}

// Global addToCart function that cart.js will also use/listen to, but we'll define the core here
// or in cart.js. Let's define the logic here for simplicity since menu items are here.
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(i => i.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Call global function from app.js to update badge
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
    
    showToast(`${item.name} added to cart!`);
}

// Simple Toast Notification
function showToast(message) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1050';
        document.body.appendChild(toastContainer);
    }
    
    const toastHtml = `
        <div class="toast align-items-center text-bg-success border-0 show" role="alert" aria-live="assertive" aria-atomic="true" style="animation: fadeInUp 0.3s ease;">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-check-circle me-2"></i> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = toastHtml;
    const toastEl = tempDiv.firstElementChild;
    toastContainer.appendChild(toastEl);
    
    setTimeout(() => {
        if (toastEl && toastEl.parentElement) {
            toastEl.remove();
        }
    }, 3000);
}
