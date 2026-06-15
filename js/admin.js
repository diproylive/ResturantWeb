document.addEventListener('DOMContentLoaded', () => {
    // Basic frontend authentication check
    if (localStorage.getItem('isAdmin') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    renderAdminOrders();
    renderAdminMenuItems();
    renderAdminSettingsAndCategories();
});

function handleAdminLogout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('isAdmin');
    window.location.href = 'index.html';
}

function renderAdminOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const deliveryBody = document.getElementById('admin-delivery-orders-body');
    const dineInBody = document.getElementById('admin-dinein-orders-body');
    
    if (!deliveryBody || !dineInBody) return;

    deliveryBody.innerHTML = '';
    dineInBody.innerHTML = '';
    
    let deliveryCount = 0;
    let dineInCount = 0;
    
    orders.reverse().forEach(order => {
        const itemNames = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
        
        let statusBadge = '';
        if (order.status === 'Preparing') statusBadge = 'bg-warning text-dark';
        else if (order.status === 'Confirmed') statusBadge = 'bg-primary';
        else if (order.status === 'Ready' || order.status === 'Out for Delivery') statusBadge = 'bg-info text-dark';
        else if (order.status === 'Delivered' || order.status === 'Served') statusBadge = 'bg-success';
        else if (order.status === 'Cancelled') statusBadge = 'bg-danger';
        else statusBadge = 'bg-secondary';
        
        let selectOptions = '';
        let customerInfo = `
            <div class="fw-bold">${order.customer?.name || order.customerName || 'Unknown'}</div>
            <div class="small text-muted">${order.customer?.phone || order.customerPhone || 'Unknown'}</div>
        `;

        if (order.orderType === 'Dine-in') {
            customerInfo += `<div class="badge bg-primary mt-1">Table ${order.tableNumber}</div>`;
            selectOptions = `
                <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                <option value="Served" ${order.status === 'Served' ? 'selected' : ''}>Served</option>
                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            `;
            dineInCount++;
        } else {
            customerInfo += `
                <div class="small text-muted mt-1" style="max-width: 150px; white-space: normal;">
                    <i class="fas fa-map-marker-alt text-danger"></i> ${order.customer?.address || 'No Address'}
                </div>
            `;
            selectOptions = `
                <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            `;
            deliveryCount++;
        }

        const row = `
            <tr>
                <td class="fw-bold">#${order.id}</td>
                <td>${order.date}</td>
                <td>${customerInfo}</td>
                <td style="max-width: 250px;" class="text-truncate" title="${itemNames}">${itemNames}</td>
                <td class="fw-bold text-success">₹${order.total.toFixed(2)}</td>
                <td><span class="badge ${statusBadge}">${order.status}</span></td>
                <td>
                    <select class="form-select form-select-sm d-inline-block w-auto" onchange="updateOrderStatus('${order.id}', this.value)">
                        ${selectOptions}
                    </select>
                </td>
            </tr>
        `;
        
        if (order.orderType === 'Dine-in') {
            dineInBody.insertAdjacentHTML('beforeend', row);
        } else {
            deliveryBody.insertAdjacentHTML('beforeend', row);
        }
    });
    
    if (deliveryCount === 0) {
        deliveryBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No delivery orders found.</td></tr>';
    }
    if (dineInCount === 0) {
        dineInBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No dine-in orders found.</td></tr>';
    }
}

function updateOrderStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        renderAdminOrders();
    }
}

function clearAllOrders() {
    if (confirm("Are you sure you want to clear all orders? This action cannot be undone.")) {
        localStorage.setItem('orders', JSON.stringify([]));
        renderAdminOrders();
    }
}

