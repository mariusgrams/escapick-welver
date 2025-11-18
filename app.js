document.getElementById("year").textContent=new Date().getFullYear();

function navigate(id){document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');}

// Navigation Highlight
const navButtons=document.querySelectorAll('.nav-btn');
navButtons.forEach(btn=>btn.addEventListener('click',()=>{
  navButtons.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  navigate(btn.dataset.route);
}));

// Render Game List (Home & Grid)
function renderGames(){
  const list=document.getElementById('gamesList');
  const grid=document.getElementById('gamesGrid');
  list.innerHTML='';grid.innerHTML='';

  games.forEach(g=>{
    const card=`<div class='game-card' onclick="openGame('${g.id}')">
      <img src='${g.image}' class='game-thumb'/>
      <div><h3>${g.title}</h3><p class='muted'>${g.short}</p></div>
    </div>`;
    list.innerHTML+=card;
    grid.innerHTML+=card;
  });
}

function openGame(id){
  const g=games.find(x=>x.id===id);
  document.getElementById('gameTitle').textContent=g.title;
  document.getElementById('gameShort').textContent=g.short;
  document.getElementById('gameThumb').src=g.image;

  const hc=document.getElementById('hintsContainer');
  hc.innerHTML='';

  g.hints.forEach((h,i)=>{
    hc.innerHTML+=`
      <div class='accordion hint' id='hint${i}'>
        <button onclick="toggleHint(${i})">Hinweis ${i+1}</button>
        <div class='content'>
          <div class='photo'><img src='${h.image}' /></div>
          <p>${h.text}</p>
        </div>
      </div>`;
  });

  navigate('gameDetail');
}

function toggleHint(i){document.getElementById(`hint${i}`).classList.toggle('open');}

renderGames();
