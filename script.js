let cart = JSON.parse(localStorage.getItem("cart")) || [];

let currentOfferCode = null;


const API = "http://192.168.29.76:5000";


function openMenuPage() {
    window.location.href = "menu/menu.html";
}

/* ---------------- PRODUCTS RENDER ---------------- */

function renderProducts() {

    const grid = document.getElementById("shopProductsGrid")

    if (!grid) return

    grid.innerHTML = ""

    products.forEach(product => {

        const card = document.createElement("div")

        card.className = "shop-product-card"

        card.innerHTML = `

<div class="cart-left">

<img src="${item.image}" class="cart-img">

<div class="cart-qty">

<button onclick="decreaseQty(${index})">-</button>

<span>${item.qty}</span>

<button onclick="increaseQty(${index})">+</button>

</div>

</div>

<div class="cart-right">

<span>₹${item.price * item.qty}</span>

<button class="remove-btn" onclick="removeItem(${index})">
<i class="bi bi-trash3"></i>
</button>

</div>

`

        grid.appendChild(card)

    })

}

/* ---------------- ADD TO CART ---------------- */

function addToCart(id) {

    const product = products.find(p => p.id === id)

    const item = cart.find(p => p.id === id)

    if (item) {

        item.qty++

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            img: product.image,
            qty: 1
        })

    }

    localStorage.setItem("cart", JSON.stringify(cart))

    updateCartCount()

    renderCartSidebar()

}

/* ---------------- CART COUNT ---------------- */

function updateCartCount() {

    const count = document.getElementById("cartCount")
    if (!count) return

    const user = JSON.parse(localStorage.getItem("user"))

    // 🔥 LOGIN CHECK
    if (!user) {
        count.innerText = 0
        return
    }

    const cartData = JSON.parse(localStorage.getItem("cart")) || []
    count.innerText = cartData.length
}

/* ---------------- CART SIDEBAR ---------------- */

const cartBtn = document.getElementById("cartBtn")
const cartSidebar = document.getElementById("cartSidebar")
const cartOverlay = document.getElementById("cartOverlay")
const closeCart = document.getElementById("closeCart")

if (cartBtn) {

    cartBtn.onclick = () => {

        renderCartSidebar()

        cartSidebar.classList.add("active")
        cartOverlay.classList.add("active")

    }

}

if (closeCart) {

    closeCart.onclick = () => {

        cartSidebar.classList.remove("active")
        cartOverlay.classList.remove("active")

    }

}

if (cartOverlay) {

    cartOverlay.onclick = () => {

        cartSidebar.classList.remove("active")
        cartOverlay.classList.remove("active")

    }

}

/* ---------------- RENDER CART ---------------- */

function renderCartSidebar() {

    const cartItemsSidebar = document.getElementById("cartItemsSidebar")
    const cartTotalSidebar = document.getElementById("cartTotalSidebar")

    if (!cartItemsSidebar) return

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        cartItemsSidebar.innerHTML = `
        <div style="text-align:center; padding:30px;">
            <h3>Please Login First 🔒</h3>
            <p>Your cart is empty because you are not logged in.</p>
            <a href="www/auth/login.html" class="btn btn-primary">
                Login Now
            </a>
        </div>
    `;

        cartTotalSidebar.innerText = "Total: ₹0";
        return;
    }


    // ✅ EMPTY CART CHECK
    if (cart.length === 0) {
        cartItemsSidebar.innerHTML = `
        <div style="text-align:center; padding:30px;">
            <h3>Your Cart is Empty 🛒</h3>
            <p>Add some delicious cakes & pastries 😋</p>

            <a href="menu/menu.html">
                <button class="btn btn-primary" style="margin-top:15px;">
                    🍰 Menu
                </button>
            </a>
        </div>
    `

        cartTotalSidebar.innerText = "Total: ₹0"
        return
    }

    cartItemsSidebar.innerHTML = ""

    let total = 0

    cart.forEach((item, index) => {

        total += item.price * item.qty

        const div = document.createElement("div")

        div.className = "cart-item"


        div.innerHTML = `
            <div class="cart-product">

                <img src="${item.img}" class="cart-product-img">

                <div class="cart-product-info">
                    <h4>${item.name}</h4>
                    <p class="cart-desc">${item.desc || ""}</p>
                </div>

            </div>

            <div class="cart-controls">
                <button onclick="decreaseQty(${index})">-</button>
                <span>${item.qty}</span>
                <button onclick="increaseQty(${index})">+</button>
            </div>

            <div class="cart-right">
                <span>₹${item.price * item.qty}</span>
                <button class="remove-btn" onclick="removeItem(${index})">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
            `;


        cartItemsSidebar.appendChild(div)

    })

    if (cartTotalSidebar) {

        cartTotalSidebar.innerText = "Total: ₹" + total

    }

}