function renderAdminMenuItems() {
    const items = JSON.parse(localStorage.getItem('menuItems')) || window.defaultMenuItems || [];
    const tbody = document.getElementById('admin-menu-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    items.forEach(item => {
        const row = `
            <tr>
                <td><img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
                <td class="fw-bold">${item.name}</td>
                <td><span class="badge bg-secondary">${item.category}</span></td>
                <td>₹${item.price}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editItem(${item.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

let itemModalInstance = null;

function openItemModal() {
    document.getElementById('item-form').reset();
    document.getElementById('item-id').value = '';
    
    const catSelect = document.getElementById('item-category');
    if (catSelect) {
        catSelect.innerHTML = '';
        const cats = JSON.parse(localStorage.getItem('categories')) || [];
        cats.forEach(c => {
            catSelect.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`);
        });
    }

    if (!itemModalInstance) {
        itemModalInstance = new bootstrap.Modal(document.getElementById('itemModal'));
    }
    itemModalInstance.show();
}

function editItem(id) {
    const items = JSON.parse(localStorage.getItem('menuItems')) || [];
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    openItemModal();
    document.getElementById('item-id').value = item.id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-desc').value = item.description;
    document.getElementById('item-image').value = item.image;
}

function deleteItem(id) {
    if (confirm("Delete this menu item?")) {
        let items = JSON.parse(localStorage.getItem('menuItems')) || [];
        items = items.filter(i => i.id !== id);
        localStorage.setItem('menuItems', JSON.stringify(items));
        renderAdminMenuItems();
    }
}

function handleSaveItem(e) {
    e.preventDefault();
    
    const id = document.getElementById('item-id').value;
    const name = document.getElementById('item-name').value;
    const category = document.getElementById('item-category').value;
    const price = parseInt(document.getElementById('item-price').value);
    const desc = document.getElementById('item-desc').value;
    const imgUrl = document.getElementById('item-image').value || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
    
    let items = JSON.parse(localStorage.getItem('menuItems')) || [];
    
    if (id) {
        // Edit existing
        const idx = items.findIndex(i => i.id == id);
        if (idx > -1) {
            items[idx] = { ...items[idx], name, category, price, description: desc, image: imgUrl };
        }
    } else {
        // Add new
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        items.push({ id: newId, name, category, price, description: desc, image: imgUrl });
    }
    
    localStorage.setItem('menuItems', JSON.stringify(items));
    renderAdminMenuItems();
    itemModalInstance.hide();
}

// Settings & Categories Handlers
function renderAdminSettingsAndCategories() {
    const settings = JSON.parse(localStorage.getItem('settings')) || { taxRate: 5, deliveryFee: 40 };
    const taxInput = document.getElementById('tax-rate');
    const feeInput = document.getElementById('delivery-fee');
    if (taxInput) taxInput.value = settings.taxRate;
    if (feeInput) feeInput.value = settings.deliveryFee;

    const cats = JSON.parse(localStorage.getItem('categories')) || [];
    const catList = document.getElementById('admin-categories-list');
    if (catList) {
        catList.innerHTML = '';
        cats.forEach((c, index) => {
            const li = `
                <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0 border-secondary border-opacity-25">
                    <span class="fw-semibold">${c}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${index})"><i class="fas fa-times"></i></button>
                </li>
            `;
            catList.insertAdjacentHTML('beforeend', li);
        });
    }
}

function handleSaveSettings(e) {
    e.preventDefault();
    const tax = parseFloat(document.getElementById('tax-rate').value);
    const fee = parseFloat(document.getElementById('delivery-fee').value);
    
    const settings = { taxRate: tax, deliveryFee: fee };
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
}

function handleAddCategory(e) {
    e.preventDefault();
    const input = document.getElementById('new-category');
    const newCat = input.value.trim();
    if (!newCat) return;
    
    const cats = JSON.parse(localStorage.getItem('categories')) || [];
    if (!cats.includes(newCat)) {
        cats.push(newCat);
        localStorage.setItem('categories', JSON.stringify(cats));
        input.value = '';
        renderAdminSettingsAndCategories();
    } else {
        alert("Category already exists!");
    }
}

function deleteCategory(index) {
    if (confirm("Delete this category? Menu items assigned to it won't be deleted but will need a new category.")) {
        const cats = JSON.parse(localStorage.getItem('categories')) || [];
        cats.splice(index, 1);
        localStorage.setItem('categories', JSON.stringify(cats));
        renderAdminSettingsAndCategories();
    }
}
