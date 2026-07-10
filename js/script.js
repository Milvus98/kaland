const introScreen = document.querySelector("#introScreen");
const mapScreen = document.querySelector("#mapScreen");
const introVideo = document.querySelector("#introVideo");
const playIntroBtn = document.querySelector("#playIntroBtn");
const skipIntroBtn = document.querySelector("#skipIntroBtn");
const videoPlaceholder = document.querySelector("#videoPlaceholder");

const locationDialog = document.querySelector("#locationDialog");
const closeDialogBtn = document.querySelector("#closeDialogBtn");
const locationDialogContent = document.querySelector("#locationDialogContent");
const dragonPatronus = document.querySelector("#dragonPatronus");

/* =====================================================
   INTRO
===================================================== */

function showMap() {
    introScreen.classList.add("hidden");
    mapScreen.classList.remove("hidden");
    window.scrollTo(0, 0);
}

function showDragon() {
    if (dragonPatronus) {
        dragonPatronus.classList.add("show");
    }
}

function hideDragon() {
    if (dragonPatronus) {
        dragonPatronus.classList.remove("show");
    }
}

playIntroBtn.addEventListener("click", async () => {

    videoPlaceholder.style.display = "none";

    try {
        await introVideo.play();
        playIntroBtn.disabled = true;
    }
    catch {

        showMap();

    }

});

introVideo.addEventListener("ended", showMap);
skipIntroBtn.addEventListener("click", showMap);

/* =====================================================
   HELYSZÍNEK
===================================================== */

const locations = {

    1: {
    title: "Hangok erdeje",
    video: "https://pub-159d88d5e842487a9e89b77dacafbf7c.r2.dev/hangokerdeje.mp4",
    text: `
        <p>
            A közös zenéink nem csak a hétköznapjainkat színesítik meg, hanem az utazásaink során is emelik a hangulatot.
            Töltsetek fel <strong>5 dalt</strong> a közös lejátszási listára!
        </p>

        <p>
            Ha elkészültetek, feltehetitek a kapott elemeket, és jöhet a következő fejezet.
        </p>

        <button
            class="wood-button quest-action"
            onclick="window.open('https://music.youtube.com/playlist?list=PLK9UAzVtfi9U&si=JDfqk2F23q9UEWOS','_blank')">
            🎵 Lejátszási lista megnyitása
        </button>
    `
},

    2: {
        title: "Utazás a végtelenbe",
        video: "assets/video/utazasavegtelenbe.mp4",
        text: "Egy különös fekete lyuk világokon és dimenziókon keresztül repít benneteket."
    },

    3: {
        title: "Mozgóképek völgye",
        video: "assets/video/mozgokepekvolgye.mp4",
        text: "A filmek, sorozatok és közös moziélmények kelnek életre."
    },

    4: {
        title: "Könyvek barlangja",
        video: "assets/video/konyvekbarlangja.mp4",
        text: "Régi történetek, elfeledett könyvek és titkok várnak rátok."
    },

    5: {
        title: "A jövő horizontján",
        video: "assets/video/jovohorizontjan.mp4",
        text: "A közös jövőtök felé vezető út kezdődik itt."
    },

    6: {
        title: "Álmok birodalma",
        video: "assets/video/almokbirodalma.mp4",
        text: "A végső küldetés. Itt áll össze minden kalandotok egyetlen történetté."
    }

};

/* =====================================================
   NFC FELOLDÁS
===================================================== */

const QUEST_STORAGE_KEY = "kalandUnlockedQuests";

const validQuestIds = [

    "hangok-erdeje",
    "utazas-a-vegtelenbe",
    "mozgokepek-volgye",
    "konyvek-barlangja",
    "a-jovo-horizontjan",
    "almok-birodalma"

];

function getUnlockedQuests() {

    const data = localStorage.getItem(QUEST_STORAGE_KEY);

    return data
        ? JSON.parse(data)
        : [];

}

function saveUnlockedQuests(list) {

    localStorage.setItem(
        QUEST_STORAGE_KEY,
        JSON.stringify(list)
    );

}