/* ---------------- CART ACTIONS ---------------- */

function increaseQty(i) {

    cart[i].qty++

    saveCart()

}

function decreaseQty(i) {

    if (cart[i].qty > 1) {

        cart[i].qty--

    } else {

        cart.splice(i, 1)

    }

    saveCart()

}

function removeItem(i) {

    cart.splice(i, 1)

    saveCart()

}

function saveCart() {

    localStorage.setItem("cart", JSON.stringify(cart))

    cart = JSON.parse(localStorage.getItem("cart")) || []

    updateCartCount()

    renderCartSidebar()

}


document.addEventListener("DOMContentLoaded", () => {

    cart = JSON.parse(localStorage.getItem("cart")) || []

    updateCartCount()

    renderCartSidebar()

    renderAccountButton()

    updateLogoBySubscription()

    loadLocationAndUser();



    /* ---------------- PROTECTED BUTTON ---------------- */

    document.querySelectorAll(".protected-btn").forEach(btn => {

        btn.addEventListener("click", function (e) {

            const user = JSON.parse(localStorage.getItem("user"))

            if (!user) {
                e.preventDefault()   // ❌ page open rok diya
                showLoginPopup()     // 🔥 popup show
            }

        })

    })



})


/* ---------------- INIT ---------------- */

renderProducts()

updateCartCount()


const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("data-section") === current) {
            link.classList.add("active");
        }

    });

});






/* ---------------- ACCOUNT BUTTON ---------------- */

function renderAccountButton() {

    const accountArea = document.getElementById("accountArea")
    if (!accountArea) return

    const user = JSON.parse(localStorage.getItem("user"))

    if (user) {
        accountArea.innerHTML = `
        <div class="account-wrapper">
            <div id="accountBtn" class="header-icon-btn account-btn">
                <i class="bi bi-person-circle"></i>
            </div>
        </div>
        `

        // ✅ SIDEBAR OPEN
        const btn = document.getElementById("accountBtn")

        btn.onclick = () => {
            document.getElementById("accountSidebar").classList.add("active")
            document.getElementById("accountOverlay").classList.add("active")

            document.getElementById("accountEmail").innerText = user.email
            document.getElementById("accountName").innerText = user.name || "User"
        }

    } else {
        accountArea.innerHTML = `
            <a href="www/auth/login.html" class="btn btn-secondary">
                Login
            </a>
        `
    }


    const img = document.querySelector(".account-avatar img");

    if (user && img) {
        if (user.avatar) {
            img.src = user.avatar;   // ✅ user specific avatar
        }
    }
}



function logout() {
    localStorage.removeItem("user")
    localStorage.removeItem("cart")   // 🔥 optional
    location.reload()
}



/* ---------------- LOGIN POPUP ---------------- */

function showLoginPopup() {
    document.getElementById("loginPopup").classList.add("show")
}

function closeLoginPopup() {
    document.getElementById("loginPopup").classList.remove("show")
}


