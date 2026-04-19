

let addresses = JSON.parse(localStorage.getItem("addresses")) || [];



const API = "http://192.168.29.76:5000";




function getUserEmail() {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? user.email : null;
}


function autoHideError(inputId, errorId) {
    setTimeout(() => {
        document.getElementById(errorId).innerText = "";
        document.getElementById(inputId).classList.remove("input-error");
    }, 3000);
}



/* RENDER ADDRESSES */
function renderAddresses() {
    const list = document.getElementById("addressList");
    list.innerHTML = "";

    if (addresses.length === 0) {
        list.innerHTML = "<h3>No Saved Address Yet</h3>";
        return;
    }

    addresses.forEach((addr, index) => {

        const card = document.createElement("div");
        card.className = "address-card";
        card.onclick = () => selectAddress(index);

        if (addr.selected) {
            card.classList.add("selected-address");
        }

        card.innerHTML = `
            <div class="address-top">
                <input type="radio" name="selectAddress"
                    ${addr.selected ? "checked" : ""}
                    onclick="event.stopPropagation(); selectAddress(${index})">

                <span class="address-type ${addr.type.toLowerCase()}">
                    ${addr.type}
                </span>
            </div>

            <p><strong>Name:</strong> ${addr.name}</p>

            <p><strong>Phone:</strong> ${addr.phone}</p>

            ${addr.altPhone ? `<p><strong>Alt Phone:</strong> ${addr.altPhone}</p>` : ""}

            <p><strong>Address:</strong> ${addr.house}, ${addr.address}</p>

            <p><strong>Landmark:</strong> ${addr.landmark}</p>

            <p><strong>City:</strong> ${addr.city}</p>

            <p><strong>State:</strong> ${addr.state}</p>

            <p><strong>Pincode:</strong> ${addr.pincode}</p>

            <div class="address-actions">
                <button class="edit-btn" onclick="editAddress(${index})">
                    <i class="bi bi-pencil"></i> Edit
                </button>

                <button class="delete-btn" onclick="deleteAddress(${index})">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        `;

        list.appendChild(card);
    });

    localStorage.setItem("addresses", JSON.stringify(addresses));
}

/* ADD ADDRESS */
function addAddress() {

    let valid = true;

    // Clear errors
    document.querySelectorAll(".error").forEach(e => e.innerText = "");
    document.querySelectorAll("input").forEach(i => i.classList.remove("input-error"));

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const altPhone = document.getElementById("altPhone").value.trim();
    const house = document.getElementById("house").value.trim();
    const address = document.getElementById("address").value.trim();
    const landmark = document.getElementById("landmark").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const type = document.getElementById("type").value;

    // Required checks
    if (!name) {
        document.getElementById("nameError").innerText = "Required";
        document.getElementById("name").classList.add("input-error");
        autoHideError("name", "nameError");
        valid = false;
    }

    if (!phone) {
        document.getElementById("phoneError").innerText = "Required";
        document.getElementById("phone").classList.add("input-error");
        autoHideError("phone", "phoneError")
        valid = false;
    }

    if (!house) {
        document.getElementById("houseError").innerText = "Required";
        document.getElementById("house").classList.add("input-error");
        autoHideError("house", "houseError")
        valid = false;
    }

    if (!address) {
        document.getElementById("addressError").innerText = "Required";
        document.getElementById("address").classList.add("input-error");
        autoHideError("address", "addressError")
        valid = false;
    }

    if (!landmark) {
        document.getElementById("landmarkError").innerText = "Required";
        document.getElementById("landmark").classList.add("input-error");
        autoHideError("landmark", "landmarkError")
        valid = false;
    }

    if (!city) {
        document.getElementById("cityError").innerText = "Required";
        document.getElementById("city").classList.add("input-error");
        autoHideError("city", "cityError")
        valid = false;
    }

    if (!state) {
        document.getElementById("stateError").innerText = "Required";
        document.getElementById("state").classList.add("input-error");
        autoHideError("state", "stateError")
        valid = false;
    }

    if (!pincode) {
        document.getElementById("pincodeError").innerText = "Required";
        document.getElementById("pincode").classList.add("input-error");
        autoHideError("pincode", "pincodeError")
        valid = false;
    }

    // Phone validation
    if (phone && phone.length !== 10) {
        document.getElementById("phoneError").innerText = "Enter valid 10 digit number";
        document.getElementById("phone").classList.add("input-error");
        autoHideError("phone", "phoneError");
        valid = false;
    }

    // Pincode validation
    if (pincode && pincode.length !== 6) {
        document.getElementById("pincodeError").innerText = "Invalid pincode";
        document.getElementById("pincode").classList.add("input-error");
        autoHideError("pincode", "pincodeError")
        valid = false;
    }

    if (!valid) return;

    addresses.forEach(addr => addr.selected = false);

    const newAddress = {
        name,
        phone,
        altPhone,
        house,
        address,
        landmark,
        city,
        state,
        pincode,
        type,
        selected: true
    };

    addresses.unshift(newAddress);
    // 👉 SAVE TO DATABASE
    saveAddressToDatabase(newAddress);

    localStorage.setItem("checkoutAddress", JSON.stringify(newAddress));
    localStorage.setItem("addresses", JSON.stringify(addresses));

    renderAddresses();

    // Clear form
    document.querySelectorAll(".address-form-grid input").forEach(input => input.value = "");
}

