import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, firebaseReady } from "./firebase-config.js";

const messageElement = document.getElementById("birthdaysMessage");
const listElement = document.getElementById("birthdaysList");

const monthNames = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

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

function isValidBirthday(record) {
  return (
    Number.isInteger(record.day) &&
    Number.isInteger(record.month) &&
    record.day >= 1 &&
    record.day <= 31 &&
    record.month >= 1 &&
    record.month <= 12 &&
    typeof record.name === "string" &&
    record.name.length > 0
  );
}

function formatBirthday(day, month) {
  const monthLabel = monthNames[month - 1] || "mes invalido";
  return `${String(day).padStart(2, "0")} de ${monthLabel}`;
}

function renderBirthdays(records) {
  if (!records.length) {
    setMessage("Nenhum aniversariante neste mes.");
    return;
  }

  listElement.innerHTML = records
    .map((record) => {
      const noteHtml = record.note
        ? `<p class="birthday-note">${escapeHtml(record.note)}</p>`
        : "";
      return `
        <li class="birthday-item is-current-month">
          <p class="birthday-date">${formatBirthday(record.day, record.month)}</p>
          <div>
            <p class="birthday-name">${escapeHtml(record.name)}</p>
            ${noteHtml}
          </div>
        </li>
      `;
    })
    .join("");

  messageElement.hidden = true;
  listElement.hidden = false;
}

async function loadBirthdays() {
  if (!firebaseReady) {
    setMessage("Configure o Firebase em js/firebase-config.js para mostrar os aniversariantes.");
    return;
  }

  try {
    const currentMonth = new Date().getMonth() + 1;
    const snapshot = await getDocs(collection(db, "aniversariantes"));
    const records = snapshot.docs
      .map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          name: String(data.nome || "").trim(),
          day: Number(data.dia),
          month: Number(data.mes),
          note: String(data.observacao || "").trim(),
        };
      })
      .filter((r) => isValidBirthday(r) && r.month === currentMonth)
      .sort((a, b) => a.day - b.day || a.name.localeCompare(b.name, "pt-BR"));

    renderBirthdays(records);
  } catch (error) {
    setMessage("Nao foi possivel carregar os aniversariantes no momento.");
    console.error(error);
  }
}

loadBirthdays();
