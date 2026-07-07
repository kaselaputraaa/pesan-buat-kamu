const text = document.getElementById("text");
const ending = document.getElementById("ending");
const replay = document.getElementById("replay");
const bgm = document.getElementById("bgm");
const startAudio = document.getElementById("startAudio");

// Lirik yang akan diputar (animasi bawah -> atas)
// Cara ngatur delay sesuai sound:
// - set timingMs per baris (berapa lama sejak baris sebelumnya selesai)
// - durasi typing per karakter bisa disesuaikan di typingSpeedMs
const typingSpeedMs = 45;

const lyrics = [
  { text: "Cantiknya aku, sudah bobo ya?", timingMs: 2000, hideAfterMs: 3000 },
  { text: "Aku mau ngucapin sesuatu", timingMs: 2000, hideAfterMs: 2000 },
  { text: "Ya", timingMs: 600, hideAfterMs: 350 },

  { text: "Kamu itu adalah wanita terbaik yang aku kenal setelah ibuku", timingMs: 3500, hideAfterMs: 900 },
  { text: "Aku berharap kamu betah sama aku", timingMs: 2000, hideAfterMs: 800 },

  { text: "Aku suka dengan sikap kamu yang selalu bilang kalau ada masalah", timingMs: 1500, hideAfterMs: 600 },
  { text: "Ya", timingMs: 1000, hideAfterMs: 1000 },
  { text: "Terkadang", timingMs: 1000, hideAfterMs: 600 },
  { text: "Bilangnya memang telat", timingMs: 1000, hideAfterMs: 600 },
  { text: "Tapi...", timingMs: 1000, hideAfterMs: 600 },
  { text: "Aku selalu menghargai itu", timingMs: 1500, hideAfterMs: 600 },
  { text: "Dan kamu juga jangan", timingMs: 1000, hideAfterMs: 600 },
  { text: "Insecure", timingMs: 1000, hideAfterMs: 600 },
  { text: "Kamu itu cantik, Dan selalu jadi yang terbaik dimata aku", timingMs: 3000, hideAfterMs: 4000 },
  { text: "Aku sayang banget sama kamu", timingMs: 2000, hideAfterMs: 600 }
];

// Transisi terakhir (diakhiri dengan ini)
const endingWords = "Selamat malam, cantiknya aku";

// delay setelah endingWords selesai diketik sebelum tampilkan heading ending
const endingAfterMs = 700;

let heartInterval = null;
let lyricIndex = 0;
let lyricTimer = null;
let typeTimer = null;

function safeWarn(msg) {
  try {
    console.warn(msg);
  } catch (e) {}
}

function stopBgm() {
  if (!bgm) return;
  try {
    bgm.pause();
    bgm.currentTime = 0;
  } catch (e) {}
}

async function tryPlayBgm() {
  if (!bgm) {
    safeWarn("bgm element not found");
    return false;
  }

  try {
    bgm.currentTime = 0;
  } catch (e) {}

  try {
    await bgm.play();
    return true;
  } catch (err) {
    // Autoplay biasanya keblokir kalau tidak dari gesture.
    safeWarn("bgm.play() gagal: " + err);
    return false;
  }
}

function clearTimers() {
  if (lyricTimer) clearTimeout(lyricTimer);
  if (typeTimer) clearInterval(typeTimer);
  lyricTimer = null;
  typeTimer = null;
}

function setTextVisible(visible) {
  if (!text) return;
  if (visible) {
    text.classList.remove("type");
    text.classList.add("type");
    text.classList.remove("hide");
    text.classList.add("show");
  } else {
    text.classList.remove("show");
    text.classList.add("hide");
  }
}

function typeWriter(message, callback) {
  if (!text) return;

  text.innerHTML = "";

  // Pastikan animasi jalan
  text.classList.remove("hide");
  text.classList.add("show");

  let i = 0;
  typeTimer = setInterval(() => {
    text.innerHTML += message.charAt(i);
    i++;
    if (i >= message.length) {
      clearInterval(typeTimer);
      typeTimer = null;
      callback && callback();
    }
  }, typingSpeedMs);
}

