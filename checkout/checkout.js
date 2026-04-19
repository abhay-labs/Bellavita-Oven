let cart = JSON.parse(localStorage.getItem("cart")) || []

const orderItems = document.getElementById("orderItems")

const subtotalEl = document.getElementById("subtotal")

const totalEl = document.getElementById("total")

const API = "http://192.168.29.76:5000";


let subtotal = 0
let discount = 0
let deliveryCharge = 40

let addressType = "Home"

let appliedCoupon = ""

let selectedPayment = ""

cart.forEach(item => {

    const div = document.createElement("div")

    div.className = "order-item"

    div.innerHTML = `
        <div class="order-left">
            <img src="${item.img}" class="order-img">

            <div class="order-info">
                <h4>${item.name}</h4>
                <p class="order-desc">${item.desc || ""}</p>
            </div>
        </div>

        <div class="order-qty">
            <button onclick="decreaseQty(${cart.indexOf(item)})">-</button>
            <span>${item.qty}</span>
            <button onclick="increaseQty(${cart.indexOf(item)})">+</button>
        </div>

        <span class="order-price">₹${item.price * item.qty}</span>
        `;
    orderItems.appendChild(div)

    subtotal += item.price * item.qty

})

updateTotal()


// ================= LOAD APPLIED OFFER FROM HOME PAGE =================

// ================= LOAD APPLIED OFFER FROM HOME PAGE =================

const offerCode = localStorage.getItem("appliedOffer");

if (offerCode) {

    appliedCoupon = offerCode;

    if (offerCode === "SAVE100") {

        if (subtotal >= 499) {
            discount = 100;
        } else {
            appliedCoupon = "";
            discount = 0;
            showCouponMsg("Order above ₹499 required for SAVE100", "red");
        }

    }

    else if (offerCode === "SAVE175") {

        if (subtotal >= 999) {
            discount = 175;
        } else {
            appliedCoupon = "";
            discount = 0;
            showCouponMsg("Order above ₹999 required for SAVE175", "red");
        }

    }

    else if (offerCode === "GET30") {

        if (subtotal >= 199) {
            discount = 30;
        } else {
            appliedCoupon = "";
            discount = 0;
            showCouponMsg("Order above ₹199 required for GET30", "red");
        }

    }

    else if (offerCode === "PASTRY") {

        if (subtotal >= 799) {
            discount = 50;
        } else {
            appliedCoupon = "";
            discount = 0;
            showCouponMsg("Order above ₹799 required for Free Pastry", "red");
        }

    }

    updateTotal();
}



const placeOrderBtn = document.querySelector(".place-order")