function unlockQuest(id) {

    if (!validQuestIds.includes(id))
        return false;

    const list = getUnlockedQuests();

    if (!list.includes(id)) {

        list.push(id);

        saveUnlockedQuests(list);

        return true;

    }

    return false;

}

function updateQuestButtons(newQuest = null) {

    const unlocked = getUnlockedQuests();

    document
        .querySelectorAll(".quest")
        .forEach(button => {

            const id = button.dataset.quest;

            const icon = button.querySelector(".quest-icon");

            const unlockedIcon = button.dataset.icon;

            const isUnlocked = unlocked.includes(id);

            button.disabled = !isUnlocked;

            button.classList.toggle("locked", !isUnlocked);

            button.classList.toggle("unlocked", isUnlocked);

            icon.textContent = isUnlocked
                ? unlockedIcon
                : "🔒";

            if (newQuest === id) {

                button.classList.add("just-unlocked");

                setTimeout(() => {

                    button.classList.remove("just-unlocked");

                }, 1500);

            }

        });

}

function initializeNfcUnlock() {
  let unlocked = getUnlockedQuests();

    if (!unlocked.includes("hangok-erdeje")) {
        unlocked.push("hangok-erdeje");
        saveUnlockedQuests(unlocked);
    }

    const params = new URLSearchParams(window.location.search);

    const unlock = params.get("unlock");

    let newQuest = null;

    if (unlock) {

        if (unlockQuest(unlock)) {

            newQuest = unlock;

        }

        history.replaceState(
            {},
            "",
            window.location.pathname
        );

    }

    updateQuestButtons(newQuest);

}

initializeNfcUnlock();

/* =====================================================
   KATTINTÁS
===================================================== */

/* =====================================================
   HELYSZÍN VIDEÓ ÉS FELADAT
===================================================== */

function showQuestMessage(location) {
    locationDialogContent.innerHTML = `
        <div class="quest-message">
            <h3>${location.title}</h3>
            <p>${location.text}</p>
        </div>
    `;

    showDragon();
}

async function showLocationVideo(location) {
    hideDragon();

    locationDialogContent.innerHTML = `
        <h3>${location.title}</h3>

        <video
            id="locationVideo"
            class="location-video"
            controls
            playsinline
            preload="metadata"
        >
            <source src="${location.video}" type="video/mp4">
            A böngésződ nem támogatja a videó lejátszását.
        </video>
    `;

    if (!locationDialog.open) {
        locationDialog.showModal();
    }

    const locationVideo =
        document.querySelector("#locationVideo");

    if (!locationVideo) {
        showQuestMessage(location);
        return;
    }

    locationVideo.addEventListener(
        "ended",
        () => {
            showQuestMessage(location);
        },
        { once: true }
    );

    locationVideo.addEventListener(
        "error",
        () => {
            console.error(
                "A videó nem tölthető be:",
                location.video
            );

            showQuestMessage(location);
        },
        { once: true }
    );

    try {
        await locationVideo.play();
    } catch (error) {
        console.warn(
            "A böngésző blokkolta az automatikus lejátszást. Nyomd meg a videó lejátszás gombját.",
            error
        );
    }
}


/* =====================================================
   KATTINTÁS
===================================================== */

document
    .querySelectorAll(".location, .center-place")
    .forEach((button) => {

        button.addEventListener("click", () => {

            if (
                button.disabled ||
                button.classList.contains("locked")
            ) {
                return;
            }

            const id = button.dataset.location;
            const location = locations[id];

            if (!location) {
                console.warn(
                    "A helyszín nem található:",
                    id
                );

                return;
            }

            if (location.video) {
                showLocationVideo(location);
            } else {
                if (!locationDialog.open) {
                    locationDialog.showModal();
                }

                showQuestMessage(location);
            }

        });

    });


/* =====================================================
   DIALOG
===================================================== */

function stopLocationVideo() {
    const activeVideo =
        locationDialogContent.querySelector("video");

    if (activeVideo) {
        activeVideo.pause();
        activeVideo.currentTime = 0;
    }
}

closeDialogBtn.addEventListener("click", () => {
    stopLocationVideo();
    locationDialog.close();
});

locationDialog.addEventListener("close", () => {
    stopLocationVideo();
    hideDragon();
    locationDialogContent.innerHTML = "";
});

