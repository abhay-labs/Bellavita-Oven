function searchCake() {

    let input = document
        .getElementById("cakeSearch")
        .value
        .toLowerCase();

    let cards = document.querySelectorAll(".cake-card");

    cards.forEach(function (card) {

        let title = card
            .querySelector("h3")
            .innerText
            .toLowerCase();

        if (title.includes(input)) {

            card.style.display = "block";

        }
        else {

            card.style.display = "none";

        }

    });

}