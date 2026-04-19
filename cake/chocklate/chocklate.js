

const API = "http://192.168.29.76:5000";


function addItem(btn, event) {

    event.stopPropagation()

    let parent = btn.parentElement

    btn.style.display = "none"

    parent.querySelector(".qty-control").style.display = "flex"

    setQty(btn, 1)

}



function increase(btn, event) {

    event.stopPropagation()

    let qty = btn.parentElement.querySelector(".qty")

    let value = parseInt(qty.innerText) + 1

    setQty(btn, value)

}



function decrease(btn, event) {

    event.stopPropagation()

    let qty = btn.parentElement.querySelector(".qty")

    let value = parseInt(qty.innerText)

    value--

    if (value <= 0) {

        btn.parentElement.style.display = "none"

        btn.parentElement.parentElement.querySelector(".add-btn").style.display = "block"

        setQty(btn, 0)

    } else {

        setQty(btn, value)

    }

}



function setQty(btn, value) {

    let id;

    // check agar popup ke andar click hua hai
    if (btn.closest("#cakePopup")) {
        let popup = document.getElementById("cakePopup");
        id = popup.dataset.id;
    }
    // warna card ke andar click hua hai
    else {
        let card = btn.closest(".cake-card");
        id = card.dataset.id;
    }

    let card = document.querySelector('.cake-card[data-id="' + id + '"]');

    let popupQty = document.querySelector("#cakePopup .qty");
    let cardQty = card.querySelector(".qty");



    if (value > 0) {

        if (popupQty) popupQty.innerText = value;
        cardQty.innerText = value;

        card.querySelector(".add-btn").style.display = "none";
        card.querySelector(".qty-control").style.display = "flex";

        if (document.querySelector("#cakePopup .add-btn")) {
            document.querySelector("#cakePopup .add-btn").style.display = "none";
            document.querySelector("#cakePopup .qty-control").style.display = "flex";
        }

    }
    else {

        if (popupQty) popupQty.innerText = 0;
        cardQty.innerText = 0;

        card.querySelector(".qty-control").style.display = "none";
        card.querySelector(".add-btn").style.display = "block";

        if (document.querySelector("#cakePopup .qty-control")) {
            document.querySelector("#cakePopup .qty-control").style.display = "none";
            document.querySelector("#cakePopup .add-btn").style.display = "block";
        }
    }

    addToCart(id, value);
}



function openPopup(img, price, id) {

    let popup = document.getElementById("cakePopup")

    document.getElementById("popupImg").src = img

    document.getElementById("popupPrice").innerText = price

    popup.dataset.id = id

    popup.style.display = "flex"

    syncPopupQty(id)

}



function syncPopupQty(id) {

    let card = document.querySelector('.cake-card[data-id="' + id + '"]')

    let popupQty = document.querySelector("#cakePopup .qty")

    let cardQty = card.querySelector(".qty")



    if (card.querySelector(".qty-control").style.display === "flex") {

        document.querySelector("#cakePopup .add-btn").style.display = "none"

        document.querySelector("#cakePopup .qty-control").style.display = "flex"

        popupQty.innerText = cardQty.innerText

    } else {

        document.querySelector("#cakePopup .add-btn").style.display = "block"

        document.querySelector("#cakePopup .qty-control").style.display = "none"

    }

}



function closePopup() {

    document.getElementById("cakePopup").style.display = "none"

}



window.onclick = function (event) {

    let popup = document.getElementById("cakePopup")

    if (event.target === popup) {

        popup.style.display = "none"

    }

}


// OPEN CART
function openCart() {
    document.getElementById("sideCart").classList.add("open")
    document.getElementById("mainContent").classList.add("shift")
}

// CLOSE CART
function closeCart() {
    document.getElementById("sideCart").classList.remove("open")
    document.getElementById("mainContent").classList.remove("shift")
}

