// Get order data from localStorage
const orderId = localStorage.getItem("orderId")
const paymentMethod = localStorage.getItem("paymentMethod")
const orderAmount = localStorage.getItem("orderAmount")
const orderDate = localStorage.getItem("orderDate")

// Show data on page
if(orderId){
    document.getElementById("orderId").innerText = orderId
}

if(paymentMethod){
    document.getElementById("paymentMethod").innerText = paymentMethod
}

if(orderAmount){
    document.getElementById("orderAmount").innerText = orderAmount
}

if(orderDate){
    document.getElementById("orderDate").innerText = orderDate
}

// Continue shopping button
function goHome(){
    window.location.href = "../index.html"
}