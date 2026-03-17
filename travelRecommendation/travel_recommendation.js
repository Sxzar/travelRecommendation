document.addEventListener("DOMContentLoaded", function () {
    let travelData = {};
    const resultsContainer = document.getElementById("results");
    const searchForms = document.querySelectorAll(".mainHeader__search");
    const allInputs = document.querySelectorAll(".searchInput");

    function syncInputs(value) {
        allInputs.forEach((input) => {
            input.value = value;
        });
    }

    function displayResults(results) {
        if (!resultsContainer) return;

        resultsContainer.innerHTML = "";

        if (!results.length) {
            resultsContainer.innerHTML = "<p>No recommendations found.</p>";
            return;
        }

        results.forEach((place) => {
            const card = document.createElement("article");
            card.classList.add("resultCard");

            card.innerHTML = `
        <img src="${place.imageUrl}" alt="${place.name}">
        <h3>${place.name}</h3>
        <p>${place.description}</p>
      `;

            resultsContainer.appendChild(card);
        });
    }

    function getRecommendations(keyword) {
        if (keyword === "beach" || keyword === "beaches") {
            return travelData.beaches ? travelData.beaches.slice(0, 2) : [];
        }

        if (keyword === "temple" || keyword === "temples") {
            return travelData.temples ? travelData.temples.slice(0, 2) : [];
        }

        if (keyword === "country" || keyword === "countries") {
            if (!travelData.countries) return [];

            return travelData.countries
                .slice(0, 2)
                .map((country) => country.cities[0])
                .filter(Boolean);
        }

        if (travelData.countries) {
            const matchedCountry = travelData.countries.find((country) =>
                country.name.toLowerCase().includes(keyword)
            );

            if (matchedCountry && matchedCountry.cities) {
                return matchedCountry.cities.slice(0, 2);
            }
        }

        return [];
    }

    function runSearch(keyword) {
        const recommendations = getRecommendations(keyword);
        console.log("Search keyword:", keyword);
        console.log("Recommendations:", recommendations);
        displayResults(recommendations);
    }

    function redirectToHome(keyword) {
        window.location.href = `./travel_recommendation.html?search=${encodeURIComponent(keyword)}`;
    }

    function handleSearch(keyword) {
        if (!keyword) return;

        syncInputs(keyword);

        if (resultsContainer) {
            runSearch(keyword);
        } else {
            redirectToHome(keyword);
        }
    }

    function clearSearch() {
        syncInputs("");

        if (resultsContainer) {
            resultsContainer.innerHTML = "";
        }

        const url = new URL(window.location.href);
        url.searchParams.delete("search");
        window.history.replaceState({}, "", url);
    }

    searchForms.forEach((form) => {
        const searchInput = form.querySelector(".searchInput");
        const clearBtn = form.querySelector(".clearBtn");

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const keyword = searchInput.value.trim().toLowerCase();
            handleSearch(keyword);
        });

        clearBtn.addEventListener("click", function () {
            clearSearch();
        });
    });

    if (resultsContainer) {
        fetch("./travel_recommendation_api.json")
            .then((response) => response.json())
            .then((data) => {
                travelData = data;
                console.log("Fetched travel data:", data);

                const params = new URLSearchParams(window.location.search);
                const keywordFromUrl = params.get("search");

                if (keywordFromUrl) {
                    const normalizedKeyword = keywordFromUrl.trim().toLowerCase();
                    syncInputs(normalizedKeyword);
                    runSearch(normalizedKeyword);
                }
            })
            .catch((error) => {
                console.error("Error fetching JSON:", error);
            });
    }
});