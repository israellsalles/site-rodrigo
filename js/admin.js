import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, firebaseReady } from "./firebase-config.js";

const loginCard = document.getElementById("loginCard");
const adminPanel = document.getElementById("adminPanel");
const firebaseSetupNote = document.getElementById("firebaseSetupNote");

const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const logoutBtn = document.getElementById("logoutBtn");
const adminUser = document.getElementById("adminUser");

const birthdayForm = document.getElementById("birthdayForm");
const clearFormBtn = document.getElementById("clearFormBtn");
const adminStatus = document.getElementById("adminStatus");
const birthdayRows = document.getElementById("birthdayRows");

const birthdayIdInput = document.getElementById("birthdayId");
const nameInput = document.getElementById("name");
const dayInput = document.getElementById("day");
const monthInput = document.getElementById("month");

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

function clearForm() {
  birthdayIdInput.value = "";
  birthdayForm.reset();
}

function renderRows() {
  const rows = Array.from(records.values()).sort(
    (a, b) => a.mes - b.mes || a.dia - b.dia || a.nome.localeCompare(b.nome, "pt-BR")
  );

  if (!rows.length) {
    birthdayRows.innerHTML = `
      <tr>
        <td class="empty" colspan="4">Nenhum aniversariante cadastrado.</td>
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

async function loadRecords() {
  birthdayRows.innerHTML = `
    <tr>
      <td class="empty" colspan="4">Carregando...</td>
    </tr>
  `;
  hideStatus(adminStatus);

  try {
    const snapshot = await getDocs(collection(db, "aniversariantes"));
    records.clear();

    snapshot.forEach((entry) => {
      const data = entry.data();
      const nome = String(data.nome || "").trim();
      const dia = Number(data.dia);
      const mes = Number(data.mes);

      if (!nome || !isValidDayMonth(dia, mes)) {
        return;
      }

      records.set(entry.id, {
        id: entry.id,
        nome,
        dia,
        mes,
      });
    });

    renderRows();
  } catch (error) {
    console.error(error);
    showStatus(adminStatus, "Erro ao carregar os dados. Tente novamente.", "error");
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

async function handleSaveBirthday(event) {
  event.preventDefault();
  hideStatus(adminStatus);

  const id = birthdayIdInput.value.trim();
  const nome = nameInput.value.trim();
  const dia = Number(dayInput.value);
  const mes = Number(monthInput.value);

  if (!nome) {
    showStatus(adminStatus, "Informe o nome.", "error");
    return;
  }

  if (!isValidDayMonth(dia, mes)) {
    showStatus(adminStatus, "Data invalida. Revise dia e mes.", "error");
    return;
  }

  const payload = {
    nome,
    dia,
    mes,
  };

  try {
    if (id) {
      await updateDoc(doc(db, "aniversariantes", id), payload);
      showStatus(adminStatus, "Registro atualizado com sucesso.", "success");
    } else {
      await addDoc(collection(db, "aniversariantes"), payload);
      showStatus(adminStatus, "Registro adicionado com sucesso.", "success");
    }

    clearForm();
    await loadRecords();
  } catch (error) {
    console.error(error);
    showStatus(adminStatus, "Nao foi possivel salvar. Verifique as regras do Firebase.", "error");
  }
}

function startEdit(id) {
  const record = records.get(id);
  if (!record) {
    showStatus(adminStatus, "Registro nao encontrado para edicao.", "error");
    return;
  }

  birthdayIdInput.value = record.id;
  nameInput.value = record.nome;
  dayInput.value = String(record.dia);
  monthInput.value = String(record.mes);
  showStatus(adminStatus, "Modo edicao ativo. Faca alteracoes e clique em Salvar.");
}

async function removeRecord(id) {
  const record = records.get(id);
  if (!record) {
    showStatus(adminStatus, "Registro nao encontrado para exclusao.", "error");
    return;
  }

  const confirmed = window.confirm(`Deseja excluir "${record.nome}" da lista?`);
  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(doc(db, "aniversariantes", id));
    showStatus(adminStatus, "Registro excluido com sucesso.", "success");
    if (birthdayIdInput.value === id) {
      clearForm();
    }
    await loadRecords();
  } catch (error) {
    console.error(error);
    showStatus(adminStatus, "Nao foi possivel excluir o registro.", "error");
  }
}

async function handleTableAction(event) {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;
  if (!id) {
    return;
  }

  const decodedId = decodeURIComponent(id);
  if (!decodedId) {
    return;
  }

  if (action === "edit") {
    startEdit(decodedId);
    return;
  }

  if (action === "delete") {
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
  birthdayForm.addEventListener("submit", handleSaveBirthday);
  clearFormBtn.addEventListener("click", clearForm);
  logoutBtn.addEventListener("click", handleLogout);
  birthdayRows.addEventListener("click", handleTableAction);

  onAuthStateChanged(auth, updateScreenByAuth);
}

init();
