import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, firebaseReady } from "./firebase-config.js";

const loginCard = document.getElementById("loginCard");
const adminSessionPanel = document.getElementById("adminSessionPanel");
const cardLinksPanel = document.getElementById("cardLinksPanel");
const birthdaysPanel = document.getElementById("birthdaysPanel");
const eventsPanel = document.getElementById("eventsPanel");
const firebaseSetupNote = document.getElementById("firebaseSetupNote");

const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const logoutBtn = document.getElementById("logoutBtn");
const adminUser = document.getElementById("adminUser");

const cardLinksForm = document.getElementById("cardLinksForm");
const ebdLinkInput = document.getElementById("ebdLink");
const cardLinksStatus = document.getElementById("cardLinksStatus");

const birthdayForm = document.getElementById("birthdayForm");
const clearBirthdayFormBtn = document.getElementById("clearBirthdayFormBtn");
const birthdayStatus = document.getElementById("birthdayStatus");
const birthdayRows = document.getElementById("birthdayRows");
const birthdayIdInput = document.getElementById("birthdayId");
const nameInput = document.getElementById("name");
const dayInput = document.getElementById("day");
const monthInput = document.getElementById("month");

const eventForm = document.getElementById("eventForm");
const clearEventFormBtn = document.getElementById("clearEventFormBtn");
const eventStatus = document.getElementById("eventStatus");
const eventRows = document.getElementById("eventRows");
const eventTitleInput = document.getElementById("eventTitle");
const eventImageUrlInput = document.getElementById("eventImageUrl");
const eventOrderInput = document.getElementById("eventOrder");

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const birthdayRecords = new Map();
const eventRecords = new Map();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showStatus(element, text, type = "") {
  element.textContent = text;
  element.className = `admin-status${type ? ` ${type}` : ""}`;
  element.hidden = false;
}

function hideStatus(element) {
  element.hidden = true;
  element.textContent = "";
  element.className = "admin-status";
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

function getGoogleDriveFileId(url) {
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }

  const openMatch = url.match(/[?&]id=([^&]+)/);
  return openMatch && openMatch[1] ? openMatch[1] : "";
}

function normalizeImageUrl(value) {
  const url = normalizeUrl(value);

  if (!url) {
    return "";
  }

  const driveFileId = getGoogleDriveFileId(url);
  if (driveFileId && url.includes("drive.google.com")) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveFileId)}&sz=w1200`;
  }

  return url;
}

function formatDate(day, month) {
  const monthLabel = monthNames[month - 1] || "mes invalido";
  return `${String(day).padStart(2, "0")} de ${monthLabel}`;
}

function isValidDayMonth(day, month) {
  if (!Number.isInteger(day) || !Number.isInteger(month)) {
    return false;
  }

  const date = new Date(2024, month - 1, day);
  return date.getFullYear() === 2024 && date.getMonth() === month - 1 && date.getDate() === day;
}

function clearBirthdayForm() {
  birthdayIdInput.value = "";
  birthdayForm.reset();
}

function clearEventForm() {
  eventForm.reset();
}

function renderBirthdayRows() {
  const rows = Array.from(birthdayRecords.values()).sort(
    (a, b) => a.mes - b.mes || a.dia - b.dia || a.nome.localeCompare(b.nome, "pt-BR")
  );

  if (!rows.length) {
    birthdayRows.innerHTML = `
      <tr>
        <td class="empty" colspan="3">Nenhum aniversariante cadastrado.</td>
      </tr>
    `;
    return;
  }

  birthdayRows.innerHTML = rows
    .map((record) => {
      const encodedId = encodeURIComponent(record.id);
      return `
        <tr>
          <td>${escapeHtml(record.nome)}</td>
          <td>${formatDate(record.dia, record.mes)}</td>
          <td>
            <div class="table-actions">
              <button class="table-btn" type="button" data-action="edit" data-id="${encodedId}">
                Editar
              </button>
              <button class="table-btn delete" type="button" data-action="delete" data-id="${encodedId}">
                Excluir
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadBirthdays() {
  birthdayRows.innerHTML = `
    <tr>
      <td class="empty" colspan="3">Carregando...</td>
    </tr>
  `;
  hideStatus(birthdayStatus);

  try {
    const snapshot = await getDocs(collection(db, "aniversariantes"));
    birthdayRecords.clear();

    snapshot.forEach((entry) => {
      const data = entry.data();
      const nome = String(data.nome || "").trim();
      const dia = Number(data.dia);
      const mes = Number(data.mes);

      if (!nome || !isValidDayMonth(dia, mes)) {
        return;
      }

      birthdayRecords.set(entry.id, {
        id: entry.id,
        nome,
        dia,
        mes,
      });
    });

    renderBirthdayRows();
  } catch (error) {
    console.error(error);
    showStatus(birthdayStatus, "Erro ao carregar os aniversariantes. Tente novamente.", "error");
  }
}