function createHearts() {

    if (heartInterval) clearInterval(heartInterval);

    heartInterval = setInterval(() => {

        const heart = document.createElement("div");

        heart.className = "heart";
        heart.innerHTML = "🤍";

        if (Math.random() > 0.5) {
            heart.style.left = (10 + Math.random() * 15) + "vw";
        } else {
            heart.style.left = (75 + Math.random() * 15) + "vw";
        }

        heart.style.bottom = "-30px";
        heart.style.fontSize = (18 + Math.random() * 18) + "px";

        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 5000);

    }, 300);
}

function goToEnding() {
  clearTimers();

  if (text) {
    text.style.display = "none";
  }

  if (ending) {
    ending.style.display = "block";

    const endingTitle = document.getElementById("endingTitle");
    if (endingTitle) {
      // Pastikan sesuai request (bikin ejaan tanpa titik)
      endingTitle.innerHTML = "Selamat malam,<br>cantiknya aku. 🌙🤍";
    }
  }
  createHearts();
}

function playLyricSequence() {
  clearTimers();

  if (!text) return;

  // reset UI
  text.style.display = "block";
  text.classList.remove("hide");
  text.classList.add("show");

  lyricIndex = 0;

  const next = () => {
    if (!text) return;

    if (lyricIndex >= lyrics.length) {
      // tampilkan kata akhir lalu ending
  typeWriter(endingWords, () => {
        // tampilkan setelah selesai
        lyricTimer = setTimeout(() => {
          goToEnding();
        }, endingAfterMs);
      });
      return;
    }

    const item = lyrics[lyricIndex];

    typeWriter(item.text, () => {
      lyricIndex++;

      // 1) tahan text setelah selesai diketik (biar nggak langsung hilang)
      const hideAfter = typeof item.hideAfterMs === "number" ? item.hideAfterMs : 0;
      if (hideAfter <= 0) {
        text.classList.remove("show");
        text.classList.add("hide");
      } else {
        // sembunyikan setelah hideAfterMs
        lyricTimer = setTimeout(() => {
          if (!text) return;
          text.classList.remove("show");
          text.classList.add("hide");
        }, hideAfter);
      }

      // 2) tetap jadikan timingMs sebagai delay sebelum baris berikutnya muncul
      lyricTimer = setTimeout(() => {
        text.classList.remove("hide");
        text.classList.add("show");
        next();
      }, item.timingMs);
    });
  };

  next();
}

function startMessagePlayback() {
  // mode message: autoplay audio dari elemen bgm saat halaman terbuka
  if (startAudio) startAudio.style.display = "none";

  stopBgm();
  lyricIndex = 0;

  if (ending) ending.style.display = "none";
  if (text) {
    text.style.display = "block";
    text.classList.remove("hide");
    text.classList.add("show");
    text.innerHTML = "";
  }

  // Mulai audio, lalu jalankan lirik
  tryPlayBgm().finally(() => {
    playLyricSequence();
  });
}

function startFromButtonIfNeeded() {
  if (!startAudio) return;

  // Kalau halaman index punya script ini, dia hanya punya button redirect.
  // Jadi jangan mainkan audio di index.
  // Tapi tetap safe kalau ada yang terselip.
  startAudio.addEventListener("click", () => {
    // index.html handle redirect by inline script.
  });
}

// Init
window.addEventListener("load", () => {
  // kalau di index, ending biasanya tidak ada/atau tidak mau auto-run
  // kita detect dari keberadaan #bgm + #endingTitle
  const isMessagePage = !!document.getElementById("bgm");

  startFromButtonIfNeeded();

  if (isMessagePage) {
    // Di message: audio auto start (akan kena autoplay policy jika browser menolak)
    startMessagePlayback();
  }
});

if (replay) {
  replay.addEventListener("click", () => {

    document.body.classList.add("fade");

    setTimeout(() => {

      window.location.href = "index.html";

    }, 600);

  });
}