// ADD ITEM TO CART
function addToCart(id, qty) {

    let card = document.querySelector('.cake-card[data-id="' + id + '"]')

    let img = card.querySelector("img").src
    let price = parseInt(card.querySelector(".price").innerText.replace("₹", ""))

    let cart = JSON.parse(localStorage.getItem("cart")) || []

    let existing = cart.find(item => item.id === id)

    if (qty === 0) {

        cart = cart.filter(item => item.id !== id)

    } else {

        if (existing) {
            existing.qty = qty
        } else {
            let name = id.replace("cake", "Chocolate Cake ")

            cart.push({
                id: id,
                name: "Chocolate Cake",
                category: "Chocolate Cake",
                img: img,
                price: price,
                qty: qty
            })
        }

    }

    localStorage.setItem("cart", JSON.stringify(cart))

    renderSideCart()

    // ⭐ CART OPEN ALWAYS
    if (qty > 0) {
        openCart()
    }

    let user_id = localStorage.getItem("user_id")

    // ⭐ agar login nahi hai to sirf localStorage cart use karo
    if (!user_id) return

    // ⭐ database sync
    if (qty === 0) {

        fetch(API + "/cart/remove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user_id,
                id: id
            })
        })

    } else {

        fetch(API + "/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user_id,
                id: id,
                price: price,
                qty: qty,
                img: img
            })
        })

    }

}


// RENDER CART
function renderSideCart() {

    let cart = JSON.parse(localStorage.getItem("cart")) || []

    let container = document.getElementById("sideCartItems")

    let total = 0

    container.innerHTML = ""

    cart.forEach(item => {

        total += item.price * item.qty

        let div = document.createElement("div")

        div.className = "cart-item"

        div.innerHTML = `

        <div class="cart-left">

        <img src="${item.img}" class="cart-img">

        <div class="cart-info">

        <div class="cart-qty">

        <button onclick="updateCart('${item.id}',-1)">-</button>

        <span>${item.qty}</span>

        <button onclick="updateCart('${item.id}',1)">+</button>

        </div>

        </div>

        </div>

        <div class="cart-right">

        <span>₹${item.price * item.qty}</span>

        <button class="remove-btn" onclick="removeItem('${item.id}')">
        <i class="bi bi-trash3"></i>
        </button>

        </div>

        `

        container.appendChild(div)

    })

    document.getElementById("cartTotal").innerText = "Total: ₹" + total

}


function updateCart(id, change) {

    let cart = JSON.parse(localStorage.getItem("cart")) || []

    let item = cart.find(i => i.id === id)

    if (!item) return

    item.qty += change

    let card = document.querySelector('.cake-card[data-id="' + id + '"]')

    if (item.qty <= 0) {

        cart = cart.filter(i => i.id !== id)

        // ⭐ Card reset
        card.querySelector(".qty-control").style.display = "none"
        card.querySelector(".add-btn").style.display = "block"
        card.querySelector(".qty").innerText = "1"

    } else {

        // ⭐ Card qty update
        card.querySelector(".qty").innerText = item.qty

    }

    localStorage.setItem("cart", JSON.stringify(cart))

    renderSideCart()

    if (item.qty <= 0) {

        fetch(API + "/cart/remove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: localStorage.getItem("user_id"),
                id: id
            })
        })

    } else {

        async function addToCartServer(id, item) {

            try {
                const response = await fetch(API + "/cart/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: localStorage.getItem("user_id"),
                        product_id: id,
                        price: item.price,
                        qty: item.qty,
                        img: item.img
                    })
                });

                const data = await response.json();
                console.log("Server Response:", data);

            } catch (error) {
                console.error("Fetch Error:", error);
            }
        }

    }

}



function removeItem(id) {

    let cart = JSON.parse(localStorage.getItem("cart")) || []

    cart = cart.filter(i => i.id !== id)

    localStorage.setItem("cart", JSON.stringify(cart))

    let card = document.querySelector('.cake-card[data-id="' + id + '"]')

    card.querySelector(".qty-control").style.display = "none"
    card.querySelector(".add-btn").style.display = "block"

    renderSideCart()

    fetch(API + "/cart/remove", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: localStorage.getItem("user_id"),
            id: id
        })
    })

}


function loadCart() {

    let user_id = localStorage.getItem("user_id")

    if (!user_id) return

    fetch(API + "/cart/" + user_id)

        .then(res => res.json())

        .then(data => {

            localStorage.setItem("cart", JSON.stringify(data))

            renderSideCart()


            // ⭐ card qty sync
            data.forEach(item => {

                let card = document.querySelector('.cake-card[data-id="' + item.id + '"]')

                if (card) {

                    card.querySelector(".add-btn").style.display = "none"
                    card.querySelector(".qty-control").style.display = "flex"
                    card.querySelector(".qty").innerText = item.qty

                }

            })

        })

}

loadCart()

