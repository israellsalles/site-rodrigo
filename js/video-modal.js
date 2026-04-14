const openButton = document.querySelector("[data-video-open]");
const modal = document.querySelector("#videoModal");
const video = document.querySelector("#cultoVideo");

let closeTimer;
let flashTimer;

function openVideo() {
  if (!modal || !video) {
    return;
  }

  window.clearTimeout(closeTimer);
  window.clearTimeout(flashTimer);

  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("video-modal-open");

  requestAnimationFrame(() => {
    modal.classList.add("is-visible", "is-flashing");
  });

  video.currentTime = 0;

  flashTimer = window.setTimeout(() => {
    modal.classList.remove("is-flashing");
    video.play().catch(() => {});
  }, 260);
}

function closeVideo() {
  if (!modal || !video || modal.hidden) {
    return;
  }

  window.clearTimeout(closeTimer);
  window.clearTimeout(flashTimer);

  video.pause();
  video.currentTime = 0;
  modal.classList.remove("is-visible", "is-flashing");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("video-modal-open");

  closeTimer = window.setTimeout(() => {
    modal.hidden = true;
  }, 260);
}

openButton?.addEventListener("click", openVideo);

modal?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement && event.target.hasAttribute("data-video-close")) {
    closeVideo();
  }
});

video?.addEventListener("ended", closeVideo);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeVideo();
  }
});
