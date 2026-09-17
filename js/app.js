const audio = document.getElementById('audio');
const vinyl = document.getElementById('vinyl');
const tonearm = document.getElementById('tonearm');
const powerLight = document.getElementById('powerLight');

const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');

const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeBar = document.getElementById('volumeBar');

const fileInput = document.getElementById('fileInput');
const playlistItems = document.getElementById('playlistItems');

let playlist = [];
let currentIndex = -1;
let isSeeking = false;

audio.volume = volumeBar.value / 100;

// ---------- Cargar archivos ----------

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  const wasEmpty = playlist.length === 0;

  files.forEach((file) => {
    const { title, artist } = parseFileName(file.name);
    playlist.push({
      title,
      artist,
      url: URL.createObjectURL(file),
    });
  });

  renderPlaylist();

  if (wasEmpty) {
    loadTrack(0);
  }

  fileInput.value = '';
});

function parseFileName(name) {
  const clean = name.replace(/\.[^/.]+$/, '');
  const parts = clean.split(' - ');
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
  }
  return { artist: 'Artista desconocido', title: clean };
}

// ---------- Playlist UI ----------

function renderPlaylist() {
  playlistItems.innerHTML = '';

  if (playlist.length === 0) {
    playlistItems.innerHTML = '<li class="empty-hint">Aún no subiste canciones</li>';
    return;
  }

  playlist.forEach((track, index) => {
    const li = document.createElement('li');
    li.textContent = `${track.title} — ${track.artist}`;
    if (index === currentIndex) li.classList.add('active');
    li.addEventListener('click', () => {
      loadTrack(index);
      playAudio();
    });
    playlistItems.appendChild(li);
  });
}

// ---------- Reproducción ----------

function loadTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  currentIndex = index;
  const track = playlist[currentIndex];

  audio.src = track.url;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;

  renderPlaylist();
}

function playAudio() {
  if (currentIndex === -1) return;
  audio.play();
}

function pauseAudio() {
  audio.pause();
}

function togglePlayPause() {
  if (currentIndex === -1) return;
  if (audio.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
}

playPauseBtn.addEventListener('click', togglePlayPause);

prevBtn.addEventListener('click', () => {
  if (playlist.length === 0) return;
  const wasPlaying = !audio.paused;
  const newIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(newIndex);
  if (wasPlaying) playAudio();
});

nextBtn.addEventListener('click', playNext);

function playNext() {
  if (playlist.length === 0) return;
  const wasPlaying = !audio.paused;
  const newIndex = (currentIndex + 1) % playlist.length;
  loadTrack(newIndex);
  if (wasPlaying) playAudio();
}

audio.addEventListener('ended', () => {
  if (playlist.length === 0) return;
  const newIndex = (currentIndex + 1) % playlist.length;
  loadTrack(newIndex);
  playAudio();
});

// ---------- Estado visual: disco + aguja + luz ----------

audio.addEventListener('play', () => {
  vinyl.classList.add('spinning');
  tonearm.classList.add('playing');
  powerLight.classList.add('on');
  playPauseBtn.classList.add('is-playing');
  playPauseBtn.title = 'Pausar';
});

audio.addEventListener('pause', () => {
  vinyl.classList.remove('spinning');
  tonearm.classList.remove('playing');
  playPauseBtn.classList.remove('is-playing');
  playPauseBtn.title = 'Reproducir';
});

// ---------- Barra de progreso ----------

audio.addEventListener('loadedmetadata', () => {
  progressBar.max = audio.duration;
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  if (isSeeking) return;
  progressBar.value = audio.currentTime;
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

progressBar.addEventListener('input', () => {
  isSeeking = true;
  currentTimeEl.textContent = formatTime(progressBar.value);
});

progressBar.addEventListener('change', () => {
  audio.currentTime = progressBar.value;
  isSeeking = false;
});

function formatTime(seconds) {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ---------- Volumen ----------

volumeBar.addEventListener('input', () => {
  audio.volume = volumeBar.value / 100;
});
