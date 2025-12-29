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
  
  // Update navigation highlight
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    if (btn.dataset.route === id) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Render prices when navigating to prices page
  if (id === 'prices') {
    renderPrices();
  }
}

// Navigation Highlight
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(btn => btn.addEventListener('click', () => {
  navButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const route = btn.dataset.route;
  history.pushState({ page: route }, '', `#${route}`);
  navigate(route);
}));

// Render Game List (Home & Grid)
function renderGames() {
  const list = document.getElementById('gamesList');
  list.innerHTML = ''; // Clear the list

  games.forEach(g => {
    const card = `
      <div class='game-card' onclick="openGame('${g.id}')">
        <img src='${g.titleImage}' class='game-thumb'/>
        <div>
          <h3>${g.title}</h3>
          <p class='muted'>${g.shortDescription}</p>
          <div class='game-info'>
            <span><strong>Spieldauer:</strong> ${g.playTime}</span><br>
            <span><strong>Spieleranzahl:</strong> ${g.playerSize}</span><br>
            <span><strong>Preis:</strong> ${g.priceLine1}${g.priceLine2 ? ' / ' + g.priceLine2 : ''}</span>
          </div>
        </div>
      </div>`;
    list.innerHTML += card;
  });
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

  // Add to browser history
  history.pushState({ page: 'gameDetail', gameId: id }, '', `#game/${id}`);

  document.getElementById('gameTitle').textContent = g.title;
  document.getElementById('gameDescription').textContent = g.description;
  const gameTitleImage = document.getElementById('gameTitleImage');
  gameTitleImage.src = g.titleImage;

  // Enable full-screen viewing for the title image in the game detail view
  gameTitleImage.onclick = () => openImage(g.titleImage);

  function populateOrHide(containerId, contentId, value) {
    const container = document.getElementById(containerId);
    const content = document.getElementById(contentId);
    if (value) {
      container.style.display = 'block';
      content.innerHTML = value;
    } else {
      container.style.display = 'none';
    }
  }

  // Populate additional details
  populateOrHide('gameAvailableSinceContainer', 'gameAvailableSince', g.availableSince);
  populateOrHide('gameBuiltOrBoughtContainer', 'gameBuiltOrBought', g.builtOrBought);
  populateOrHide('gameRoomSizeContainer', 'gameRoomSize', g.roomSize);
  populateOrHide('gameDifficultyContainer', 'gameDifficulty', g.difficulty);
  populateOrHide('gameDurationContainer', 'gameDuration', g.duration);
  populateOrHide('gamePlayableContainer', 'gamePlayable', g.playable);
  populateOrHide('gamePlayerSizeContainer', 'gamePlayerSize', g.playerSize);
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
  document.getElementById('puzzleContainer').classList.add("hidden");
  document.getElementById('pwError').classList.add("hidden");

  // Puzzles vorbereiten
  if (g.isPasswordProtected) {
    document.getElementById('passwordGate').classList.remove("hidden");
    document.getElementById('pwInput').value = "";
    document.getElementById('puzzleContainer').classList.add("hidden");
  } else {
    document.getElementById('passwordGate').classList.add("hidden");
    document.getElementById('puzzleContainer').classList.remove("hidden");
    renderPuzzles(g);
  }

  navigate('gameDetail');
}

// Passwortprüfung
document.getElementById("pwSubmit").addEventListener("click", () => {
  if (!currentGame) return;

  if (!currentGame.isPasswordProtected) {
    document.getElementById("passwordGate").classList.add("hidden");
    document.getElementById("puzzleContainer").classList.remove("hidden");
    renderPuzzles(currentGame);
    return;
  }

  const input = document.getElementById("pwInput").value;

  if (input === currentGame.password) {
    document.getElementById("passwordGate").classList.add("hidden");
    document.getElementById("puzzleContainer").classList.remove("hidden");
    renderPuzzles(currentGame);
  } else {
    document.getElementById("pwError").classList.remove("hidden");
  }
});

// Allow Enter key to submit password
document.getElementById("pwInput").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("pwSubmit").click();
  }
});

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
  history.pushState({ page: 'home' }, '', '#home');
  navigate('home');
  renderGames(); // Spieleliste erneut rendern

  // Disable full-screen viewing for the title image on the home page
  const gameTitleImage = document.getElementById('gameTitleImage');
  gameTitleImage.onclick = null;

  // Hide additional details and images on the home page
  const detailContainers = [
    'gameBuiltOrBoughtContainer',
    'gameAvailableSinceContainer',
    'gameDifficultyContainer',
    'gameDurationContainer',
    'gameRoomSizeContainer',
    'gamePlayableContainer',
    'gameSpecialFeaturesContainer',
    'gameIdeaOriginContainer',
    'gameAdditionalImages'
  ];
  detailContainers.forEach(id => {
    document.getElementById(id).style.display = 'none';
  });

  // Navigation Highlight für die Home-Taste setzen
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector('.nav-btn[data-route="home"]').classList.add('active');
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
  if (event.state) {
    if (event.state.page === 'gameDetail' && event.state.gameId) {
      // Avoid adding duplicate history entry
      const currentState = history.state;
      openGameWithoutHistory(event.state.gameId);
      history.replaceState(currentState, '');
    } else if (event.state.page === 'home') {
      goHomeWithoutHistory();
    } else {
      navigate(event.state.page);
    }
  } else {
    goHomeWithoutHistory();
  }
});

