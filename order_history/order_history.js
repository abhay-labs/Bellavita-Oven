function goHome() {
    window.location.href = "../index.html";
}

let orders = JSON.parse(localStorage.getItem("orders")) || [];
let container = document.getElementById("ordersContainer");

if (orders.length === 0) {
    container.innerHTML = `
        <div class="text-center mt-5">
            <h3>No Orders Yet</h3>
            <p>Order something delicious from BellaVita Oven 🍰</p>
        </div>
    `;
} else {

    orders.reverse().forEach(order => {

        let itemsHTML = "";
        order.items.forEach(item => {
            itemsHTML += `
                <div class="order-item">
                    <div class="item-left">
                        <img src="${item.img}" class="item-img">
                        <div>
                            <div class="item-name">
                                ${item.name || item.category || "Cake"}
                            </div>

                            <div class="item-desc" style="font-size:12px;color:gray;">
                                ${item.desc || ""}
                            </div>

                            <div class="item-qty">Qty: ${item.qty}</div>
                        </div>
                    </div>
                    <div class="item-price">₹${item.price * item.qty}</div>
                </div>
            `;
        });

        container.innerHTML += `
            <div class="order-card">

                <div class="order-header">
                    <div>
                        <div class="order-id">Order ${order.id}</div>
                        <div style="font-size:12px;color:gray;">${order.date}</div>
                    </div>
                    <div class="order-status">${order.status}</div>
                </div>

                <div class="order-items">
                    ${itemsHTML}
                </div>

                <div class="order-total">
                    Total Paid: ₹${order.total}
                </div>

                <div class="order-info mt-2">
                    <small>Payment: ${order.payment}</small><br>
                    <small>Delivery: ${order.address}</small>
                </div>

                <div class="order-buttons">
                    <button class="reorder-btn" onclick="reorder('${order.id}')">
                        Reorder
                    </button>
                    <button class="invoice-btn">Invoice</button>
                    <button class="track-btn">Track Order</button>
                </div>

            </div>
        `;
    });
}



function reorder(orderId) {

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    // Find selected order
    let order = orders.find(o => o.id === orderId);

    if (!order) {
        alert("Order not found");
        return;
    }

    // Clear old cart
    localStorage.removeItem("cart");

    // Add order items to cart
    let newCart = order.items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        img: item.img,
        price: item.price,
        qty: item.qty
    }));

    localStorage.setItem("cart", JSON.stringify(newCart));

    // Redirect to checkout
    window.location.href = "../checkout/checkout.html";
}