if (placeOrderBtn) {
    placeOrderBtn.onclick = async () => {

        // CART EMPTY CHECK
        if (!cart || cart.length === 0) {
            showCartModal();
            return
        }


        if (!validateAddress()) {
            return;
        }

        const orderId = "BV" + Date.now()

        const user = JSON.parse(localStorage.getItem("user"))
        const email = user ? user.email : null

        const paymentMethod = localStorage.getItem("paymentMethod") || "COD"

        const fullName = document.getElementById("fullname")?.value || ""
        const phone = document.getElementById("phone")?.value || ""
        const altPhone = document.getElementById("altphone")?.value || ""
        const houseNo = document.getElementById("house_no")?.value || ""
        const address = document.getElementById("address")?.value || ""
        const landmark = document.getElementById("landmark")?.value || ""
        const city = document.getElementById("city")?.value || ""
        const state = document.getElementById("state")?.value || ""
        const pincode = document.getElementById("pincode")?.value || ""


        // ADDRESS VALIDATION
        if (!fullName || !phone || !houseNo || !address || !landmark || !city || !state || !pincode) {
            showPopup("Please fill all address details")
            return
        }

        // Phone validation
        if (phone.length < 10) {
            showPopup("Enter valid phone number")
            return
        }

        // Pincode validation
        if (pincode.length < 6) {
            showPopup("Enter valid pincode")
            return
        }


        const orderData = {
            order_id: orderId,
            user_email: email,
            full_name: fullName,
            phone: phone,
            alt_phone: altPhone,
            house_no: houseNo,
            street: address,
            landmark: landmark,
            city: city,
            state: state,
            pincode: pincode,
            address_type: addressType,
            coupon_code: appliedCoupon,
            items: cart,
            total_amount: subtotal + deliveryCharge - discount,
            payment_method: paymentMethod
        }

        const res = await fetch(API + "/place-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        })

        const data = await res.json()

        if (data.status === "success") {

            localStorage.setItem("orderId", orderId)
            localStorage.setItem("paymentMethod", paymentMethod)
            localStorage.setItem("orderAmount", orderData.total_amount)
            localStorage.setItem("orderDate", new Date().toLocaleString())
            localStorage.removeItem("checkoutAddress");


            // ================= SAVE ORDER HISTORY =================
            let orders = JSON.parse(localStorage.getItem("orders")) || [];

            let newOrder = {
                id: orderId,
                date: new Date().toLocaleString(),
                items: JSON.parse(JSON.stringify(cart)),
                total: orderData.total_amount,
                status: "Preparing",
                payment: paymentMethod,
                address: fullName + ", " + city
            };

            orders.push(newOrder);
            localStorage.setItem("orders", JSON.stringify(orders));
            // ======================================================

            localStorage.removeItem("cart")

            window.location.href = "../order_confirm/order-confirm.html"
        } else {
            alert("Order failed")
        }
    }
}

// address type toggle

document.querySelectorAll(".type-btn").forEach(btn => {

    btn.onclick = () => {

        document.querySelectorAll(".type-btn")
            .forEach(b => b.classList.remove("active"))

        btn.classList.add("active")

    }

})


const locationBtn = document.getElementById("detectLocation")

locationBtn.onclick = () => {

    if (!navigator.geolocation) {

        alert("Geolocation not supported")

        return

    }

    navigator.geolocation.getCurrentPosition(getAddress, errorLocation)

}



function showPopup(msg) {
    const popup = document.createElement("div")
    popup.innerText = msg
    popup.style.position = "fixed"
    popup.style.bottom = "20px"
    popup.style.left = "50%"
    popup.style.transform = "translateX(-50%)"
    popup.style.background = "#ff4d6d"
    popup.style.color = "white"
    popup.style.padding = "12px 20px"
    popup.style.borderRadius = "8px"
    popup.style.zIndex = "9999"

    document.body.appendChild(popup)

    setTimeout(() => popup.remove(), 2000)
}


function getAddress(position) {

    const lat = position.coords.latitude
    const lon = position.coords.longitude


    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)

        .then(res => res.json())

        .then(data => {

            const address = data.address

            document.getElementById("address").value =
                (data.display_name || "")

            document.getElementById("city").value =
                (address.city || address.town || address.village || "")

            document.getElementById("state").value =
                (address.state || "")

            document.getElementById("pincode").value =
                (address.postcode || "")

        })

}


function errorLocation() {

    alert("Location access denied")

}


function increaseQty(i) {

    cart[i].qty++

    localStorage.setItem("cart", JSON.stringify(cart))

    location.reload()

}

function decreaseQty(i) {

    if (cart[i].qty > 1) {

        cart[i].qty--

    } else {

        cart.splice(i, 1)

    }

    localStorage.setItem("cart", JSON.stringify(cart))

    location.reload()

}


function updateTotal() {

    subtotalEl.innerText = "₹" + subtotal

    const finalTotal = subtotal + deliveryCharge - discount

    totalEl.innerText = "₹" + finalTotal

    const discountRow = document.getElementById("discountRow")
    const discountText = document.getElementById("discountText")

    if (discount > 0 || deliveryCharge === 0) {

        discountRow.style.display = "flex"

        if (deliveryCharge === 0) {
            discountText.innerText = `🎟️ ${appliedCoupon} applied • Free Delivery`
        } else {
            discountText.innerText = `🎟️ ${appliedCoupon} applied • You saved ₹${Math.round(discount)}`
        }

    } else {
        discountRow.style.display = "none"
    }
}


