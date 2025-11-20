document.getElementById("year").textContent = new Date().getFullYear();

function navigate(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// Navigation Highlight
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(btn => btn.addEventListener('click', () => {
  navButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  navigate(btn.dataset.route);
}));

// Render Game List (Home & Grid)
function renderGames() {
  const list = document.getElementById('gamesList');
  const grid = document.getElementById('gamesGrid');
  list.innerHTML = '';
  grid.innerHTML = '';

  games.forEach(g => {
    const card = `
      <div class='game-card' onclick="openGame('${g.id}')">
        <img src='${g.image}' class='game-thumb'/>
        <div><h3>${g.title}</h3><p class='muted'>${g.short}</p></div>
      </div>`;
    list.innerHTML += card;
    grid.innerHTML += card;
  });
}

let currentGame = null;

// --- SPIEL ÖFFNEN ---
function openGame(id) {
  const g = games.find(x => x.id === id);
  currentGame = g;

  document.getElementById('gameTitle').textContent = g.title;
  document.getElementById('gameShort').textContent = g.short;
  document.getElementById('gameThumb').src = g.image;

  // Password-Gate zeigen, Fehler ausblenden
  document.getElementById('passwordGate').classList.remove("hidden");
  document.getElementById('pwInput').value = "";
  document.getElementById('pwError').classList.add("hidden");

  // Hinweise verstecken
  document.getElementById('hintsContainer').classList.add("hidden");

  // Hinweise aufbauen
  renderHints(g);

  navigate('gameDetail');
}

// Passwortprüfung
document.getElementById("pwSubmit").addEventListener("click", () => {
  const input = document.getElementById("pwInput").value;

  if (!currentGame) return;

  if (input === currentGame.passwort) {

    // Passwort richtig → Gate verstecken, Hinweise anzeigen
    document.getElementById("passwordGate").classList.add("hidden");
    document.getElementById("hintsContainer").classList.remove("hidden");

  } else {
    // Fehler
    document.getElementById("pwError").classList.remove("hidden");
  }
});

// --- Hinweise dyn. erzeugen ---
function renderHints(g) {
  const hc = document.getElementById('hintsContainer');
  hc.innerHTML = "";

  g.hints.forEach((h, i) => {
    hc.innerHTML += `
      <div class='accordion hint' id='hint${i}'>
        <button onclick="toggleHint(${i})">Hinweis ${i + 1}</button>
        <div class='content'>
          <div class='photo'>
			<img src='${h.image}' onclick="openImage('${h.image}')"/>
		  </div>
          <p>${h.text}</p>
        </div>
      </div>`;
  });
}

function toggleHint(i) {
  document.getElementById(`hint${i}`).classList.toggle('open');
}

function openImage(src) {
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImage");

  modalImg.src = src;
  modal.style.display = "flex";
}

function closeImage() {
  document.getElementById("imgModal").style.display = "none";
}

function goHome() {
  // Navigation zurück zur Startseite
  navigate('home');

  // Navigation Highlight für die Home-Taste setzen
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector('.nav-btn[data-route="home"]').classList.add('active');
}

renderGames();
