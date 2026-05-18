import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, firebaseReady } from "./firebase-config.js";

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

async function loadSiteLinks() {
  if (!firebaseReady) {
    return;
  }

  const ebdCard = document.querySelector('[data-dynamic-link="ebd"]');
  if (!ebdCard) {
    return;
  }

  try {
    const snapshot = await getDoc(doc(db, "configuracoes", "cards"));

    if (!snapshot.exists()) {
      return;
    }

    const ebdLink = normalizeUrl(snapshot.data().ebdLink);
    if (ebdLink) {
      ebdCard.href = ebdLink;
    }
  } catch (error) {
    console.error("Nao foi possivel carregar os links dinamicos.", error);
  }
}

loadSiteLinks();