const couponBtn = document.getElementById("applyCouponBtn")
const couponInput = document.getElementById("couponInput")
const couponMsg = document.getElementById("couponMsg")

if (couponBtn) {
    couponBtn.onclick = () => {

        const code = couponInput.value.trim().toUpperCase()

        if (!code) {
            showCouponMsg("⚠️ Please enter a coupon code", "red")
            return
        }

        // 🔥 SAME function use karo (duplicate logic hatao)
        applyCoupon(code)

        couponInput.value = ""
    }
}



function showCouponMsg(message, type) {

    couponMsg.innerText = message

    if (type === "green") {
        couponMsg.style.color = "#16a34a"   // nice green
    } else {
        couponMsg.style.color = "#dc2626"   // nice red
    }

    couponMsg.style.opacity = "1"

    // ⏳ 2 second baad hide
    setTimeout(() => {
        couponMsg.style.opacity = "0"
    }, 2000)
}



document.querySelectorAll(".apply-btn").forEach(btn => {

    btn.onclick = () => {

        const code = btn.getAttribute("data-code")

        applyCoupon(code)

        // modal close
        const modal = bootstrap.Modal.getInstance(document.getElementById('couponModal'))
        modal.hide()
    }

})


function applyCoupon(code) {

    code = code.toUpperCase()

    discount = 0
    deliveryCharge = 40   // reset every time

    if (code === "SAVE10") {

        appliedCoupon = code

        discount = Math.min(subtotal * 0.1, 100) // max ₹100
        showCouponMsg("🎉 10% OFF (Max ₹100)", "green")

    }

    else if (code === "FLAT50") {

        if (subtotal >= 300) {

            appliedCoupon = code

            discount = 50
            showCouponMsg("🎉 ₹50 OFF applied", "green")
        } else {
            appliedCoupon = ""   // 🔥 IMPORTANT
            showCouponMsg("⚠️ Minimum order ₹300 required", "red")
            return
        }

    }

    else if (code === "WELCOME20") {

        appliedCoupon = code

        discount = Math.min(subtotal * 0.2, 150)
        showCouponMsg("🎉 20% OFF for new users (Max ₹150)", "green")

    }

    else if (code === "BIG100") {


        if (subtotal >= 999) {

            appliedCoupon = code

            discount = 100
            showCouponMsg("🎉 ₹100 OFF unlocked", "green")
        } else {
            appliedCoupon = ""   // 🔥 IMPORTANT
            showCouponMsg("⚠️ Order above ₹999 required", "red")
            return
        }

    }

    else if (code === "FREESHIP") {

        appliedCoupon = code

        deliveryCharge = 0
        showCouponMsg("🚚 Free Delivery Applied", "green")

    }

    else if (code === "SWEET15") {

        appliedCoupon = code

        discount = subtotal * 0.15
        showCouponMsg("🍰 15% OFF on sweets", "green")

    }

    else if (code === "COMBO30") {

        if (subtotal >= 200) {

            appliedCoupon = code

            discount = 30
            showCouponMsg("🎁 ₹30 OFF applied", "green")
        } else {
            appliedCoupon = ""   // 🔥 IMPORTANT
            showCouponMsg("⚠️ Minimum ₹200 required", "red")
            return
        }

    }

    else if (code === "MEGADEAL") {

        appliedCoupon = code

        discount = Math.min(subtotal * 0.25, 200)
        showCouponMsg("🔥 25% OFF (Max ₹200)", "green")

    }

    else if (code === "CAKE50") {

        if (subtotal >= 500) {

            appliedCoupon = code

            discount = 50
            showCouponMsg("🎂 ₹50 OFF on cakes", "green")
        } else {
            appliedCoupon = ""   // 🔥 IMPORTANT
            showCouponMsg("⚠️ Minimum ₹500 required", "red")
            return
        }

    }

    else if (code === "PARTY20") {

        if (subtotal >= 800) {

            appliedCoupon = code

            discount = subtotal * 0.2
            showCouponMsg("🎉 Party Offer! 20% OFF", "green")
        } else {
            appliedCoupon = ""   // 🔥 IMPORTANT
            showCouponMsg("⚠️ Minimum ₹800 required", "red")
            return
        }

    }

    else {

        appliedCoupon = ""
        discount = 0
        deliveryCharge = 40

        showCouponMsg("❌ Invalid Coupon Code", "red")
        return
    }

    updateTotal()
}



