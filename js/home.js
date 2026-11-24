const eventsList = document.getElementById("eventsList");
const eventsStatus = document.getElementById("eventsStatus");
const birthdaysMessage = document.getElementById("birthdaysMessage");
const birthdaysList = document.getElementById("birthdaysList");
const videoModal = document.getElementById("videoModal");
const videoModalTitle = document.getElementById("videoModalTitle");
const cultoVideo = document.getElementById("cultoVideo");
const videoClose = document.getElementById("videoClose");
const fallbackEventImageUrl = new URL("../assets/images/fallback/agenda-eventos.jpg", import.meta.url).href;
const firebaseConfigUrl = new URL("../js/firebase-config.js", import.meta.url).href;
let lastVideoTrigger = null;

document.getElementById("currentYear").textContent = new Date().getFullYear();

function openVideo(card) {
  lastVideoTrigger = card;
  cultoVideo.src = card.dataset.video;
  videoModalTitle.textContent = card.dataset.videoTitle || "Culto";
  videoModal.hidden = false;
  document.body.classList.add("video-modal-open");
  videoClose.focus();
  cultoVideo.play().catch(() => {});
}

function closeVideo() {
  cultoVideo.pause();
  cultoVideo.removeAttribute("src");
  cultoVideo.load();
  videoModal.hidden = true;
  document.body.classList.remove("video-modal-open");
  lastVideoTrigger?.focus();
}

eventsList.addEventListener("click", (event) => {
  const card = event.target.closest(".event-card[data-video]");
  if (card) openVideo(card);
});

eventsList.addEventListener("keydown", (event) => {
  const card = event.target.closest(".event-card[data-video]");
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openVideo(card);
  }
});

videoClose.addEventListener("click", closeVideo);
videoModal.addEventListener("click", (event) => {
  if (event.target === videoModal) closeVideo();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !videoModal.hidden) closeVideo();
});

function normalizeHttpsUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" ? url.href : "";
  } catch (error) {
    return "";
  }
}

function createEventCard(record) {
  const card = record.link ? document.createElement("a") : document.createElement("article");
  card.className = "event-card";

  if (record.link) {
    card.href = record.link;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute("aria-label", `Abrir evento: ${record.title}`);
  }

  const image = document.createElement("img");
  image.src = record.imageUrl;
  image.alt = "";
  image.loading = "lazy";
  image.addEventListener(
    "error",
    () => {
      image.src = fallbackEventImageUrl;
    },
    { once: true },
  );

  const copy = document.createElement("div");
  copy.className = "event-copy";

  const label = document.createElement("small");
  label.textContent = "Agenda da igreja";

  const invitation = document.createElement("p");
  invitation.textContent = "Confira os detalhes da programação.";

  copy.append(label, invitation);
  card.append(image, copy);
  return card;
}

function renderEvents(snapshot) {
  const records = snapshot.docs
    .map((entry) => {
      const data = entry.data();
      const order = Number(data.ordem);
      const createdAtMs = Number(data.createdAtMs);

      return {
        title: String(data.titulo || "").trim(),
        imageUrl: normalizeHttpsUrl(data.imageUrl),
        link: normalizeHttpsUrl(data.link),
        order: Number.isFinite(order) ? order : 9999,
        createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : 0,
      };
    })
    .filter((record) => record.title && record.imageUrl)
    .sort((a, b) => a.order - b.order || b.createdAtMs - a.createdAtMs);

  if (!records.length) {
    eventsStatus.textContent = "Nenhum evento cadastrado. Programação semanal exibida.";
    return;
  }

  eventsList.replaceChildren(...records.map(createEventCard));
  eventsStatus.textContent = `${records.length} eventos carregados.`;
}

function renderBirthdays(snapshot) {
  const records = snapshot.docs
    .map((entry) => {
      const data = entry.data();
      return {
        name: String(data.nome || "").trim(),
        day: Number(data.dia),
      };
    })
    .filter((record) => record.name && Number.isInteger(record.day) && record.day >= 1 && record.day <= 31)
    .sort((a, b) => a.day - b.day || a.name.localeCompare(b.name, "pt-BR"));

  if (!records.length) {
    birthdaysMessage.textContent = "Nenhum aniversariante cadastrado neste mês.";
    birthdaysList.hidden = true;
    return;
  }

  const items = records.map((record) => {
    const item = document.createElement("li");
    const date = document.createElement("time");
    date.dateTime = `--${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(record.day).padStart(2, "0")}`;
    date.textContent = `${String(record.day).padStart(2, "0")}/${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    item.append(date, document.createTextNode(record.name));
    return item;
  });

  birthdaysList.replaceChildren(...items);
  birthdaysList.hidden = false;
  birthdaysMessage.hidden = true;
}

async function loadRemoteContent() {
  try {
    const [firestoreModule, configModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"),
      import(firebaseConfigUrl),
    ]);

    if (!configModule.firebaseReady || !configModule.db) {
      throw new Error("Firebase não configurado.");
    }

    const { collection, doc, getDoc, getDocs, query, where } = firestoreModule;
    const { db } = configModule;
    const currentMonth = new Date().getMonth() + 1;

    const [eventsResult, birthdaysResult, linksResult] = await Promise.allSettled([
      getDocs(collection(db, "eventos")),
      getDocs(query(collection(db, "aniversariantes"), where("mes", "==", currentMonth))),
      getDoc(doc(db, "configuracoes", "cards")),
    ]);

    if (eventsResult.status === "fulfilled") {
      renderEvents(eventsResult.value);
    } else {
      console.error("Não foi possível carregar os eventos.", eventsResult.reason);
      eventsStatus.textContent = "Não foi possível atualizar os eventos. Programação semanal exibida.";
    }

    if (birthdaysResult.status === "fulfilled") {
      renderBirthdays(birthdaysResult.value);
    } else {
      console.error("Não foi possível carregar os aniversariantes.", birthdaysResult.reason);
      birthdaysMessage.textContent = "Não foi possível carregar os aniversariantes no momento.";
    }

    if (linksResult.status === "fulfilled" && linksResult.value.exists()) {
      const ebdLink = normalizeHttpsUrl(linksResult.value.data().ebdLink);
      const ebdCard = document.querySelector('[data-dynamic-link="ebd"]');

      if (ebdLink && ebdCard) {
        ebdCard.href = ebdLink;
      }
    }
  } catch (error) {
    console.error("Não foi possível carregar o conteúdo remoto.", error);
    eventsStatus.textContent = "Conteúdo remoto indisponível. Programação semanal exibida.";
    birthdaysMessage.textContent = "Não foi possível carregar os aniversariantes no momento.";
  }
}

loadRemoteContent();