/* ================= FINAL ACCOUNT SIDEBAR FIX ================= */

// OPEN SIDEBAR (already working)
document.addEventListener("click", function (e) {

    // 🔓 OPEN
    if (e.target.closest("#accountBtn")) {

        document.getElementById("accountSidebar").classList.add("active")
        document.getElementById("accountOverlay").classList.add("active")

        const user = JSON.parse(localStorage.getItem("user"))
        const img = document.querySelector(".account-avatar img");

        if (user) {
            document.getElementById("accountEmail").innerText = user.email
            document.getElementById("accountName").innerText = user.name || "User"

            // 🔥 FINAL AVATAR FIX
            if (user.avatar && img) {
                img.src = user.avatar;
            }
        }
    }

    // ❌ CLOSE BUTTON
    if (e.target.closest("#closeAccount")) {
        document.getElementById("accountSidebar").classList.remove("active")
        document.getElementById("accountOverlay").classList.remove("active")
    }

    // ❌ OVERLAY CLICK
    if (e.target.id === "accountOverlay") {
        document.getElementById("accountSidebar").classList.remove("active")
        document.getElementById("accountOverlay").classList.remove("active")
    }

})





function openBellavitaPlus() {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "/subscription/subscription.html";
        return;
    }

    fetch(API + "/check-subscription", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: user.email
        })
    })
        .then(res => res.json())
        .then(data => {

            if (data.plan === "monthly" && data.status === "active") {
                window.location.href = "/subscription/monthly.html";
            }
            else if (data.plan === "yearly" && data.status === "active") {
                window.location.href = "/subscription/yearly.html";
            }
            else {
                window.location.href = "/subscription/subscription.html";
            }

        });

}



function checkSubscription() {

    const user = JSON.parse(localStorage.getItem("user"));

    fetch(API + "/check-subscription", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: user.email
        })
    })
        .then(res => res.json())
        .then(data => {

            if (data.plan === "monthly" && data.status === "active") {
                console.log("Monthly User");
            }
            else if (data.plan === "yearly" && data.status === "active") {
                console.log("Yearly User");
            }
            else {
                console.log("Normal User");
            }

        });
}


function updateLogoBySubscription() {

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    fetch(API + "/check-subscription", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: user.email
        })
    })
        .then(res => res.json())
        .then(data => {

            const plusText = document.getElementById("logoPlus");
            const logoMain = document.getElementById("logoMain");

            plusText.classList.remove("monthly", "yearly");

            if (data.plan === "monthly" && data.status === "active") {
                plusText.innerText = "Plus";
                plusText.classList.add("monthly");
                logoMain.classList.add("logo-main-premium");
            }
            else if (data.plan === "yearly" && data.status === "active") {
                plusText.innerText = "Plus VIP";
                plusText.classList.add("yearly");
                logoMain.classList.add("logo-main-premium");
            }
            else {
                plusText.innerText = "";
                logoMain.classList.remove("logo-main-premium");
            }

        });

}



function openOrderHistory() {
    window.location.href = "/order_history/order_history.html";
}


function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: "smooth"
    });

    // Sidebar close
    document.getElementById('accountSidebar').classList.remove('active');
    document.getElementById('accountOverlay').classList.remove('active');
}


function showSection(sectionId) {

    // sab sections hide
    document.querySelectorAll(".page-section").forEach(section => {
        section.style.display = "none";
    });

    // selected section show
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = "block";
    }

    // top pe scroll
    window.scrollTo(0, 0);

    // sidebar close
    document.getElementById('accountSidebar').classList.remove('active');
    document.getElementById('accountOverlay').classList.remove('active');
}

window.onload = function () {
    showSection('home');
};




function openSavedAddress() {
    window.location.href = "/saved_address/saved_address.html";
}




