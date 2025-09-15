let currentUser = null;
let currentLanguage = 'pt';
let currentTheme = 'cultura';
let targetWord = '';
let currentRow = 0;
let currentTile = 0;
let gameOver = false;
let points = 0;
let streak = 0;
let totalPoints = 0;
let totalXP = 0;
let totalTP = 0;
let coins = 100;
let inventory = [];
let achievementsUnlocked = [];
let gamesPlayed = 0;
let gamesWon = 0;
let perfectWins = 0;
let fastGames = 0;
let dailyPoints = 0;
let weeklyPoints = 0;
let themesPlayed = new Set();
let languagesPlayed = new Set();

const translations = {
  pt: { title: "WordRush", win: "Parabéns! 🎉", lose: "A palavra era", try: "tentativa", points: "pontos" },
  en: { title: "WordRush", win: "Congratulations! 🎉", lose: "The word was", try: "try", points: "points" },
  es: { title: "WordRush", win: "¡Felicidades! 🎉", lose: "La palabra era", try: "intento", points: "puntos" }
};

async function login() {
  const name = document.getElementById('username').value.trim();
  if (!name) return alert("Digite um nome!");
  currentLanguage = document.getElementById('language-select').value;

  try {
    const email = `${name}@wordrush.temp`;
    const password = "wordrush123";

    let userCredential;
    try {
      userCredential = await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      userCredential = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection("players").doc(userCredential.user.uid).set({
        name: name,
        email: email,
        language: currentLanguage,
        points: 0,
        totalPoints: 0,
        streak: 0,
        level: 1,
        xp: 0,
        tp: 0,
        coins: 100,
        inventory: [],
        achievements: [],
        gamesPlayed: 0,
        gamesWon: 0,
        perfectWins: 0,
        fastGames: 0,
        dailyPoints: 0,
        weeklyPoints: 0,
        league: "Bronze",
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    currentUser = { id: userCredential.user.uid, name: name, email: email };
    await loadPlayerData();
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('user-display').textContent = name;
    updateTitle();
    startGame();
    document.getElementById('splash').style.display = 'none';
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao fazer login.");
  }
}

async function loadPlayerData() {
  const doc = await db.collection("players").doc(currentUser.id).get();
  if (doc.exists) {
    const data = doc.data();
    totalPoints = data.totalPoints || 0;
    streak = data.streak || 0;
    totalXP = data.xp || 0;
    totalTP = data.tp || 0;
    coins = data.coins || 100;
    inventory = data.inventory || [];
    achievementsUnlocked = data.achievements || [];
    gamesPlayed = data.gamesPlayed || 0;
    gamesWon = data.gamesWon || 0;
    perfectWins = data.perfectWins || 0;
    fastGames = data.fastGames || 0;
    dailyPoints = data.dailyPoints || 0;
    weeklyPoints = data.weeklyPoints || 0;
    if (data.themesPlayed) themesPlayed = new Set(data.themesPlayed);
    if (data.languagesPlayed) languagesPlayed = new Set(data.languagesPlayed);
    updateUI();
  }
}

function updateUI() {
  document.getElementById('points-display').textContent = `${totalPoints} pts`;
  document.getElementById('streak-display').textContent = `🔥 ${streak}`;
  document.getElementById('coins-display').textContent = `💰 ${coins}`;
}

function startGame() {
  const themeIndex = Math.floor(Math.random() * 3);
  currentTheme = themes[currentLanguage][themeIndex];
  targetWord = getDailyWord(currentLanguage, currentTheme);
  languagesPlayed.add(currentLanguage);
  themesPlayed.add(currentTheme);
  document.getElementById('current-theme').textContent = currentTheme;
  document.getElementById('day').textContent = Math.floor(Date.now() / (3 * 60 * 60 * 1000));
  renderGrid();
  renderKeyboard();
  updateTitle();
  gameOver = false;
  currentRow = 0;
  currentTile = 0;
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      row.appendChild(tile);
    }
    grid.appendChild(row);
  }
}

function renderKeyboard() {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  const keys = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Enter','Z','X','C','V','B','N','M','⌫']
  ];

  keys.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'key-row';
    row.forEach(key => {
      const keyDiv = document.createElement('div');
      keyDiv.className = 'key';
      keyDiv.textContent = key;
      keyDiv.addEventListener('click', () => handleKey(key));
      rowDiv.appendChild(keyDiv);
    });
    keyboard.appendChild(rowDiv);
  });
}