const removeBtn = document.getElementById("removeCouponBtn")

removeBtn.onclick = () => {

    appliedCoupon = ""
    discount = 0
    deliveryCharge = 40

    localStorage.removeItem("appliedOffer");

    showCouponMsg("❌ Coupon removed", "red")

    updateTotal()
}



const paymentOptions = document.querySelectorAll(".payment-option")

paymentOptions.forEach(option => {

    option.onclick = () => {

        selectedPayment = option.getAttribute("data-method")

        // save method
        if (selectedPayment === "upi") {
            localStorage.setItem("paymentMethod", "UPI")
        }
        else if (selectedPayment === "card") {
            localStorage.setItem("paymentMethod", "CARD")
        }
        else {
            localStorage.setItem("paymentMethod", "COD")
        }

        // UI active
        paymentOptions.forEach(o => o.classList.remove("active"))
        option.classList.add("active")

        // 🔥 ADD THIS PART
        const paymentDetails = document.getElementById("paymentDetails")

        if (selectedPayment === "cod") {
            paymentDetails.innerHTML = `
                <div style="
                    background: #ecfdf5;
                    color: #16a34a;
                    padding: 12px;
                    border-radius: 10px;
                    font-weight: 500;
                    margin-top: 10px;
                ">
                    💵 Pay at your doorstep
                </div>
            `
        } else {
            paymentDetails.innerHTML = "" // clear
        }


    }

})

// saved payment highlight
const savedMethod = localStorage.getItem("paymentMethod")

if (savedMethod === "UPI") {
    selectedPayment = "upi"
}
else if (savedMethod === "CARD") {
    selectedPayment = "card"
}
else {
    selectedPayment = "cod"
}


if (selectedPayment === "cod") {
    document.getElementById("paymentDetails").innerHTML = `
        <div style="
            background: #ecfdf5;
            color: #16a34a;
            padding: 12px;
            border-radius: 10px;
            font-weight: 500;
            margin-top: 10px;
        ">
            💵 Pay at your doorstep
        </div>
    `
}


paymentOptions.forEach(option => {

    if (option.getAttribute("data-method") === selectedPayment) {
        option.classList.add("active")
    } else {
        option.classList.remove("active")
    }

})





function saveUPI() {

    const upi = document.getElementById("upiModalInput").value

    if (!upi.includes("@")) {
        alert("❌ Invalid UPI")
        return
    }

    localStorage.setItem("paymentMethod", "UPI")
    localStorage.setItem("upiId", upi)

    alert("✅ UPI Saved")

    bootstrap.Modal.getInstance(document.getElementById("upiModal")).hide()
}


document.getElementById("upiModal").addEventListener("shown.bs.modal", () => {
    const savedUpi = localStorage.getItem("upiId")
    if (savedUpi) {
        document.getElementById("upiModalInput").value = savedUpi
    }
})


document.querySelectorAll(".type-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".type-btn")
            .forEach(b => b.classList.remove("active"))

        btn.classList.add("active")
        addressType = btn.innerText.trim()
    }
})

function saveCard() {

    const card = document.getElementById("cardModalNumber").value

    if (card.length < 12) {
        alert("❌ Invalid Card")
        return
    }

    localStorage.setItem("paymentMethod", "CARD")
    localStorage.setItem("cardNumber", card)

    alert("✅ Card Saved")

    bootstrap.Modal.getInstance(document.getElementById("cardModal")).hide()
}




