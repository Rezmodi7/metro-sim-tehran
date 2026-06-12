const TIME_PER_STATION = 2; // دقیقه

let stations = [];
let onlineTimeOffset = 0;

const originSelect = document.getElementById("origin");
const destinationSelect = document.getElementById("destination");
const startBtn = document.getElementById("startBtn");

const currentStationEl =
    document.getElementById("currentStation");

const nextStationEl =
    document.getElementById("nextStation");

const remainingTimeEl =
    document.getElementById("remainingTime");

const remainingStationsEl =
    document.getElementById("remainingStations");

const trainMarker =
    document.getElementById("trainMarker");

const progressBar =
    document.getElementById("progressBar");

const progressPercent =
    document.getElementById("progressPercent");

const betweenStations =
    document.getElementById("betweenStations");

async function syncTime() {

    try {

        const response =
            await fetch(
                "https://worldtimeapi.org/api/timezone/Asia/Tehran"
            );

        const data =
            await response.json();

        const serverTime =
            new Date(data.datetime).getTime();

        onlineTimeOffset =
            serverTime - Date.now();

        document.getElementById(
            "timeSource"
        ).textContent =
            "🟢 ساعت آنلاین";

    } catch {

        document.getElementById(
            "timeSource"
        ).textContent =
            "🟡 ساعت دستگاه";
    }
}

function getCurrentTime() {

    return new Date(
        Date.now() + onlineTimeOffset
    );
}

function startClock() {

    setInterval(() => {

        const now =
            getCurrentTime();

        document.getElementById(
            "currentTime"
        ).textContent =
            now.toLocaleTimeString("fa-IR");

    }, 1000);
}

async function loadStations() {

    const response =
        await fetch("data/line1.json");

    const data =
        await response.json();

    stations =
        data.stations;

    originSelect.innerHTML = "";
    destinationSelect.innerHTML = "";

    stations.forEach(station => {

        const o1 =
            document.createElement("option");

        o1.value = station;
        o1.textContent = station;

        const o2 =
            document.createElement("option");

        o2.value = station;
        o2.textContent = station;

        originSelect.appendChild(o1);
        destinationSelect.appendChild(o2);

    });

    destinationSelect.selectedIndex =
        stations.length - 1;
}

function moveMarker(percent) {

    percent =
        Math.max(
            0,
            Math.min(100, percent)
        );

    trainMarker.style.right =
        `${100 - percent}%`;
}

function calculatePosition() {

    const boardingTime =
        document.getElementById(
            "boardingTime"
        ).value;

    if (!boardingTime) {

        alert(
            "ساعت سوار شدن را وارد کنید"
        );

        return;
    }

    const origin =
        originSelect.value;

    const destination =
        destinationSelect.value;

    const startIndex =
        stations.indexOf(origin);

    const endIndex =
        stations.indexOf(destination);

    if (
        startIndex === -1 ||
        endIndex === -1
    ) {
        return;
    }

    if (startIndex >= endIndex) {

        alert(
            "مقصد باید بعد از مبدا باشد"
        );

        return;
    }

    const now =
        getCurrentTime();

    const [h,m] =
        boardingTime
        .split(":")
        .map(Number);

    const boarding =
        new Date(now);

    boarding.setHours(h);
    boarding.setMinutes(m);
    boarding.setSeconds(0);

    const elapsedMinutes =
        (now - boarding) /
        1000 /
        60;

    const totalStations =
        endIndex - startIndex;

    const totalTravelTime =
        totalStations *
        TIME_PER_STATION;

    if (
        elapsedMinutes <= 0
    ) {

        currentStationEl.textContent =
            origin;

        nextStationEl.textContent =
            stations[startIndex + 1];

        remainingStationsEl.textContent =
            totalStations;

        remainingTimeEl.textContent =
            totalTravelTime +
            " دقیقه";

        betweenStations.textContent =
            "در ایستگاه " +
            origin;

        progressBar.style.width =
            "0%";

        progressPercent.textContent =
            "0%";

        moveMarker(0);

        return;
    }

    const passedStations =
        Math.floor(
            elapsedMinutes /
            TIME_PER_STATION
        );

    const progress =
        Math.min(
            100,
            (elapsedMinutes /
            totalTravelTime) *
            100
        );

    progressBar.style.width =
        progress + "%";

    progressPercent.textContent =
        progress.toFixed(0) + "%";

    moveMarker(progress);

    if (
        passedStations >=
        totalStations
    ) {

        currentStationEl.textContent =
            destination;

        nextStationEl.textContent =
            "رسیده‌اید";

        remainingStationsEl.textContent =
            "0";

        remainingTimeEl.textContent =
            "0 دقیقه";

        betweenStations.textContent =
            "به مقصد رسیده‌اید";

        return;
    }

    const currentIndex =
        startIndex +
        passedStations;

    currentStationEl.textContent =
        stations[currentIndex];

    nextStationEl.textContent =
        stations[currentIndex + 1];

    const remaining =
        totalStations -
        passedStations;

    remainingStationsEl.textContent =
        remaining;

    remainingTimeEl.textContent =
        (remaining *
        TIME_PER_STATION)
        + " دقیقه";

    betweenStations.textContent =
        "بین " +
        stations[currentIndex] +
        " و " +
        stations[currentIndex + 1];
}

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await syncTime();

        startClock();

        await loadStations();

        startBtn.addEventListener(
            "click",
            calculatePosition
        );

        setInterval(
            calculatePosition,
            30000
        );
    }
);
