const feedbackCards = document.querySelectorAll("[data-touch-feedback]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateTapPosition(card, event) {
  const rect = card.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  card.style.setProperty("--tap-x", `${x}%`);
  card.style.setProperty("--tap-y", `${y}%`);
}

function animateCard(card, event) {
  if (prefersReducedMotion.matches) {
    return;
  }

  updateTapPosition(card, event);
  card.classList.remove("is-tapping");
  void card.offsetWidth;
  card.classList.add("is-tapping");
}

feedbackCards.forEach((card) => {
  card.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") {
      return;
    }

    animateCard(card, event);
  });

  card.addEventListener("animationend", () => {
    card.classList.remove("is-tapping");
  });
});
