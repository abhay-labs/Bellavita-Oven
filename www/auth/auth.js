let phoneInputInstance = null;

const API = "http://192.168.29.76:5000";


// ================= EMAIL VALIDATION =================
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function showEmailError() {
    const emailError = document.getElementById("emailError");
    if (!emailError) return;

    emailError.style.display = "block";

    setTimeout(() => {
        emailError.style.display = "none";
    }, 10000); // 10 sec
}




function showTempError(el) {
    if (!el) return;

    el.style.display = "block";

    setTimeout(() => {
        el.style.display = "none";
    }, 3000); // ⏱️ 3 sec
}


// ================= SESSION HELPERS =================

function requireAuth() {
    const token = getSession();
    if (!token) {
        window.location.href = "/www/auth/login.html";
    }
}



function saveSession(token) {
    localStorage.setItem("alpha_session", token);
}

function getSession() {
    return localStorage.getItem("alpha_session");
}

function logout() {
    const token = getSession();
    fetch(API + "/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
    })
    localStorage.removeItem("alpha_session");
    window.location.href = "/www/auth/login.html";

}





// ================= DOM READY =================

document.addEventListener("DOMContentLoaded", function () {

    // ========== LOGIN ==========
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.onclick = function () {

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                const allError = document.getElementById("loginAllError");
                if (allError) {
                    allError.style.display = "block";

                    setTimeout(() => {
                        allError.style.display = "none";
                    }, 10000); // 10 sec
                }
                return;

            }
            if (!emailRegex.test(email)) {
                showEmailError();
                return;
            }




            const errorText = document.getElementById("loginError");
            errorText.style.display = "none"; // reset every click

            fetch(API + "/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
                .then(res => res.json())
                .then(res => {
                    if (res.status === "success") {

                        saveSession(res.token);  // already hai

                        // 🔥 YE ADD KARO (MOST IMPORTANT)
                        localStorage.setItem("user", JSON.stringify({
                            email: res.email,
                            name: res.name   // ✅ YE ADD KAR
                        }));

                        window.location.href = "/index.html";
                    } else {
                        errorText.style.display = "block";

                        setTimeout(() => {
                            errorText.style.display = "none";
                        }, 10000); // ⏱️ 10 seconds
                    }

                });

        };
    }

    // ================= PHONE INPUT (FLAG + COUNTRY CODE) =================
    const phoneInput = document.getElementById("phone");

    if (phoneInput) {
        phoneInputInstance = window.intlTelInput(phoneInput, {
            initialCountry: "in",
            separateDialCode: true,
            preferredCountries: ["in", "us", "gb"],
            utilsScript:
                "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
        });
    }


    // ========== REGISTER ==========
    const registerBtn = document.getElementById("registerBtn");

    if (registerBtn) {
        registerBtn.onclick = function () {

            const name = document.getElementById("name").value.trim();

            let phone = "";

            if (phoneInputInstance) {
                if (!phoneInputInstance.isValidNumber()) {
                    alert("Please enter a valid phone number");
                    return;
                }

                // 📞 Full international number (no space)
                const fullNumber = phoneInputInstance.getNumber();
                // e.g. +91936870236

                // 🌍 Get country dial code correctly
                const countryData = phoneInputInstance.getSelectedCountryData();
                const dialCode = "+" + countryData.dialCode; // +91

                // 🔢 Remove country code from full number
                const nationalNumber = fullNumber.replace(dialCode, "");

                // ✅ FINAL FORMAT (CORRECT)
                phone = `${dialCode} ${nationalNumber}`;
            }



            const email = document.getElementById("email").value.trim();
            const dob = document.getElementById("dob").value;
            const password = document.getElementById("password").value.trim();

            if (!name || !phone || !email || !dob || !password) {
                const allError = document.getElementById("registerAllError");
                if (allError) {
                    allError.style.display = "block";

                    setTimeout(() => {
                        allError.style.display = "none";
                    }, 10000); // 10 sec
                }
                return;

            }

            if (!emailRegex.test(email)) {
                showEmailError();
                return;
            }



            // 🔐 password rules (REGISTER): number + special character
            const numberRegex = /[0-9]/;
            const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

            const registerError = document.getElementById("registerError");
            registerError.style.display = "none"; // reset every click

            if (!numberRegex.test(password) || !specialCharRegex.test(password)) {
                registerError.style.display = "block";

                setTimeout(() => {
                    registerError.style.display = "none";
                }, 10000);

                return;
            }



            fetch(API + "/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    phone,
                    email,
                    dob,
                    password
                })
            })
                .then(res => res.json())
                .then(res => {

                    const emailExistsError = document.getElementById("emailExistsError");
                    const phoneExistsError = document.getElementById("phoneExistsError");

                    // reset
                    if (emailExistsError) emailExistsError.style.display = "none";
                    if (phoneExistsError) phoneExistsError.style.display = "none";

                    if (res.status === "success") {

                        window.location.href =
                            "/www/auth/verify_otp.html?email=" + encodeURIComponent(email);

                    }
                    else if (res.msg === "This email already exists") {

                        showTempError(emailExistsError);

                    }
                    else if (res.msg === "This phone number already exists") {

                        showTempError(phoneExistsError);

                    }

                });
        };
    }



});


