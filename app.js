document.getElementById("year").textContent = new Date().getFullYear();

let currentGame = null;
let currentSearch = "";
let lastOpenedImageSrc = "";

function setTitleImageSize(width, maxWidth, maxHeight) {
  const titleImage = document.getElementById("gameTitleImage");
  if (!titleImage) return;
  titleImage.style.setProperty("--title-image-width", width);
  titleImage.style.setProperty("--title-image-max-width", maxWidth);
  titleImage.style.setProperty("--title-image-max-height", maxHeight);
}

function escapeAttr(value) {
  return String(value).replace(/"/g, "&quot;");
}

function closeMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const toggle = document.getElementById("navToggle");
  if (!menu || !toggle) return;
  menu.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");
  toggle.setAttribute("aria-expanded", "false");
}

function syncNavigation(route) {
  const normalizedRoute = route.startsWith("game/") ? "home" : route;
  const allButtons = document.querySelectorAll(".nav-btn, .mobile-nav-btn");
  allButtons.forEach((btn) => {
    if (btn.dataset.route === normalizedRoute) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function navigate(id, options = {}) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((p) => p.classList.add("hidden"));

  const targetId = id.startsWith("game/") ? "gameDetail" : id;
  const targetPage = document.getElementById(targetId) || document.getElementById("home");
  targetPage.classList.remove("hidden");

  const backButton = document.getElementById("btnBack");
  if (targetId === "gameDetail") {
    backButton.classList.remove("hidden");
  } else {
    backButton.classList.add("hidden");
  }

  syncNavigation(id);
  closeMobileMenu();

  if (!options.fromPopState) {
    history.pushState({ page: id }, "", `#${id}`);
  }

  if (!options.keepScrollPosition) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function renderGames(searchTerm = "") {
  const list = document.getElementById("gamesList");
  const noResults = document.getElementById("noResults");
  if (!list) return;

  const normalized = searchTerm.trim().toLowerCase();
  const filteredGames = games.filter((g) => {
    if (!normalized) return true;
    const haystack = `${g.title} ${g.shortDescription || ""} ${g.description || ""}`.toLowerCase();
    return haystack.includes(normalized);
  });

  list.innerHTML = "";

  filteredGames.forEach((g, index) => {
    const card = document.createElement("article");
    card.className = "game-card reveal";
    card.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `${g.title} ansehen`);
    card.setAttribute("onclick", `openGame(\"${escapeAttr(g.id)}\")`);

    card.innerHTML = `
      <img src="${g.titleImage}" alt="${g.title}" class="game-thumb" loading="lazy" />
      <div class="game-card-content">
        <h3>${g.title}</h3>
        <p class="muted">${g.shortDescription || ""}</p>
        <div class="game-meta">
          <span><strong>Spieldauer:</strong> ${g.playTime || "Auf Anfrage"}</span>
          <span><strong>Spieler:</strong> ${g.playerSize || "Auf Anfrage"}</span>
          <span><strong>Preis:</strong> ${g.priceLine1 || ""}${g.priceLine1 && g.priceLine2 ? " / " : ""}${g.priceLine2 || "Auf Anfrage"}</span>
        </div>
      </div>
    `;

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openGame(g.id);
      }
    });

    list.appendChild(card);
  });

  if (noResults) {
    if (filteredGames.length === 0) {
      noResults.classList.remove("hidden");
    } else {
      noResults.classList.add("hidden");
    }
  }

  applyRevealAnimation();
}

function populateOrHide(containerId, contentId, value) {
  const container = document.getElementById(containerId);
  const content = document.getElementById(contentId);
  if (!container || !content) return;

  if (value && String(value).trim() !== "") {
    container.style.display = "block";
    content.innerHTML = value;
  } else {
    container.style.display = "none";
  }
}

