const TIME_PER_STATION = 2;

let stations = [];

const originSelect = document.getElementById("origin");
const destinationSelect = document.getElementById("destination");
const startBtn = document.getElementById("startBtn");

const currentStationEl = document.getElementById("currentStation");
const nextStationEl = document.getElementById("nextStation");
const remainingTimeEl = document.getElementById("remainingTime");
const remainingStationsEl = document.getElementById("remainingStations");

const trainMarker = document.getElementById("trainMarker");

let simulationInterval = null;

async function loadStations() {
    const response = await fetch("data/line1.json");
    const data = await response.json();

    stations = data.stations;

    stations.forEach(station => {

        const option1 = document.createElement("option");
        option1.value = station;
        option1.textContent = station;

        const option2 = document.createElement("option");
        option2.value = station;
        option2.textContent = station;

        originSelect.appendChild(option1);
        destinationSelect.appendChild(option2);

    });

    destinationSelect.selectedIndex = stations.length - 1;
}

function moveMarker(progress) {

    const percent = Math.max(0, Math.min(100, progress));

    trainMarker.style.right = `${percent}%`;
}

function startSimulation() {

    if (simulationInterval) {
        clearInterval(simulationInterval);
    }

    const origin = originSelect.value;
    const destination = destinationSelect.value;

    const startIndex = stations.indexOf(origin);
    const endIndex = stations.indexOf(destination);

    if (startIndex === -1 || endIndex === -1) {
        alert("ایستگاه نامعتبر است");
        return;
    }

    if (startIndex >= endIndex) {
        alert("مقصد باید بعد از مبدا باشد");
        return;
    }

    const totalStations = endIndex - startIndex;
    const totalMinutes = totalStations * TIME_PER_STATION;

    let currentSegment = 0;

    updateDisplay();

    simulationInterval = setInterval(() => {

        currentSegment++;

        if (currentSegment > totalStations) {
            clearInterval(simulationInterval);

            currentStationEl.textContent = destination;
            nextStationEl.textContent = "رسیده‌اید";
            remainingStationsEl.textContent = 0;
            remainingTimeEl.textContent = "0 دقیقه";

            moveMarker(100);

            return;
        }

        updateDisplay();

    }, 2000);

    function updateDisplay() {

        const stationIndex = startIndex + currentSegment;

        currentStationEl.textContent =
            stations[Math.min(stationIndex, endIndex)];

        if (stationIndex < endIndex) {
            nextStationEl.textContent =
                stations[stationIndex + 1];
        } else {
            nextStationEl.textContent = "مقصد";
        }

        const remainingStations =
            endIndex - stationIndex;

        const remainingMinutes =
            remainingStations * TIME_PER_STATION;

        remainingStationsEl.textContent =
            remainingStations;

        remainingTimeEl.textContent =
            `${remainingMinutes} دقیقه`;

        const progress =
            (currentSegment / totalStations) * 100;

        moveMarker(progress);
    }
}

startBtn.addEventListener("click", startSimulation);

loadStations();