function normalizeEventRecord(entry) {
  const data = entry.data();
  const order = Number(data.ordem);
  const createdAtMs = Number(data.createdAtMs);

  return {
    id: entry.id,
    title: String(data.titulo || "").trim(),
    imageUrl: String(data.imageUrl || "").trim(),
    order: Number.isFinite(order) ? order : 9999,
    createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : 0,
  };
}

function renderEventRows() {
  const rows = Array.from(eventRecords.values()).sort(
    (a, b) => a.order - b.order || b.createdAtMs - a.createdAtMs
  );

  if (!rows.length) {
    eventRows.innerHTML = `
      <tr>
        <td class="empty" colspan="3">Nenhum evento cadastrado.</td>
      </tr>
    `;
    return;
  }

  eventRows.innerHTML = rows
    .map((record) => {
      const encodedId = encodeURIComponent(record.id);
      const orderLabel = record.order === 9999 ? "-" : String(record.order);

      return `
        <tr>
          <td>
            <div class="event-admin-preview">
              <img class="event-admin-thumb" src="${escapeHtml(record.imageUrl)}" alt="" loading="lazy" />
              <div>
                <strong>${escapeHtml(record.title)}</strong>
              </div>
            </div>
          </td>
          <td>${escapeHtml(orderLabel)}</td>
          <td>
            <div class="table-actions">
              <button class="table-btn delete" type="button" data-action="delete" data-id="${encodedId}">
                Excluir
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadEvents() {
  eventRows.innerHTML = `
    <tr>
      <td class="empty" colspan="3">Carregando...</td>
    </tr>
  `;
  hideStatus(eventStatus);

  try {
    const snapshot = await getDocs(collection(db, "eventos"));
    eventRecords.clear();

    snapshot.forEach((entry) => {
      const record = normalizeEventRecord(entry);

      if (!record.title || !record.imageUrl) {
        return;
      }

      eventRecords.set(entry.id, record);
    });

    renderEventRows();
  } catch (error) {
    console.error(error);
    showStatus(eventStatus, "Erro ao carregar os eventos. Tente novamente.", "error");
  }
}

async function loadCardLinks() {
  hideStatus(cardLinksStatus);

  try {
    const snapshot = await getDoc(doc(db, "configuracoes", "cards"));

    if (!snapshot.exists()) {
      ebdLinkInput.value = "";
      return;
    }

    const data = snapshot.data();
    ebdLinkInput.value = normalizeUrl(data.ebdLink) || "";
  } catch (error) {
    console.error(error);
    showStatus(cardLinksStatus, "Nao foi possivel carregar o link da Escola Biblica.", "error");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  hideStatus(loginStatus);

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    showStatus(loginStatus, "Informe email e chave (senha).", "error");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
  } catch (error) {
    console.error(error);
    showStatus(
      loginStatus,
      "Nao foi possivel entrar. Verifique email/chave ou permissao no Firebase.",
      "error"
    );
  }
}

async function handleSaveCardLinks(event) {
  event.preventDefault();
  hideStatus(cardLinksStatus);

  const ebdLink = normalizeUrl(ebdLinkInput.value);

  if (!ebdLink) {
    showStatus(cardLinksStatus, "Informe um link valido para a Escola Biblica.", "error");
    return;
  }

  try {
    await setDoc(doc(db, "configuracoes", "cards"), { ebdLink }, { merge: true });
    showStatus(cardLinksStatus, "Link da Escola Biblica atualizado com sucesso.", "success");
  } catch (error) {
    console.error(error);
    showStatus(cardLinksStatus, "Nao foi possivel salvar o link. Verifique as regras do Firebase.", "error");
  }
}

async function handleSaveBirthday(event) {
  event.preventDefault();
  hideStatus(birthdayStatus);

  const id = birthdayIdInput.value.trim();
  const nome = nameInput.value.trim();
  const dia = Number(dayInput.value);
  const mes = Number(monthInput.value);

  if (!nome) {
    showStatus(birthdayStatus, "Informe o nome.", "error");
    return;
  }

  if (!isValidDayMonth(dia, mes)) {
    showStatus(birthdayStatus, "Data invalida. Revise dia e mes.", "error");
    return;
  }

  const payload = { nome, dia, mes };

  try {
    let successMessage = "";
    if (id) {
      await updateDoc(doc(db, "aniversariantes", id), payload);
      successMessage = "Registro atualizado com sucesso.";
    } else {
      await addDoc(collection(db, "aniversariantes"), payload);
      successMessage = "Registro adicionado com sucesso.";
    }

    clearBirthdayForm();
    await loadBirthdays();
    showStatus(birthdayStatus, successMessage, "success");
  } catch (error) {
    console.error(error);
    showStatus(birthdayStatus, "Nao foi possivel salvar. Verifique as regras do Firebase.", "error");
  }
}

async function handleSaveEvent(event) {
  event.preventDefault();
  hideStatus(eventStatus);

  const title = eventTitleInput.value.trim();
  const imageUrl = normalizeImageUrl(eventImageUrlInput.value);
  const orderValue = eventOrderInput.value.trim();
  const order = Number(orderValue);

  if (!title) {
    showStatus(eventStatus, "Informe o titulo do evento.", "error");
    return;
  }

  if (!imageUrl) {
    showStatus(eventStatus, "Informe um link valido para a imagem.", "error");
    return;
  }

  const payload = {
    titulo: title,
    imageUrl,
    ordem: orderValue && Number.isFinite(order) ? order : 9999,
    createdAtMs: Date.now(),
  };

  try {
    await addDoc(collection(db, "eventos"), payload);
    clearEventForm();
    await loadEvents();
    showStatus(eventStatus, "Evento adicionado com sucesso.", "success");
  } catch (error) {
    console.error(error);
    showStatus(eventStatus, "Nao foi possivel salvar. Verifique as regras do Firebase.", "error");
  }
}

function startEditBirthday(id) {
  const record = birthdayRecords.get(id);
  if (!record) {
    showStatus(birthdayStatus, "Registro nao encontrado para edicao.", "error");
    return;
  }

  birthdayIdInput.value = record.id;
  nameInput.value = record.nome;
  dayInput.value = String(record.dia);
  monthInput.value = String(record.mes);
  showStatus(birthdayStatus, "Modo edicao ativo. Faca alteracoes e clique em Salvar.");
}

async function removeBirthday(id) {
  const record = birthdayRecords.get(id);
  if (!record) {
    showStatus(birthdayStatus, "Registro nao encontrado para exclusao.", "error");
    return;
  }

  const confirmed = window.confirm(`Deseja excluir "${record.nome}" da lista?`);
  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(doc(db, "aniversariantes", id));
    if (birthdayIdInput.value === id) {
      clearBirthdayForm();
    }
    await loadBirthdays();
    showStatus(birthdayStatus, "Registro excluido com sucesso.", "success");
  } catch (error) {
    console.error(error);
    showStatus(birthdayStatus, "Nao foi possivel excluir o registro.", "error");
  }
}

async function removeEvent(id) {
  const record = eventRecords.get(id);

  if (!record) {
    showStatus(eventStatus, "Evento nao encontrado para exclusao.", "error");
    return;
  }

  const confirmed = window.confirm(`Deseja excluir "${record.title}" da agenda?`);
  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(doc(db, "eventos", id));
    await loadEvents();
    showStatus(eventStatus, "Evento excluido com sucesso.", "success");
  } catch (error) {
    console.error(error);
    showStatus(eventStatus, "Nao foi possivel excluir o evento.", "error");
  }
}

async function handleBirthdayTableAction(event) {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button) {
    return;
  }

  const decodedId = decodeURIComponent(button.dataset.id || "");
  if (!decodedId) {
    return;
  }

  if (button.dataset.action === "edit") {
    startEditBirthday(decodedId);
    return;
  }

  if (button.dataset.action === "delete") {
    await removeBirthday(decodedId);
  }
}

async function handleEventTableAction(event) {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button) {
    return;
  }

  const decodedId = decodeURIComponent(button.dataset.id || "");
  if (button.dataset.action === "delete" && decodedId) {
    await removeEvent(decodedId);
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    showStatus(loginStatus, "Nao foi possivel sair da conta agora.", "error");
  }
}

function setAdminPanelsHidden(hidden) {
  adminSessionPanel.hidden = hidden;
  cardLinksPanel.hidden = hidden;
  birthdaysPanel.hidden = hidden;
  eventsPanel.hidden = hidden;
}

function updateScreenByAuth(user) {
  if (user) {
    loginCard.hidden = true;
    setAdminPanelsHidden(false);
    adminUser.textContent = user.email || user.uid;
    loadCardLinks();
    loadBirthdays();
    loadEvents();
    return;
  }

  setAdminPanelsHidden(true);
  loginCard.hidden = false;
  adminUser.textContent = "";
  clearBirthdayForm();
  clearEventForm();
  cardLinksForm.reset();
  hideStatus(cardLinksStatus);
  hideStatus(birthdayStatus);
  hideStatus(eventStatus);
}

function init() {
  if (!firebaseReady) {
    firebaseSetupNote.hidden = false;
    loginCard.hidden = true;
    setAdminPanelsHidden(true);
    return;
  }

  firebaseSetupNote.hidden = true;

  loginForm.addEventListener("submit", handleLogin);
  cardLinksForm.addEventListener("submit", handleSaveCardLinks);
  birthdayForm.addEventListener("submit", handleSaveBirthday);
  clearBirthdayFormBtn.addEventListener("click", clearBirthdayForm);
  birthdayRows.addEventListener("click", handleBirthdayTableAction);
  eventForm.addEventListener("submit", handleSaveEvent);
  clearEventFormBtn.addEventListener("click", clearEventForm);
  eventRows.addEventListener("click", handleEventTableAction);
  logoutBtn.addEventListener("click", handleLogout);

  onAuthStateChanged(auth, updateScreenByAuth);
}

init();