document.addEventListener("DOMContentLoaded", function () {

    const accountBtn = document.getElementById("AccountBtn");
    const accountMenu = document.getElementById("AccountMenu");
    const profileBtn = document.getElementById("ProfileBtn");
    const logoutBtn = document.getElementById("LogoutBtn");

    if (!accountBtn || !accountMenu) return;

    // 🟢 Account = ONLY dropdown toggle
    accountBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        accountMenu.hidden = !accountMenu.hidden;
    });

    // 🟢 Close dropdown on outside click
    document.addEventListener("click", function () {
        accountMenu.hidden = true;
    });

    if (profileBtn) {
        profileBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            accountMenu.hidden = true;

            // ✅ Proper profile page
            window.location.href = "/www/auth/profile.html";
        });
    }


    // 🔴 Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            logout();
        });
    }

});



// ========== FORGOT PASSWORD ==========
const forgotBtn = document.getElementById("forgotBtn");

if (forgotBtn) {
    forgotBtn.onclick = function () {
        const email = document.getElementById("email").value.trim();

        if (!email) {
            const forgotError = document.getElementById("forgotAllError");

            if (forgotError) {
                forgotError.style.display = "block";

                setTimeout(() => {
                    forgotError.style.display = "none";
                }, 10000); // 10 sec
            }
            return;
        }


        if (!emailRegex.test(email)) {
            showEmailError();
            return;
        }



        fetch(API + "/forgot-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "otp_sent") {
                    window.location.href =
                        "/www/auth/reset_password.html?email=" + encodeURIComponent(email);
                } else {
                    alert(res.msg || "Failed to send OTP");
                }
            });
    };
}


// ========== RESET PASSWORD ==========
const resetBtn = document.getElementById("resetBtn");

if (resetBtn) {
    resetBtn.onclick = function (e) {

        // 🔥 page refresh stop
        if (e) e.preventDefault();

        const otp = document.getElementById("otp").value.trim();
        const newPass = document.getElementById("new_password").value.trim();
        const confirmPass = document.getElementById("confirm_password").value.trim();
        const email = new URLSearchParams(window.location.search).get("email");

        // error elements
        const ruleError = document.getElementById("resetRuleError");
        const matchError = document.getElementById("resetMatchError");

        // reset errors
        if (ruleError) ruleError.style.display = "none";
        if (matchError) matchError.style.display = "none";

        if (!otp || !newPass || !confirmPass || !email) {
            const resetAllError = document.getElementById("resetAllError");

            if (resetAllError) {
                resetAllError.style.display = "block";

                setTimeout(() => {
                    resetAllError.style.display = "none";
                }, 10000);
            }
            return;
        }

        // ❌ password match error
        if (newPass !== confirmPass) {
            if (matchError) {
                matchError.style.display = "block";

                setTimeout(() => {
                    matchError.style.display = "none";
                }, 10000);
            }
            return;
        }

        // 🔐 password rules
        const numberRegex = /[0-9]/;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

        if (!numberRegex.test(newPass) || !specialCharRegex.test(newPass)) {
            if (ruleError) {
                ruleError.style.display = "block";

                setTimeout(() => {
                    ruleError.style.display = "none";
                }, 10000);
            }
            return;
        }

        // ✅ finally reset password
        const successMsg = document.getElementById("resetSuccessMsg");

        fetch(API + "/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                otp,
                password: newPass
            })
        })
            .then(res => res.json())
            .then(res => {

                if (res.status === "success") {

                    if (successMsg) {
                        successMsg.style.display = "block";
                    }

                    // 🔥 redirect always
                    setTimeout(() => {

                        if (successMsg) {
                            successMsg.style.display = "none";
                        }

                        window.location.href = "/www/auth/login.html";

                    }, 1200);

                } else {

                    const otpError = document.getElementById("resetOtpError");

                    if (otpError) {
                        otpError.style.display = "block";

                        setTimeout(() => {
                            otpError.style.display = "none";
                        }, 10000);
                    }

                }

            })
            .catch(err => {
                console.error("Reset password error:", err);
            });

    };
}





