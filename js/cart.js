document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
});

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-message');
    const content = document.getElementById('cart-content');
    
    if (!container) return;
    
    if (cart.length === 0) {
        content.classList.add('d-none');
        emptyMsg.classList.remove('d-none');
        return;
    }
    
    content.classList.remove('d-none');
    emptyMsg.classList.add('d-none');
    
    container.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;
        
        const card = document.createElement('div');
        card.className = `card mb-3 shadow-sm border-0 fade-in-up delay-${(index % 3) * 100}`;
        card.innerHTML = `
            <div class="row g-0 align-items-center p-2">
                <div class="col-3 col-md-2 text-center">
                    <img src="${item.image}" class="img-fluid rounded" alt="${item.name}" style="height: 80px; object-fit: cover;">
                </div>
                <div class="col-9 col-md-10">
                    <div class="card-body py-1 d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title mb-1 fw-bold">${item.name}</h5>
                            <p class="card-text text-muted mb-0">₹${item.price}</p>
                        </div>
                        <div class="d-flex align-items-center gap-3">
                            <div class="input-group input-group-sm" style="width: 100px;">
                                <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${item.id}, -1)">-</button>
                                <input type="text" class="form-control text-center bg-transparent text-body" value="${item.quantity}" readonly>
                                <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${item.id}, 1)">+</button>
                            </div>
                            <button class="btn btn-sm btn-danger rounded-circle px-2 py-1" onclick="removeItem(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    updateSummary(subtotal);
}

function updateQuantity(id, change) {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        saveCart(cart);
    }
}

function removeItem(id) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
}

function updateSummary(subtotal) {
    const settings = JSON.parse(localStorage.getItem('settings')) || { taxRate: 5, deliveryFee: 40 };
    
    const tax = Math.round(subtotal * (settings.taxRate / 100));
    
    // Check order type
    let delivery = settings.deliveryFee;
    const typeDineIn = document.getElementById('typeDineIn');
    if (typeDineIn && typeDineIn.checked) {
        delivery = 0;
    }
    
    const total = subtotal + tax + delivery;
    
    document.getElementById('subtotal').innerText = `₹${subtotal}`;
    
    const taxLabel = document.getElementById('tax-label');
    if (taxLabel) taxLabel.innerText = `Tax (${settings.taxRate}%)`;
    
    const taxEl = document.getElementById('cart-tax') || document.getElementById('tax');
    if (taxEl) taxEl.innerText = `₹${tax}`;
    
    const deliveryEl = document.getElementById('cart-delivery') || document.getElementById('delivery');
    if (deliveryEl) deliveryEl.innerText = `₹${delivery}`;
    
    document.getElementById('total').innerText = `₹${total}`;
    
    // Save total to a dataset attribute for easy access during checkout
    document.getElementById('total').dataset.amount = total;
}

function handleCheckout(e) {
    e.preventDefault();
    
    const cart = getCart();
    if (cart.length === 0) return;
    
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const totalAmount = parseFloat(document.getElementById('total').dataset.amount);
    
    const isDineIn = document.getElementById('typeDineIn') && document.getElementById('typeDineIn').checked;
    const address = isDineIn ? '' : document.getElementById('customer-address').value;
    const tableNumber = isDineIn ? document.getElementById('table-number').value : null;
    const orderType = isDineIn ? 'Dine-in' : 'Delivery';
    
    const orderId = 'ORD' + Date.now().toString().slice(-6);
    
    const newOrder = {
        id: orderId,
        date: new Date().toLocaleString(),
        customer: { name, phone, address },
        orderType: orderType,
        tableNumber: tableNumber,
        items: cart,
        total: totalAmount,
        status: 'Preparing'
    };
    
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.unshift(newOrder); // Add to beginning
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Redirect
    window.location.href = `orders.html?new_order=${orderId}`;
}

function toggleOrderType() {
    const typeDineIn = document.getElementById('typeDineIn');
    const isDineIn = typeDineIn && typeDineIn.checked;
    
    const addressContainer = document.getElementById('address-container');
    const addressInput = document.getElementById('customer-address');
    const tableContainer = document.getElementById('table-container');
    const tableInput = document.getElementById('table-number');
    const deliveryLabel = document.getElementById('delivery-label');
    
    if (isDineIn) {
        if(addressContainer) addressContainer.classList.add('d-none');
        if(addressInput) addressInput.removeAttribute('required');
        
        if(tableContainer) tableContainer.classList.remove('d-none');
        if(tableInput) tableInput.setAttribute('required', 'true');
        
        if (deliveryLabel) deliveryLabel.innerText = "Delivery Fee (Waived for Dine-in)";
    } else {
        if(addressContainer) addressContainer.classList.remove('d-none');
        if(addressInput) addressInput.setAttribute('required', 'true');
        
        if(tableContainer) tableContainer.classList.add('d-none');
        if(tableInput) tableInput.removeAttribute('required');
        
        if (deliveryLabel) deliveryLabel.innerText = "Delivery Fee";
    }
    
    // Re-calculate totals
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = 0;
    cart.forEach(item => { subtotal += item.price * item.quantity; });
    updateSummary(subtotal);
}