// Helper function to open game without adding to history
function openGameWithoutHistory(id) {
  const g = games.find(x => x.id === id);
  currentGame = g;

  document.getElementById('gameTitle').textContent = g.title;
  document.getElementById('gameDescription').textContent = g.description;
  const gameTitleImage = document.getElementById('gameTitleImage');
  gameTitleImage.src = g.titleImage;
  gameTitleImage.onclick = () => openImage(g.titleImage);

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

  populateOrHide('gameBuiltOrBoughtContainer', 'gameBuiltOrBought', g.builtOrBought);
  populateOrHide('gameAvailableSinceContainer', 'gameAvailableSince', g.availableSince);
  populateOrHide('gameDifficultyContainer', 'gameDifficulty', g.difficulty);
  populateOrHide('gameDurationContainer', 'gameDuration', g.duration);
  populateOrHide('gameRoomSizeContainer', 'gameRoomSize', g.roomSize);
  populateOrHide('gamePlayableContainer', 'gamePlayable', g.playable);
  populateOrHide('gameSpecialFeaturesContainer', 'gameSpecialFeatures', g.specialFeatures);
  populateOrHide('gameIdeaOriginContainer', 'gameIdeaOrigin', g.ideaOrigin);

  const additionalImagesContainer = document.getElementById('additionalImagesContainer');
  const additionalImagesSection = document.getElementById('gameAdditionalImages');
  if (g.additionalImages && g.additionalImages.length > 0) {
    additionalImagesContainer.innerHTML = '';
    g.additionalImages.forEach(image => {
      const imgElement = document.createElement('img');
      imgElement.src = image;
      imgElement.alt = 'Zusätzliches Bild';
      imgElement.classList.add('game-thumb');
      imgElement.onclick = () => openImage(image);
      additionalImagesContainer.appendChild(imgElement);
    });
    additionalImagesSection.style.display = 'block';
  } else {
    additionalImagesSection.style.display = 'none';
  }

  setTitleImageSize('80%', '400px', '300px');

  document.getElementById('passwordGate').classList.add("hidden");
  document.getElementById('puzzleContainer').classList.add("hidden");
  document.getElementById('pwError').classList.add("hidden");

  if (g.isPasswordProtected) {
    document.getElementById('passwordGate').classList.remove("hidden");
    document.getElementById('pwInput').value = "";
    document.getElementById('puzzleContainer').classList.add("hidden");
  } else {
    document.getElementById('passwordGate').classList.add("hidden");
    document.getElementById('puzzleContainer').classList.remove("hidden");
    renderPuzzles(g);
  }

  navigate('gameDetail');
}

// Initialize with home page in history
history.replaceState({ page: 'home' }, '', '#home');

// Ensure additional details and images are hidden on page load
goHome();

renderGames();

// Render Prices List
function renderPrices() {
  const pricesList = document.getElementById('pricesList');
  pricesList.innerHTML = ''; // Clear the list

  prices.forEach(p => {
    const priceCard = document.createElement('div');
    priceCard.classList.add('price-card');
    
    const title = document.createElement('h3');
    title.textContent = p.title;
    
    const description = document.createElement('p');
    // Replace </br> with actual line breaks
    description.innerHTML = p.description.replace(/<\/br>/gi, '<br>');
    
    priceCard.appendChild(title);
    priceCard.appendChild(description);
    pricesList.appendChild(priceCard);
  });
}