/* DELETE ADDRESS */
function deleteAddress(i) {
    addresses.splice(i, 1);

    if (addresses.length > 0) {
        addresses[0].selected = true;
    }

    localStorage.setItem("addresses", JSON.stringify(addresses));
    renderAddresses();
}

/* EDIT ADDRESS */
function editAddress(i) {
    const addr = addresses[i];

    document.getElementById("name").value = addr.name;
    document.getElementById("phone").value = addr.phone;
    document.querySelectorAll(".address-form-grid input")[2].value = addr.altPhone;
    document.querySelectorAll(".address-form-grid input")[3].value = addr.house;
    document.getElementById("address").value = addr.address;
    document.querySelectorAll(".address-form-grid input")[5].value = addr.landmark;
    document.getElementById("city").value = addr.city;
    document.querySelectorAll(".address-form-grid input")[7].value = addr.state;
    document.getElementById("pincode").value = addr.pincode;
    document.getElementById("type").value = addr.type;

    addresses.splice(i, 1);
    localStorage.setItem("addresses", JSON.stringify(addresses));

    renderAddresses();
}

renderAddresses();



function toggleAddressForm() {
    const section = document.getElementById("addressFormSection");
    const arrow = document.getElementById("arrowIcon");
    const card = document.querySelector(".add-address-card");

    if (section.style.display === "none" || section.style.display === "") {
        section.style.display = "block";
        arrow.classList.remove("bi-chevron-down");
        arrow.classList.add("bi-chevron-up");

        card.classList.remove("closed");
        card.classList.add("open");
    } else {
        section.style.display = "none";
        arrow.classList.remove("bi-chevron-up");
        arrow.classList.add("bi-chevron-down");

        card.classList.remove("open");
        card.classList.add("closed");
    }
}


function saveAddressToDatabase(address) {

    fetch(API + "/save-address", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_email: getUserEmail(),
            full_name: address.name,
            phone: address.phone,
            alt_phone: address.altPhone,
            house_no: address.house,
            street: address.address,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            address_type: address.type,
            is_default: address.selected ? 1 : 0
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log("Address saved in database");
        });

}


function selectAddress(i) {
    addresses.forEach(addr => addr.selected = false);
    addresses[i].selected = true;

    // Save selected address
    localStorage.setItem("checkoutAddress", JSON.stringify(addresses[i]));
    localStorage.setItem("addresses", JSON.stringify(addresses));

    renderAddresses();

    // Go back to home page
    window.location.href = "/";
}

function goBack() {
    window.history.back();
}