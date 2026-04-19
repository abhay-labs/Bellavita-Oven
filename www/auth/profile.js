let avatarBase64 = null;

const API = "http://192.168.29.76:5000";


document.addEventListener("DOMContentLoaded", () => {

    const token = getSession();
    if (!token) return;

    /* ========= ELEMENTS ========= */
    const el = {
        name: document.getElementById("name"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
        dob: document.getElementById("dob"),
        country: document.getElementById("country"),
        address: document.getElementById("address"),
        bio: document.getElementById("bio"),
        phoneHint: document.getElementById("phoneHint"),
        avatar: document.getElementById("profilePreview"),
        avatarInput: document.getElementById("profilePicInput"),
        form: document.getElementById("profileForm"),
        saveBtn: document.querySelector(".save-btn"),
        editBtn: document.getElementById("editBtn")
    };

    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }


    /* ========= PHONE INPUT ========= */
    const iti = window.intlTelInput(el.phone, {
        initialCountry: "in",
        separateDialCode: true,
        preferredCountries: ["in", "us", "gb"],
        utilsScript:
            "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.0/build/js/utils.js",
    });

    /* ========= ALL EDITABLE FIELDS ========= */
    const editableFields = [
        el.name,
        el.phone,
        el.dob,
        el.country,
        el.address,
        el.bio
    ];



    function showToast(msg) {

        const toast = document.getElementById("alphaToast");
        const text = document.getElementById("toastMsg");

        text.innerText = msg;

        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }


    function updateFieldColors() {

        editableFields.forEach(field => {

            if (!field.value || field.value.trim() === "") {
                field.classList.remove("filled");
                field.classList.add("empty");
            } else {
                field.classList.remove("empty");
                field.classList.add("filled");
            }

        });
    }



    /* ========= EDIT MODE CONTROLLER ========= */
    function setEditMode(isEdit) {
        editableFields.forEach(field => {
            field.disabled = !isEdit;
        });

        el.saveBtn.style.display = isEdit ? "inline-block" : "none";
        el.editBtn.style.display = isEdit ? "none" : "inline-block";
    }

    /* 🔒 LOCK EVERYTHING IMMEDIATELY */
    setEditMode(false);

    /* ========= LOAD PROFILE ========= */
    fetch(API + "/get-profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
    })
        .then(res => res.json())
        .then(res => {
            if (res.status !== "success") return;

            const p = res.profile || {};

            const user = JSON.parse(localStorage.getItem("user"));

            el.name.value = p.name || "";
            el.email.value = p.email || user.email || "";
            el.phone.value = p.phone || "";
            el.dob.value = p.dob || "";
            el.country.value = p.country || "";
            el.address.value = p.address || "";
            el.bio.value = p.bio || "";

            if (p.avatar) {
                el.avatar.src = p.avatar;
                avatarBase64 = p.avatar;
            }

            if (p.phone) {
                el.phoneHint.innerText = "Phone number locked for security";
            } else {
                el.phoneHint.innerText = "You can add your phone number";
            }

            setEditMode(false);
            updateFieldColors();
        });


    editableFields.forEach(field => {
        field.addEventListener("input", updateFieldColors);
    });


    /* ========= EDIT BUTTON ========= */
    el.editBtn.addEventListener("click", () => {
        setEditMode(true);
    });

    /* ========= AVATAR CHANGE ========= */
    el.avatarInput.addEventListener("change", () => {
        const file = el.avatarInput.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            avatarBase64 = reader.result;   // base64 save
            el.avatar.src = reader.result; // preview

            // 🔥 IMPORTANT: photo change = edit mode ON
            setEditMode(true);
        };
        reader.readAsDataURL(file);
    });


    /* ========= SAVE PROFILE ========= */
    el.form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!el.name.value.trim()) {
            alert("Name cannot be empty");
            el.name.focus();
            return;
        }

        const updatedProfile = {
            name: el.name.value.trim(),
            phone: iti.getNumber(),
            dob: el.dob.value,
            country: el.country.value,
            address: el.address.value,
            bio: el.bio.value,
            avatar: avatarBase64          // ✅ FIXED (comma added)
        };

        el.saveBtn.innerText = "Saving...";

        fetch(API + "/update-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token,
                ...updatedProfile
            })
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "success") {
                    saveProfile();  // 🔥 YE ADD KAR

                    // 🔥 AVATAR SAVE IN LOCALSTORAGE
                    if (avatarBase64) {
                        localStorage.setItem("profileAvatar", avatarBase64);
                    }

                    el.saveBtn.innerHTML = `<i class="bi bi-save"></i> Save Changes`;
                    setEditMode(false);
                    showToast("Profile updated successfully 🚀");
                } else {
                    showToast("Failed to save profile ❌");
                }
            });
    });

});



function saveProfile() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    let user = JSON.parse(localStorage.getItem("user")) || {};

    user.name = name;   // 🔥 MOST IMPORTANT
    user.email = email;
    user.phone = phone;

    // 🔥 ADD THIS
    if (avatarBase64) {
        user.avatar = avatarBase64;
    }

    localStorage.setItem("user", JSON.stringify(user));

    console.log("Saved user:", user); // debug
}