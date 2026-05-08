const openButtons = document.querySelectorAll("[data-video-open]");
const modal = document.querySelector("#videoModal");
const video = document.querySelector("#cultoVideo");
const videoSource = video?.querySelector("source");

let closeTimer;
let flashTimer;

function openVideo(event) {
  if (!modal || !video) {
    return;
  }

  const button = event.currentTarget;
  const videoSrc = button instanceof HTMLElement ? button.dataset.videoSrc : "";

  window.clearTimeout(closeTimer);
  window.clearTimeout(flashTimer);

  video.pause();

  if (videoSrc && videoSource && videoSource.getAttribute("src") !== videoSrc) {
    videoSource.setAttribute("src", videoSrc);
    video.load();
  }

  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("video-modal-open");

  requestAnimationFrame(() => {
    modal.classList.add("is-visible", "is-flashing");
  });

  video.currentTime = 0;
  video.play().catch(() => {});

  flashTimer = window.setTimeout(() => {
    modal.classList.remove("is-flashing");
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

openButtons.forEach((button) => {
  button.addEventListener("click", openVideo);
});

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