// ================= OTP VERIFY =================

// ========== OTP VERIFY ==========
const verifyBtn = document.getElementById("verifyBtn");

if (verifyBtn) {
    verifyBtn.onclick = function () {

        const otp = document.getElementById("otp").value.trim();
        const email = new URLSearchParams(window.location.search).get("email");

        if (!otp || !email) {
            alert("OTP required");
            return;
        }

        const successMsg = document.getElementById("verifySuccessMsg");

        // reset
        if (successMsg) successMsg.style.display = "none";

        fetch(API + "/verify-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                otp
            })
        })

            .then(res => res.json())
            .then(res => {

                if (res.status === "success") {

                    window.location.href = "/www/auth/login.html";

                } else {

                    const otpError = document.getElementById("otpError");

                    if (otpError) {
                        otpError.style.display = "block";

                        setTimeout(() => {
                            otpError.style.display = "none";
                        }, 10000);
                    }

                }

            });




    };
}

// ================= RESEND OTP TIMER =================

let resendTime = 30;
let resendInterval = null;

function startResendTimer() {
    const timerSpan = document.getElementById("timer");
    const resendText = document.getElementById("resendText");

    // 🔥 dono buttons support
    const resendBtn =
        document.getElementById("resendBtn") ||
        document.getElementById("resendForgotBtn");

    if (!timerSpan || !resendBtn || !resendText) return;

    resendBtn.disabled = true;
    let time = 30;
    timerSpan.innerText = time;
    resendText.style.display = "block";

    const interval = setInterval(() => {
        time--;
        timerSpan.innerText = time;

        if (time <= 0) {
            clearInterval(interval);
            resendText.style.display = "none";
            resendBtn.disabled = false;
        }
    }, 1000);
}


// ================= RESEND OTP CLICK =================

const resendBtn = document.getElementById("resendBtn");

if (resendBtn) {
    resendBtn.onclick = function () {
        const email = new URLSearchParams(window.location.search).get("email");

        if (!email) {
            alert("Email missing");
            return;
        }

        const resendMsg = document.getElementById("verifyResendMsg");

        // reset old
        if (resendMsg) resendMsg.style.display = "none";

        fetch(API + "/resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "otp_resent") {

                    if (resendMsg) {
                        resendMsg.style.display = "block";

                        // ⏱️ 10 sec baad hide
                        setTimeout(() => {
                            resendMsg.style.display = "none";
                        }, 10000);
                    }

                    startResendTimer();

                } else {
                    alert("Failed to resend OTP");
                }
            });

    };
}


// ========== RESEND OTP (FORGOT PASSWORD) ==========
const resendForgotBtn = document.getElementById("resendForgotBtn");

if (resendForgotBtn) {
    resendForgotBtn.onclick = function () {
        const email = new URLSearchParams(window.location.search).get("email");

        if (!email) {
            alert("Email missing");
            return;
        }

        const successMsg = document.getElementById("otpSuccessMsg");

        // reset old message
        if (successMsg) successMsg.style.display = "none";

        // 🔥 forgot password wala OTP resend
        fetch(API + "/forgot-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "otp_sent") {

                    if (successMsg) {
                        successMsg.style.display = "block";

                        setTimeout(() => {
                            successMsg.style.display = "none";
                        }, 10000);
                    }

                    startResendTimer();

                } else {
                    alert("Failed to resend OTP");
                }
            });

    };
}



const GOOGLE_CLIENT_ID =
    "472328482832-9uqov89uvsgd1iektpicgc2e2non9cq7.apps.googleusercontent.com";

function googleRedirectLogin() {
    const redirectUri = "http://localhost:8000/auth/google_callback.html";

    const url =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        "?response_type=token" +
        "&client_id=" + GOOGLE_CLIENT_ID +
        "&redirect_uri=" + encodeURIComponent(redirectUri) +
        "&scope=" + encodeURIComponent("profile email");

    window.location.href = url;
}

document.addEventListener("DOMContentLoaded", () => {
    const googleBtn = document.getElementById("googleBtn");
    if (googleBtn) {
        googleBtn.addEventListener("click", googleRedirectLogin);
    }
});


document.addEventListener("DOMContentLoaded", function () {
    if (
        document.getElementById("resendBtn") ||
        document.getElementById("resendForgotBtn")
    ) {
        startResendTimer();
    }
});