function validateAddress() {

    let valid = true;

    function setError(id) {
        const el = document.getElementById(id);
        el.innerText = "Required";

        // 3 second baad error hata do
        setTimeout(() => {
            el.innerText = "";
        }, 3000);
    }

    const fullName = document.getElementById("fullname").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const houseNo = document.getElementById("house_no").value.trim();
    const address = document.getElementById("address").value.trim();
    const landmark = document.getElementById("landmark").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const pincode = document.getElementById("pincode").value.trim();

    if (!fullName) { setError("fullnameError"); valid = false; }
    if (!phone) { setError("phoneError"); valid = false; }
    if (!houseNo) { setError("houseError"); valid = false; }
    if (!address) { setError("addressError"); valid = false; }
    if (!landmark) { setError("landmarkError"); valid = false; }
    if (!city) { setError("cityError"); valid = false; }
    if (!state) { setError("stateError"); valid = false; }
    if (!pincode) { setError("pincodeError"); valid = false; }

    return valid;
}


// SAVE ADDRESS
function saveAddress() {
    const addressData = {
        fullname: document.getElementById("fullname")?.value || "",
        phone: document.getElementById("phone")?.value || "",
        house_no: document.getElementById("house_no")?.value || "",
        address: document.getElementById("address")?.value || "",
        landmark: document.getElementById("landmark")?.value || "",
        city: document.getElementById("city")?.value || "",
        state: document.getElementById("state")?.value || "",
        pincode: document.getElementById("pincode")?.value || ""
    };

    localStorage.setItem("checkoutAddress", JSON.stringify(addressData));
}


// AUTO SAVE ON INPUT
document.querySelectorAll("#fullname, #phone, #house_no, #address, #landmark, #city, #state, #pincode")
    .forEach(input => {
        input.addEventListener("input", saveAddress);
    });


// LOAD SAVED ADDRESS
function loadAddress() {
    const saved = JSON.parse(localStorage.getItem("checkoutAddress"));
    if (!saved) return;

    document.getElementById("fullname").value = saved.name || "";
    document.getElementById("phone").value = saved.phone || "";
    document.getElementById("altphone").value = saved.altPhone || "";
    document.getElementById("house_no").value = saved.house || "";
    document.getElementById("address").value = saved.address || "";
    document.getElementById("landmark").value = saved.landmark || "";
    document.getElementById("city").value = saved.city || "";
    document.getElementById("state").value = saved.state || "";
    document.getElementById("pincode").value = saved.pincode || "";

    // Address type select
    document.querySelectorAll(".type-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.innerText.trim() === saved.type) {
            btn.classList.add("active");
            addressType = saved.type;
        }
    });

    lockAddressFields(true);
}

// CALL FUNCTION
loadAddress();


function showCartModal() {
    document.getElementById("cartEmptyModal").style.display = "block";
}

// CLOSE MODAL IF CLICK OUTSIDE
window.onclick = function(event) {
    const modal = document.getElementById("cartEmptyModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

function closeCartModal() {
    document.getElementById("cartEmptyModal").style.display = "none";
}

function goToMenu() {
    window.location.href = "../menu/menu.html"; // apna menu path dalna
}


function lockAddressFields(lock = true) {
    const fields = [
        "fullname",
        "phone",
        "altphone",
        "house_no",
        "address",
        "landmark",
        "city",
        "state",
        "pincode"
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = lock;
    });
}

const editBtn = document.getElementById("editAddressBtn");
let editing = false;

if (editBtn) {
    editBtn.onclick = () => {
        editing = !editing;

        if (editing) {
            lockAddressFields(false);
            editBtn.innerHTML = '<i class="bi bi-check"></i> Save';
        } else {
            lockAddressFields(true);
            editBtn.innerHTML = '<i class="bi bi-pencil"></i> Edit';
        }
    };
}