function openGame(id, options = {}) {
  const g = games.find((game) => game.id === id);
  if (!g) {
    navigate("home");
    return;
  }

  currentGame = g;

  if (!options.skipNavigation) {
    navigate(`game/${id}`);
  }

  document.getElementById("gameTitle").textContent = g.title;
  document.getElementById("gameDescription").innerHTML = g.description || "";

  const gameTitleImage = document.getElementById("gameTitleImage");
  gameTitleImage.src = g.titleImage;
  gameTitleImage.alt = `${g.title} Titelbild`;
  gameTitleImage.onclick = () => openImage(g.titleImage);

  populateOrHide("gameAvailableSinceContainer", "gameAvailableSince", g.availableSince);
  populateOrHide("gameBuiltOrBoughtContainer", "gameBuiltOrBought", g.builtOrBought);
  populateOrHide("gameRoomSizeContainer", "gameRoomSize", g.roomSize);
  populateOrHide("gameDifficultyContainer", "gameDifficulty", g.difficulty);
  populateOrHide("gameDurationContainer", "gameDuration", g.duration);
  populateOrHide("gamePlayableContainer", "gamePlayable", g.playable);
  populateOrHide("gamePlayerSizeContainer", "gamePlayerSize", g.playerSize);
  populateOrHide("gameSpecialFeaturesContainer", "gameSpecialFeatures", g.specialFeatures);
  populateOrHide("gameIdeaOriginContainer", "gameIdeaOrigin", g.ideaOrigin);

  const additionalImagesContainer = document.getElementById("additionalImagesContainer");
  const additionalImagesSection = document.getElementById("gameAdditionalImages");

  if (g.additionalImages && g.additionalImages.length > 0) {
    additionalImagesContainer.innerHTML = "";
    g.additionalImages.forEach((image) => {
      const imgElement = document.createElement("img");
      imgElement.src = image;
      imgElement.alt = `${g.title} Zusatzbild`;
      imgElement.loading = "lazy";
      imgElement.onclick = () => openImage(image);
      additionalImagesContainer.appendChild(imgElement);
    });
    additionalImagesSection.style.display = "block";
  } else {
    additionalImagesSection.style.display = "none";
  }

  setTitleImageSize("100%", "560px", "380px");

  const passwordGate = document.getElementById("passwordGate");
  const puzzleContainer = document.getElementById("puzzleContainer");
  const pwError = document.getElementById("pwError");

  pwError.classList.add("hidden");

  if (g.isPasswordProtected) {
    passwordGate.classList.remove("hidden");
    document.getElementById("pwInput").value = "";
    puzzleContainer.classList.add("hidden");
  } else {
    passwordGate.classList.add("hidden");
    puzzleContainer.classList.remove("hidden");
    renderPuzzles(g);
  }

  applyRevealAnimation();
}

function openImage(src) {
  if (!src) return;
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImage");
  modalImg.src = src;
  modal.style.display = "flex";
  lastOpenedImageSrc = src;

  if (location.hash !== "#img") {
    history.pushState({ modal: "img" }, "", "#img");
  }
}

function closeImage(skipHistoryBack = false) {
  const modal = document.getElementById("imgModal");
  modal.style.display = "none";

  if (!skipHistoryBack && location.hash === "#img") {
    history.back();
  }
}

function goHome() {
  const searchInput = document.getElementById("gameSearch");
  if (searchInput) {
    searchInput.value = "";
  }
  currentSearch = "";
  renderGames(currentSearch);
  navigate("home");
}

