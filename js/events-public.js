import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, firebaseReady } from "./firebase-config.js";

const messageElement = document.getElementById("eventsMessage");
const listElement = document.getElementById("eventsList");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setMessage(text) {
  messageElement.textContent = text;
  messageElement.hidden = false;
  listElement.hidden = true;
}

function normalizeUrl(value) {
  const url = String(value || "").trim();

  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol) ? parsedUrl.href : "";
  } catch (error) {
    return "";
  }
}

function normalizeRecord(entry) {
  const data = entry.data();
  const title = String(data.titulo || "").trim();
  const imageUrl = String(data.imageUrl || "").trim();
  const order = Number(data.ordem);
  const createdAtMs = Number(data.createdAtMs);

  return {
    id: entry.id,
    title,
    imageUrl,
    link: normalizeUrl(data.link),
    order: Number.isFinite(order) ? order : 9999,
    createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : 0,
  };
}

function renderEvents(records) {
  if (!records.length) {
    setMessage("Nenhum evento cadastrado no momento.");
    return;
  }

  listElement.innerHTML = records
    .map((record) => {
      const title = escapeHtml(record.title || "Agenda de evento");
      const image = `
        <img
          class="event-card-image"
          src="${escapeHtml(record.imageUrl)}"
          alt="${title}"
          loading="lazy"
        />
      `;
      const content = `
        ${image}
        <div class="event-card-caption">
          <h2 class="event-card-title">${title}</h2>
        </div>
      `;

      if (record.link) {
        return `
          <a class="event-card" href="${escapeHtml(record.link)}" target="_blank" rel="noopener noreferrer">
            ${content}
          </a>
        `;
      }

      return `<article class="event-card">${content}</article>`;
    })
    .join("");

  messageElement.hidden = true;
  listElement.hidden = false;
}

async function loadEvents() {
  if (!firebaseReady) {
    setMessage("Configure o Firebase em js/firebase-config.js para mostrar os eventos.");
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "eventos"));
    const records = snapshot.docs
      .map(normalizeRecord)
      .filter((record) => record.title && record.imageUrl)
      .sort((a, b) => a.order - b.order || b.createdAtMs - a.createdAtMs);

    renderEvents(records);
  } catch (error) {
    console.error(error);
    setMessage("Nao foi possivel carregar os eventos no momento.");
  }
}

loadEvents();
