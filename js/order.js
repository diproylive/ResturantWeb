document.addEventListener('DOMContentLoaded', () => {
    checkNewOrder();
    renderOrders();
});

function checkNewOrder() {
    const params = new URLSearchParams(window.location.search);
    const newOrderId = params.get('new_order');
    if (newOrderId) {
        const alertBox = document.getElementById('success-alert');
        const orderIdSpan = document.getElementById('success-order-id');
        if (alertBox && orderIdSpan) {
            orderIdSpan.innerText = newOrderId;
            alertBox.classList.remove('d-none');
            // Remove parameter from URL without refreshing
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

function renderOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const container = document.getElementById('orders-container');
    const emptyMsg = document.getElementById('no-orders-message');
    
    if (!container) return;
    
    if (orders.length === 0) {
        emptyMsg.classList.remove('d-none');
        return;
    }
    
    container.innerHTML = '';
    
    orders.forEach((order, index) => {
        const itemNames = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
        const card = document.createElement('div');
        card.className = `col-md-6 col-lg-4 fade-in-up delay-${(index % 3) * 100}`;
        
        let statusBadge = '';
        if (order.status === 'Preparing') statusBadge = 'bg-warning text-dark';
        else if (order.status === 'Confirmed') statusBadge = 'bg-primary';
        else if (order.status === 'Ready' || order.status === 'Out for Delivery') statusBadge = 'bg-info text-dark';
        else if (order.status === 'Delivered' || order.status === 'Served' || order.status === 'Completed') statusBadge = 'bg-success';
        else if (order.status === 'Cancelled') statusBadge = 'bg-danger';
        else statusBadge = 'bg-secondary';
        
        const orderTypeLabel = order.orderType === 'Dine-in' ? `Dine-in (Table ${order.tableNumber})` : 'Delivery';
        
        let cancelBtnHtml = '';
        if (order.status === 'Preparing') {
            cancelBtnHtml = `<button class="btn btn-sm btn-outline-danger flex-grow-1 mt-2" onclick="cancelOrder('${order.id}')"><i class="fas fa-times"></i> Cancel</button>`;
        }
        
        card.innerHTML = `
            <div class="card h-100 shadow-sm border-0 bg-body-tertiary">
                <div class="card-header bg-transparent border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                    <span class="fw-bold text-primary">#${order.id}</span>
                    <span class="badge ${statusBadge} rounded-pill">${order.status || 'Preparing'}</span>
                </div>
                <div class="card-body flex-grow-1">
                    <p class="text-muted small mb-1"><i class="far fa-clock"></i> ${order.date}</p>
                    <p class="text-muted small mb-2"><i class="fas fa-motorcycle"></i> ${orderTypeLabel}</p>
                    <p class="mb-3 text-truncate" title="${itemNames}">${itemNames}</p>
                    <h5 class="fw-bold mb-0">₹${order.total}</h5>
                </div>
                <div class="card-footer bg-transparent border-top-0 pb-3 d-flex flex-column gap-2">
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary flex-grow-1" onclick="generateInvoice('${order.id}')">
                            <i class="fas fa-file-pdf"></i> Invoice
                        </button>
                        <button class="btn btn-sm btn-primary flex-grow-1" onclick="showQR('${order.id}')">
                            <i class="fas fa-qrcode"></i> QR
                        </button>
                    </div>
                    ${cancelBtnHtml}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function cancelOrder(orderId) {
    if (confirm("Are you sure you want to cancel this order?")) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1 && orders[index].status === 'Preparing') {
            orders[index].status = 'Cancelled';
            localStorage.setItem('orders', JSON.stringify(orders));
            renderOrders();
        } else {
            alert("This order cannot be cancelled anymore.");
        }
    }
}

function showQR(orderId) {
    const qrContainer = document.getElementById('qrcode-container');
    qrContainer.innerHTML = ''; // clear previous
    
    // Create new QR Code
    new QRCode(qrContainer, {
        text: JSON.stringify({ id: orderId, type: 'pickup' }),
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    
    // Show modal
    const qrModal = new bootstrap.Modal(document.getElementById('qrModal'));
    qrModal.show();
}

function generateInvoice(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(255, 94, 0); // Primary color
    doc.text("Food Express", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Invoice / Receipt", 105, 28, null, null, "center");
    
    // Order Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Order ID: ${order.id}`, 20, 45);
    doc.text(`Date: ${order.date}`, 20, 52);
    doc.text(`Status: ${order.status || 'Preparing'}`, 20, 59);
    
    // Customer Info
    doc.text(`Customer: ${order.customer.name}`, 120, 45);
    doc.text(`Phone: ${order.customer.phone}`, 120, 52);
    
    // Line separator
    doc.line(20, 65, 190, 65);
    
    // Items
    let yPos = 75;
    doc.setFontSize(12);
    doc.text("Item", 20, yPos);
    doc.text("Qty", 120, yPos);
    doc.text("Price", 160, yPos);
    
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    doc.setFontSize(11);
    order.items.forEach(item => {
        doc.text(item.name, 20, yPos);
        doc.text(item.quantity.toString(), 125, yPos);
        doc.text(`Rs. ${item.price * item.quantity}`, 160, yPos);
        yPos += 8;
    });
    
    // Totals
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text("Total Amount:", 120, yPos);
    doc.setTextColor(255, 94, 0);
    doc.text(`Rs. ${order.total}`, 160, yPos);
    
    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text("Thank you for ordering with Food Express!", 105, 280, null, null, "center");
    
    // Download PDF
    doc.save(`Invoice_${order.id}.pdf`);
}
