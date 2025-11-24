document.getElementById("year").textContent = new Date().getFullYear();

function navigate(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');

  // Zeige den Zurück-Button nur auf der Detailseite
  const backButton = document.getElementById('btnBack');
  if (id === 'gameDetail') {
    backButton.classList.remove('hidden');
  } else {
    backButton.classList.add('hidden');
  }
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
  list.innerHTML = ''; // Clear the list

  games.forEach(g => {
    const card = `
      <div class='game-card' onclick="openGame('${g.id}')">
        <img src='${g.titleImage}' class='game-thumb'/>
        <div><h3>${g.title}</h3><p class='muted'>${getShortDescription(g.description)}</p></div>
      </div>`;
    list.innerHTML += card; // Add the card to the list
  });
}

function getShortDescription(description, maxLength = 200) {
  return description.length > maxLength ? description.slice(0, maxLength) + "..." : description;
}

let currentGame = null;

function setTitleImageSize(width, maxWidth, maxHeight) {
  const titleImage = document.getElementById('gameTitleImage');
  titleImage.style.setProperty('--title-image-width', width);
  titleImage.style.setProperty('--title-image-max-width', maxWidth);
  titleImage.style.setProperty('--title-image-max-height', maxHeight);
}

function openGame(id) {
  const g = games.find(x => x.id === id);
  currentGame = g;

  document.getElementById('gameTitle').textContent = g.title;
  document.getElementById('gameDescription').textContent = g.description;
  const gameTitleImage = document.getElementById('gameTitleImage');
  gameTitleImage.src = g.titleImage;

  // Enable full-screen viewing for the title image in the game detail view
  gameTitleImage.onclick = () => openImage(g.titleImage);

  // Helper function to populate or hide sections
  function populateOrHide(containerId, contentId, value) {
    const container = document.getElementById(containerId);
    const content = document.getElementById(contentId);
    if (value) {
      container.style.display = 'block';
      content.textContent = value;
    } else {
      container.style.display = 'none';
    }
  }

  // Populate additional details
  populateOrHide('gameBuiltOrBoughtContainer', 'gameBuiltOrBought', g.builtOrBought);
  populateOrHide('gameAvailableSinceContainer', 'gameAvailableSince', g.availableSince);
  populateOrHide('gameDurationContainer', 'gameDuration', g.duration);
  populateOrHide('gameRoomSizeContainer', 'gameRoomSize', g.roomSize);
  populateOrHide('gamePlayableContainer', 'gamePlayable', g.playable);
  populateOrHide('gameSpecialFeaturesContainer', 'gameSpecialFeatures', g.specialFeatures);
  populateOrHide('gameIdeaOriginContainer', 'gameIdeaOrigin', g.ideaOrigin);

  // Render additional images
  const additionalImagesContainer = document.getElementById('additionalImagesContainer');
  const additionalImagesSection = document.getElementById('gameAdditionalImages');
  if (g.additionalImages && g.additionalImages.length > 0) {
    additionalImagesContainer.innerHTML = '';
    g.additionalImages.forEach(image => {
      const imgElement = document.createElement('img');
      imgElement.src = image;
      imgElement.alt = 'Zusätzliches Bild';
      imgElement.classList.add('game-thumb');
      imgElement.onclick = () => openImage(image); // Add click event for full-screen view
      additionalImagesContainer.appendChild(imgElement);
    });
    additionalImagesSection.style.display = 'block';
  } else {
    additionalImagesSection.style.display = 'none';
  }

  // Setze die Größe des titleImage (z. B. 80% Breite, max. 400px Breite, max. 300px Höhe)
  setTitleImageSize('80%', '400px', '300px');

  // ALLES zuerst verstecken!
  document.getElementById('passwordGate').classList.add("hidden");
  document.getElementById('hintsContainer').classList.add("hidden");
  document.getElementById('pwError').classList.add("hidden");

  // Hinweise vorbereiten
  renderHints(g);

  if (g.isPasswordProtected) {
    // Passwortbereich anzeigen
    document.getElementById('passwordGate').classList.remove("hidden");
    document.getElementById('pwInput').value = "";
  } else {
    // Hinweise ohne Passwort anzeigen
    document.getElementById('hintsContainer').classList.remove("hidden");
  }

  navigate('gameDetail');
}

// Passwortprüfung
document.getElementById("pwSubmit").addEventListener("click", () => {
  if (!currentGame) return;

  // Falls das Spiel NICHT passwortgeschützt ist → direkt freischalten
  if (!currentGame.isPasswordProtected) {
    document.getElementById("passwordGate").classList.add("hidden");
    document.getElementById("hintsContainer").classList.remove("hidden");
    return;
  }

  const input = document.getElementById("pwInput").value;

  if (input === currentGame.password) {
    document.getElementById("passwordGate").classList.add("hidden");
    document.getElementById("hintsContainer").classList.remove("hidden");
  } else {
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
  navigate('home');
  renderGames(); // Spieleliste erneut rendern

  // Disable full-screen viewing for the title image on the home page
  const gameTitleImage = document.getElementById('gameTitleImage');
  gameTitleImage.onclick = null;

  // Navigation Highlight für die Home-Taste setzen
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector('.nav-btn[data-route="home"]').classList.add('active');
}

renderGames();