function handleKey(key) {
  if (gameOver) return;
  const tiles = document.querySelectorAll('.row')[currentRow].querySelectorAll('.tile');

  if (key === '⌫') {
    if (currentTile > 0) {
      currentTile--;
      tiles[currentTile].textContent = '';
    }
    return;
  }

  if (key === 'Enter') {
    if (currentTile !== 5) return;
    const attempt = [...tiles].map(t => t.textContent.toLowerCase()).join('');
    if (!isValidWord(attempt)) {
      showMessage("Palavra inválida!");
      return;
    }
    checkWord(attempt);
    currentRow++;
    currentTile = 0;
    if (attempt === targetWord) {
      endGame(true);
    } else if (currentRow >= 10) {
      endGame(false);
    }
    return;
  }

  if (currentTile < 5) {
    tiles[currentTile].textContent = key;
    currentTile++;
  }
}

function isValidWord(word) {
  return word.length === 5;
}

function checkWord(word) {
  const tiles = document.querySelectorAll('.row')[currentRow].querySelectorAll('.tile');
  const targetLetters = targetWord.split('');
  const attemptLetters = word.split('');
  const status = Array(5).fill('wrong');

  for (let i = 0; i < 5; i++) {
    if (attemptLetters[i] === targetLetters[i]) {
      status[i] = 'correct';
      targetLetters[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (status[i] !== 'correct' && targetLetters.includes(attemptLetters[i])) {
      status[i] = 'present';
      const index = targetLetters.indexOf(attemptLetters[i]);
      targetLetters[index] = null;
    }
  }

  tiles.forEach((tile, i) => {
    tile.classList.add(status[i]);
  });
}

async function endGame(win) {
  gameOver = true;
  let earnedPoints = 0;

  if (win) {
    earnedPoints = 100 - (currentRow * 10);
    showMessage(`${translations[currentLanguage].win} ${earnedPoints} ${translations[currentLanguage].points}!`);
    streak++;
    gamesWon++;
    if (currentRow === 0) perfectWins++;
    checkAchievement("Primeiro Passo", 50, 10);
    if (streak >= 7) checkAchievement("7 Dias Seguidos", 200, 40);
  } else {
    showMessage(`${translations[currentLanguage].lose}: ${targetWord.toUpperCase()}`);
    streak = 0;
  }

  points += earnedPoints;
  totalPoints += earnedPoints;
  dailyPoints += earnedPoints;
  weeklyPoints += earnedPoints;
  gamesPlayed++;
  coins += win ? 10 : 5;

  await saveProgress();
  updateUI();
}

async function saveProgress() {
  if (!currentUser || !currentUser.id) return;
  await db.collection("players").doc(currentUser.id).update({
    points: totalPoints,
    totalPoints: totalPoints,
    streak: streak,
    xp: totalXP,
    tp: totalTP,
    coins: coins,
    inventory: inventory,
    achievements: achievementsUnlocked,
    gamesPlayed: gamesPlayed,
    gamesWon: gamesWon,
    perfectWins: perfectWins,
    fastGames: fastGames,
    dailyPoints: dailyPoints,
    weeklyPoints: weeklyPoints,
    themesPlayed: [...themesPlayed],
    languagesPlayed: [...languagesPlayed],
    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function checkAchievement(name, xp, tp) {
  if (!achievementsUnlocked.includes(name)) {
    achievementsUnlocked.push(name);
    totalXP += xp;
    totalTP += tp;
    coins += 50;
    showMessage(`🏆 Conquista: ${name}! +${xp} XP`);
    saveProgress();
  }
}

function showMessage(text) {
  document.getElementById('message').textContent = text;
  setTimeout(() => document.getElementById('message').textContent = '', 3000);
}

function updateTitle() {
  document.getElementById('title').textContent = `${translations[currentLanguage].title} #${Math.floor(Date.now() / (3 * 60 * 60 * 1000))}`;
}

function changeLanguage() {
  const langs = ['pt', 'en', 'es'];
  const currentIndex = langs.indexOf(currentLanguage);
  currentLanguage = langs[(currentIndex + 1) % 3];
  updateTitle();
  startGame();
}

function showGlobalRanking() {
  if (typeof showRanking === 'function') showRanking();
}

function showMultiplayerMenu() {
  if (typeof showMultiplayer === 'function') showMultiplayer();
}

function showShop() {
  if (typeof showShopModal === 'function') showShopModal();
}

function showStats() {
  if (typeof showStatistics === 'function') showStatistics();
}

function toggleStats() {
  showStats();
}

function startLightningMode() {
  if (typeof startLightning === 'function') startLightning();
}