function renderPuzzles(game) {
  const container = document.getElementById("puzzleContainer");
  container.innerHTML = "";

  if (!game.puzzles || game.puzzles.length === 0) {
    return;
  }

  game.puzzles.forEach((puzzle, pIdx) => {
    const puzzleDetails = document.createElement("details");
    puzzleDetails.className = "puzzle-block reveal";

    const puzzleSummary = document.createElement("summary");
    puzzleSummary.innerHTML = `Ratsel ${pIdx + 1}`;
    puzzleDetails.appendChild(puzzleSummary);

    if (puzzle.image) {
      const img = document.createElement("img");
      img.src = puzzle.image;
      img.alt = `Ratsel ${pIdx + 1}`;
      img.loading = "lazy";
      img.onclick = () => openImage(puzzle.image);
      puzzleDetails.appendChild(img);
    }

    if (Array.isArray(puzzle.texts) && puzzle.texts.length > 0) {
      const hintsList = document.createElement("div");
      hintsList.className = "hints-list";

      puzzle.texts.forEach((hint, hIdx) => {
        const hintDetails = document.createElement("details");
        hintDetails.className = "hint-block";

        const hintSummary = document.createElement("summary");
        hintSummary.textContent = `Hinweis ${hIdx + 1}`;
        hintDetails.appendChild(hintSummary);

        const hintText = document.createElement("div");
        hintText.textContent = hint;
        hintDetails.appendChild(hintText);

        hintsList.appendChild(hintDetails);
      });

      puzzleDetails.appendChild(hintsList);
    }

    if (puzzle.solution) {
      const solutionDetails = document.createElement("details");
      solutionDetails.className = "solution-block";

      const solutionSummary = document.createElement("summary");
      solutionSummary.textContent = "Lösung anzeigen";
      solutionDetails.appendChild(solutionSummary);

      const solutionText = document.createElement("div");
      solutionText.textContent = puzzle.solution;
      solutionDetails.appendChild(solutionText);

      puzzleDetails.appendChild(solutionDetails);
    }

    container.appendChild(puzzleDetails);
  });

  applyRevealAnimation();
}

function handlePasswordSubmit() {
  if (!currentGame) return;

  if (!currentGame.isPasswordProtected) {
    document.getElementById("passwordGate").classList.add("hidden");
    document.getElementById("puzzleContainer").classList.remove("hidden");
    renderPuzzles(currentGame);
    return;
  }

  const input = document.getElementById("pwInput").value;
  const pwError = document.getElementById("pwError");

  if (input === currentGame.password) {
    pwError.classList.add("hidden");
    document.getElementById("passwordGate").classList.add("hidden");
    document.getElementById("puzzleContainer").classList.remove("hidden");
    renderPuzzles(currentGame);
  } else {
    pwError.classList.remove("hidden");
  }
}

function handleHashNavigation(fromPopState = false) {
  const hash = location.hash.replace("#", "") || "home";

  if (hash === "img") {
    if (lastOpenedImageSrc) {
      const modal = document.getElementById("imgModal");
      const modalImg = document.getElementById("modalImage");
      modalImg.src = lastOpenedImageSrc;
      modal.style.display = "flex";
    }
    return;
  }

  if (document.getElementById("imgModal").style.display === "flex") {
    closeImage(true);
    return;
  }

  if (hash.startsWith("game/")) {
    const gameId = hash.split("/")[1];
    if (gameId) {
      navigate(`game/${gameId}`, { fromPopState: true, keepScrollPosition: true });
      openGame(gameId, { skipNavigation: true });
      return;
    }
  }

  navigate(hash, { fromPopState: fromPopState || true, keepScrollPosition: true });

  if (hash === "home") {
    renderGames(currentSearch);
  }
}

function applyRevealAnimation() {
  const revealElements = document.querySelectorAll(".reveal:not(.in-view)");
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupNavigationHandlers() {
  const desktopNavButtons = document.querySelectorAll(".nav-btn");
  desktopNavButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.dataset.route;
      navigate(route);
      if (route === "home") renderGames(currentSearch);
    });
  });

  const mobileButtons = document.querySelectorAll(".mobile-nav-btn");
  mobileButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.dataset.route;
      navigate(route);
      if (route === "home") renderGames(currentSearch);
    });
  });

  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  navToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function setupSearch() {
  const searchInput = document.getElementById("gameSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value;
    renderGames(currentSearch);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupNavigationHandlers();
  setupSearch();

  document.getElementById("pwSubmit").addEventListener("click", handlePasswordSubmit);

  document.getElementById("pwInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handlePasswordSubmit();
    }
  });

  if (!location.hash) {
    history.replaceState({ page: "home" }, "", "#home");
  }

  renderGames();
  handleHashNavigation(true);
  applyRevealAnimation();
});

window.addEventListener("popstate", () => {
  handleHashNavigation(true);
});

window.addEventListener("hashchange", () => {
  handleHashNavigation(true);
});