// --- Puzzles rendern ---
function renderPuzzles(game) {
  const container = document.getElementById('puzzleContainer');
  container.innerHTML = '';

  if (!game.puzzles || game.puzzles.length === 0) {
    return;
  }

  game.puzzles.forEach((puzzle, pIdx) => {
    const puzzleDetails = document.createElement('details');
    puzzleDetails.className = 'puzzle-block';
    puzzleDetails.style.margin = '1.0rem 0';
    puzzleDetails.style.border = '1px solid #222';
    puzzleDetails.style.borderRadius = '10px';
    puzzleDetails.style.background = '#141820';
    puzzleDetails.style.boxShadow = '0 2px 8px #0003';

    const puzzleSummary = document.createElement('summary');
    puzzleSummary.innerHTML = `<span style="font-size:1.2em;font-weight:bold;color:#e6eef6;">❓ Rätsel ${pIdx + 1}</span>`;
    puzzleSummary.style.padding = '1rem';
    puzzleSummary.style.cursor = 'pointer';
    puzzleDetails.appendChild(puzzleSummary);

    if (puzzle.image) {
      const img = document.createElement('img');
      img.src = puzzle.image;
      img.alt = `Puzzle ${pIdx + 1}`;
      img.style.maxWidth = '250px';
      img.style.display = 'block';
      img.style.margin = '1rem auto 1rem auto';
      img.style.borderRadius = '8px';
      img.style.boxShadow = '0 2px 8px #0003';
      img.onclick = () => openImage(puzzle.image);
      puzzleDetails.appendChild(img);
    }

    if (Array.isArray(puzzle.texts) && puzzle.texts.length > 0) {
      const hintsList = document.createElement('div');
      hintsList.className = 'hints-list';
      hintsList.style.margin = '1rem 0 1rem 0';
      hintsList.style.paddingLeft = '0.5rem';

      puzzle.texts.forEach((hint, hIdx) => {
        const hintDetails = document.createElement('details');
        hintDetails.className = 'hint-block';
        hintDetails.style.margin = '0.5rem 0';
        hintDetails.style.background = '#1a1f2a';
        hintDetails.style.borderRadius = '7px';
        hintDetails.style.border = '1px solid #222';

        const hintSummary = document.createElement('summary');
        hintSummary.innerHTML = `<span style="font-weight:500;color:#e6eef6;">💡 Hinweis ${hIdx + 1}</span>`;
        hintSummary.style.padding = '0.5rem 1rem';
        hintSummary.style.cursor = 'pointer';
        hintDetails.appendChild(hintSummary);

        const hintText = document.createElement('div');
        hintText.textContent = hint;
        hintText.style.padding = '0.5rem 1.5rem 1rem 1.5rem';
        hintText.style.color = '#e6eef6';
        hintDetails.appendChild(hintText);

        hintsList.appendChild(hintDetails);
      });
      puzzleDetails.appendChild(hintsList);
    }

    if (puzzle.solution) {
      const solutionDetails = document.createElement('details');
      solutionDetails.className = 'solution-block';
      solutionDetails.style.margin = '1rem 0 0.5rem 0';
      solutionDetails.style.background = '#222a38';
      solutionDetails.style.border = '1px solid #444';
      solutionDetails.style.borderRadius = '7px';

      const solutionSummary = document.createElement('summary');
      solutionSummary.innerHTML = `<span style="font-weight:600;color:#e6eef6;">🔓 Lösung anzeigen</span>`;
      solutionSummary.style.padding = '0.7rem 1rem';
      solutionSummary.style.cursor = 'pointer';
      solutionDetails.appendChild(solutionSummary);

      const solutionText = document.createElement('div');
      solutionText.textContent = puzzle.solution;
      solutionText.style.padding = '0.7rem 1.5rem 1rem 1.5rem';
      solutionText.style.color = '#e6eef6';
      solutionText.style.fontWeight = '500';
      solutionDetails.appendChild(solutionText);

      puzzleDetails.appendChild(solutionDetails);
    }

    container.appendChild(puzzleDetails);
  });
}

// Beispiel: Zeige Puzzles nach Passwortprüfung oder direkt, je nach Spiel
function showGamePuzzles(game) {
  const puzzleContainer = document.getElementById('puzzleContainer');
  if (game.isPasswordProtected) {
    puzzleContainer.classList.add('hidden');
  } else {
    puzzleContainer.classList.remove('hidden');
    renderPuzzles(game);
  }
}

// Passwortprüfung anpassen, damit nach Erfolg Puzzles angezeigt werden
document.getElementById('pwSubmit').onclick = function() {
  const pwInput = document.getElementById('pwInput');
  const pwError = document.getElementById('pwError');
  const gameId = window.currentGameId;
  const game = games.find(g => g.id === gameId);
  if (pwInput.value === game.password) {
    pwError.classList.add('hidden');
    document.getElementById('passwordGate').classList.add('hidden');
    document.getElementById('puzzleContainer').classList.remove('hidden');
    renderPuzzles(game);
  } else {
    pwError.classList.remove('hidden');
  }
};

// Beim Anzeigen eines Spiels:
function showGameDetails(gameId) {
  // ...existing code...
  window.currentGameId = gameId;
  const game = games.find(g => g.id === gameId);
  // ...existing code...
  if (game.isPasswordProtected) {
    document.getElementById('passwordGate').classList.remove('hidden');
    document.getElementById('puzzleContainer').classList.add('hidden');
  } else {
    document.getElementById('passwordGate').classList.add('hidden');
    document.getElementById('puzzleContainer').classList.remove('hidden');
    renderPuzzles(game);
  }
  // ...existing code...
}
