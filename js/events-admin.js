import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { addDoc, collection, deleteDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, firebaseReady } from "./firebase-config.js";

const loginCard = document.getElementById("loginCard");
const adminPanel = document.getElementById("adminPanel");
const firebaseSetupNote = document.getElementById("firebaseSetupNote");

const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const logoutBtn = document.getElementById("logoutBtn");
const adminUser = document.getElementById("adminUser");

const eventForm = document.getElementById("eventForm");
const clearEventFormBtn = document.getElementById("clearEventFormBtn");
const adminStatus = document.getElementById("adminStatus");
const eventRows = document.getElementById("eventRows");

const eventTitleInput = document.getElementById("eventTitle");
const eventImageUrlInput = document.getElementById("eventImageUrl");
const eventOrderInput = document.getElementById("eventOrder");

const records = new Map();

function escapeHtml(value) {
  return value
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

function clearForm() {
  eventForm.reset();
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

function normalizeRecord(entry) {
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

function renderRows() {
  const rows = Array.from(records.values()).sort(
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

async function loadRecords() {
  eventRows.innerHTML = `
    <tr>
      <td class="empty" colspan="3">Carregando...</td>
    </tr>
  `;
  hideStatus(adminStatus);

  try {
    const snapshot = await getDocs(collection(db, "eventos"));
    records.clear();

    snapshot.forEach((entry) => {
      const record = normalizeRecord(entry);

      if (!record.title || !record.imageUrl) {
        return;
      }

      records.set(entry.id, record);
    });

    renderRows();
  } catch (error) {
    console.error(error);
    showStatus(adminStatus, "Erro ao carregar os eventos. Tente novamente.", "error");
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

async function handleSaveEvent(event) {
  event.preventDefault();
  hideStatus(adminStatus);

  const title = eventTitleInput.value.trim();
  const imageUrl = normalizeImageUrl(eventImageUrlInput.value);
  const orderValue = eventOrderInput.value.trim();
  const order = Number(orderValue);

  if (!title) {
    showStatus(adminStatus, "Informe o titulo do evento.", "error");
    return;
  }

  if (!imageUrl) {
    showStatus(adminStatus, "Informe um link valido para a imagem.", "error");
    return;
  }

  const createdAtMs = Date.now();
  const payload = {
    titulo: title,
    imageUrl,
    ordem: orderValue && Number.isFinite(order) ? order : 9999,
    createdAtMs,
  };

  try {
    await addDoc(collection(db, "eventos"), payload);
    clearForm();
    await loadRecords();
    showStatus(adminStatus, "Evento adicionado com sucesso.", "success");
  } catch (error) {
    console.error(error);
    showStatus(adminStatus, "Nao foi possivel salvar. Verifique as regras do Firebase.", "error");
  }
}

async function removeRecord(id) {
  const record = records.get(id);

  if (!record) {
    showStatus(adminStatus, "Evento nao encontrado para exclusao.", "error");
    return;
  }

  const confirmed = window.confirm(`Deseja excluir "${record.title}" da agenda?`);
  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(doc(db, "eventos", id));
    await loadRecords();
    showStatus(adminStatus, "Evento excluido com sucesso.", "success");
  } catch (error) {
    console.error(error);
    showStatus(adminStatus, "Nao foi possivel excluir o evento.", "error");
  }
}

async function handleTableAction(event) {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;
  const decodedId = decodeURIComponent(id || "");

  if (action === "delete" && decodedId) {
    await removeRecord(decodedId);
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    showStatus(adminStatus, "Nao foi possivel sair da conta agora.", "error");
  }
}

function updateScreenByAuth(user) {
  if (user) {
    loginCard.hidden = true;
    adminPanel.hidden = false;
    adminUser.textContent = user.email || user.uid;
    loadRecords();
    return;
  }

  adminPanel.hidden = true;
  loginCard.hidden = false;
  adminUser.textContent = "";
  clearForm();
  hideStatus(adminStatus);
}

function init() {
  if (!firebaseReady) {
    firebaseSetupNote.hidden = false;
    loginCard.hidden = true;
    adminPanel.hidden = true;
    return;
  }

  firebaseSetupNote.hidden = true;

  loginForm.addEventListener("submit", handleLogin);
  eventForm.addEventListener("submit", handleSaveEvent);
  clearEventFormBtn.addEventListener("click", clearForm);
  logoutBtn.addEventListener("click", handleLogout);
  eventRows.addEventListener("click", handleTableAction);

  onAuthStateChanged(auth, updateScreenByAuth);
}

init();
