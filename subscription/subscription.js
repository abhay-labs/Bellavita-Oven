
const API = "http://192.168.29.76:5000";




document.querySelectorAll(".buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        alert("Payment Integration Coming Soon with Razorpay");
    });
});


function goBack() {
    window.location.href = "../index.html";
}


function scrollToPricing() {
    document.getElementById("pricing").scrollIntoView({
        behavior: "smooth"
    });
}


function buyMonthly() {

    const user = JSON.parse(localStorage.getItem("user"));

    fetch(API + "/subscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: user.email,
            plan: "monthly"
        })
    })
        .then(res => res.json())
        .then(data => {
            alert("Monthly Subscription Activated");
            window.location.href = "monthly.html";
        });

}

function buyYearly() {

    const user = JSON.parse(localStorage.getItem("user"));

    fetch(API + "/subscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: user.email,
            plan: "yearly"
        })
    })
        .then(res => res.json())
        .then(data => {
            alert("Yearly Subscription Activated");
            window.location.href = "yearly.html";
        });

}