function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const locationText = document.getElementById("locationText");

            locationText.innerText = "Location Detected";
            locationText.classList.add("location-detected");

            localStorage.setItem("userLocation", lat + "," + lon);
        });
    } else {
        alert("Geolocation not supported");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const savedLocation = localStorage.getItem("userLocation");

    if (savedLocation) {
        const locationText = document.getElementById("locationText");
        if (locationText) {
            locationText.innerText = "Location Detected";
            locationText.classList.add("location-detected");
        }
    }
});


function loadLocationAndUser() {

    const savedAddress = JSON.parse(localStorage.getItem("checkoutAddress"));
    const user = JSON.parse(localStorage.getItem("user"));

    const locationText = document.getElementById("locationText");
    const locationName = document.getElementById("locationName");

    if (!locationText || !locationName) return;

    // ADDRESS LINE
    if (savedAddress) {
        locationText.innerText =
            savedAddress.house + ", " +
            savedAddress.address + ", " +
            savedAddress.city;

        locationText.classList.add("location-detected");

        // NAME from address
        locationName.innerText = savedAddress.name;

    } else {
        locationText.innerText = "No Location";
        locationText.classList.remove("location-detected");

        // If no address then show user name
        if (user) {
            locationName.innerText = user.name || "User";
        } else {
            locationName.innerText = "Guest";
        }
    }
}

function openSavedAddress() {
    window.location.href = "/saved_address/saved_address.html";
}


document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector(".hero-category-row");

    if (slider) {
        slider.addEventListener("wheel", (e) => {
            e.preventDefault();
            slider.scrollLeft += e.deltaY * 1.5;
        });
    }
});








function openOfferBottom(title, code) {
    const popup = document.getElementById("offerBottom");
    popup.classList.add("show");

    document.getElementById("offerBottomTitle").innerText = title;
    document.getElementById("offerBottomCode").innerText = code;

    currentOfferCode = code;

    const applied = localStorage.getItem("appliedOffer");

    const applyLayout = document.getElementById("applyOfferLayout");
    const removeLayout = document.getElementById("removeOfferLayout");
    const btn = document.getElementById("applyOfferBtn");

    const popupMain = document.getElementById("offerBottom");

    if (applied === code) {
        applyLayout.style.display = "none";
        removeLayout.style.display = "block";
        btn.innerText = "Remove Offer";
        btn.classList.add("remove-btn-style");

        popupMain.classList.add("remove-mode");
        popupMain.classList.remove("apply-mode");

    } else {
        applyLayout.style.display = "block";
        removeLayout.style.display = "none";
        btn.innerText = "Apply Offer";
        btn.classList.remove("remove-btn-style");

        popupMain.classList.add("apply-mode");
        popupMain.classList.remove("remove-mode");
    }
}

function closeOfferBottom() {
    document.getElementById("offerBottom").classList.remove("show");
}

/* Click outside to close */
document.addEventListener("click", function (e) {
    const popup = document.getElementById("offerBottom");
    if (e.target.classList.contains("offer-bottom")) {
        popup.classList.remove("show");
    }
});



function applyOffer() {

    let applied = localStorage.getItem("appliedOffer");

    if (applied === currentOfferCode) {
        // REMOVE OFFER
        localStorage.removeItem("appliedOffer");
        updateOfferButtons(null);
    } else {
        // APPLY OFFER
        localStorage.setItem("appliedOffer", currentOfferCode);

        const appliedBox = document.getElementById("couponApplied");
        appliedBox.classList.add("show");

        launchConfetti();

        setTimeout(() => {
            appliedBox.classList.remove("show");
        }, 2000);

        updateOfferButtons(currentOfferCode);
    }

    closeOfferBottom();
}


function launchConfetti() {
    for (let i = 0; i < 40; i++) {
        let confetti = document.createElement("div");
        confetti.classList.add("confetti-piece");

        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.background = randomColor();
        confetti.style.animationDuration = (Math.random() * 2 + 1) + "s";

        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

function randomColor() {
    const colors = ["#ff4b2b", "#ff416c", "#ffcc00", "#00c6ff", "#7d5fff", "#2ed573"];
    return colors[Math.floor(Math.random() * colors.length)];
}


/* ===== OFFER BUTTON TEXT UPDATE ===== */

function updateOfferButtons(code) {

    const codeMap = {
        SAVE100: "offer1",
        PASTRY: "offer2",
        SAVE175: "offer3",
        GET30: "offer4"
    };

    // Sabko View karo
    Object.values(codeMap).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.innerText = "View";
            btn.style.background = "";
            btn.style.color = "";
        }
    });

    // Applied wala green
    const appliedBtn = document.getElementById(codeMap[code]);
    if (appliedBtn) {
        appliedBtn.innerText = "Applied";
        appliedBtn.style.background = "#22c55e";

    }

    localStorage.setItem("appliedOffer", code);
}

/* Page load pe applied show */
document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("appliedOffer");
    if (saved) updateOfferButtons(saved);
});


document.getElementById("cartBtn").onclick = function () {
    document.getElementById("cartSidebar").classList.add("active");
    document.getElementById("cartOverlay").classList.add("active");

    // Hide offer bottom when cart opens
    document.getElementById("offerBottom").style.display = "none";
};

document.getElementById("closeCart").onclick = function () {
    document.getElementById("cartSidebar").classList.remove("active");
    document.getElementById("cartOverlay").classList.remove("active");

    // Show offer bottom again
    document.getElementById("offerBottom").style.display = "block";
};



const slider = document.querySelector('.whats-new-slider');

if (slider) {

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => isDown = false);
    slider.addEventListener('mouseup', () => isDown = false);

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.6;
        slider.scrollLeft = scrollLeft - walk;
    });

    slider.addEventListener('wheel', (e) => {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
    });

    setInterval(() => {
        slider.scrollLeft += 320;
    }, 3500);

}


function orderFromWhatsNew(name, price, img, desc = "") {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: Date.now(),
            name: name,
            price: price,
            img: img,
            desc: desc,
            qty: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // Redirect to checkout
    window.location.href = "checkout/checkout.html";
}


let comboScroll;
const comboSlider = document.querySelector(".combo-container");

if (comboSlider) {

    let scrollSpeed = 0.4;
    let animationFrame;

    function autoScroll() {
        comboSlider.scrollLeft += scrollSpeed;

        if (comboSlider.scrollLeft >= 
            comboSlider.scrollWidth - comboSlider.clientWidth) {
            comboSlider.scrollLeft = 0;
        }

        animationFrame = requestAnimationFrame(autoScroll);
    }

    function stopScroll() {
        cancelAnimationFrame(animationFrame);
    }

    comboSlider.addEventListener("mouseenter", stopScroll);
    comboSlider.addEventListener("mouseleave", autoScroll);

    autoScroll();
}


let isDown = false;
let startX;
let scrollLeft;

comboSlider.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - comboSlider.offsetLeft;
    scrollLeft = comboSlider.scrollLeft;
});

comboSlider.addEventListener('mouseleave', () => isDown = false);
comboSlider.addEventListener('mouseup', () => isDown = false);

comboSlider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - comboSlider.offsetLeft;
    const walk = (x - startX) * 1.5;
    comboSlider.scrollLeft = scrollLeft - walk;
});

function scrollBestseller(direction) {
    const slider = document.getElementById("bestsellerSlider");
    slider.scrollBy({
        left: direction * 300,
        behavior: "smooth"
    });
}


const banner = document.querySelector(".custom-cake-premium-banner");

document.addEventListener("mousemove", (e) => {
    let x = (window.innerWidth / 2 - e.pageX) / 40;
    let y = (window.innerHeight / 2 - e.pageY) / 40;

    banner.style.transform = `translate(${x}px, ${y}px)`;
});

