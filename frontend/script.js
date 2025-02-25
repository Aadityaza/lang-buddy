const allWordPairs = [
    { eng: "we", foreign: "wir" },
    { eng: "speak", foreign: "sprecht" },
    { eng: "bread", foreign: "Brot" },
    { eng: "a", foreign: "ein" },
    { eng: "men", foreign: "Männer" },
    { eng: "woman", foreign: "Frau" },
    { eng: "child", foreign: "Kind" },
    { eng: "water", foreign: "Wasser" },
    { eng: "book", foreign: "Buch" },
    { eng: "house", foreign: "Haus" },
    { eng: "dog", foreign: "Hund" },
    { eng: "cat", foreign: "Katze" },
    { eng: "food", foreign: "Essen" },
    { eng: "drink", foreign: "trinken" },
    { eng: "run", foreign: "laufen" }
  ];
  
  let availablePairs = [];
  let activePairs = [];
  let cards = { left: [], right: [] };
  let selectedCard = null;
  let mistakes = 0;
  let gameOver = false;
  let animatingCards = new Set();
  let matchedCards = new Set();
  let correctMatches = 0;
  
  const leftColumnEl = document.getElementById('leftColumn');
  const rightColumnEl = document.getElementById('rightColumn');
  const progressFillEl = document.getElementById('progressFill');
  const matchesCounterEl = document.getElementById('matchesCounter');
  const triesCounterEl = document.getElementById('triesCounter');
  const resetButtonEl = document.getElementById('resetButton');
  const dialogOverlayEl = document.getElementById('dialogOverlay');
  const dialogTitleEl = document.getElementById('dialogTitle');
  const dialogDescriptionEl = document.getElementById('dialogDescription');
  const statsListEl = document.getElementById('statsList');
  const dialogButtonEl = document.getElementById('dialogButton');
  
  function setUpVoice() {
    if (window.speechSynthesis.getVoices().length > 0) {
      const voices = window.speechSynthesis.getVoices();
      germanVoice = voices.find(voice => 
        voice.lang.includes('de') || voice.name.includes('Deutsch') || voice.name.includes('German')
      );
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        germanVoice = voices.find(voice => 
          voice.lang.includes('de') || voice.name.includes('Deutsch') || voice.name.includes('German')
        );
      };
    }
  }
  
  function speakWord(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'de-DE';
    utterance.rate = 0.8;
    if (germanVoice) utterance.voice = germanVoice;
    window.speechSynthesis.speak(utterance);
  }
  
  function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  function createCardElement(card) {
    const cardEl = document.createElement('button');
    cardEl.className = 'card';
    cardEl.textContent = card.word;
    cardEl.dataset.id = card.id;
    cardEl.dataset.pairId = card.pairId;
    cardEl.dataset.column = card.column;
    cardEl.addEventListener('click', () => handleCardClick(card, cardEl));
    return cardEl;
  }
  
  function renderCards() {
    leftColumnEl.innerHTML = '';
    rightColumnEl.innerHTML = '';
    cards.left.forEach(card => leftColumnEl.appendChild(createCardElement(card)));
    cards.right.forEach(card => rightColumnEl.appendChild(createCardElement(card)));
  }
  
  function updateUI() {
    const progress = ((allWordPairs.length - availablePairs.length) / allWordPairs.length) * 100;
    progressFillEl.style.width = `${progress}%`;
    matchesCounterEl.textContent = `Matches: ${correctMatches}/3`;
    triesCounterEl.textContent = `${5 - mistakes} tries left`;
  }
  
  function showSummary() {
    const setsCompleted = Math.floor((allWordPairs.length - availablePairs.length) / 5);
    if (mistakes >= 5) {
      dialogTitleEl.textContent = 'Game Over!';
      dialogDescriptionEl.textContent = 'You made 5 mistakes. Try again!';
    } else {
      dialogTitleEl.textContent = 'Congratulations!';
      dialogDescriptionEl.textContent = 'You matched all the pairs!';
    }
    statsListEl.innerHTML = `
      <p class="stats-item">Sets Completed: ${setsCompleted}</p>
      <p class="stats-item">Mistakes Made: ${mistakes}/5</p>
    `;
    dialogOverlayEl.classList.add('visible');
  }
  
  function hideSummary() {
    dialogOverlayEl.classList.remove('visible');
  }
  
  function findCardElement(cardId) {
    return document.querySelector(`[data-id="${cardId}"]`);
  }
  
  async function handleCardClick(card, cardEl) {
    if (gameOver || animatingCards.has(card.id) || matchedCards.has(card.id)) return;
  
    if (!selectedCard) {
      selectedCard = card;
      cardEl.classList.add('selected');
      return;
    }
  
    if (selectedCard.column === card.column) {
      const prevSelectedCard = selectedCard;
      selectedCard = card;
      findCardElement(prevSelectedCard.id)?.classList.remove('selected');
      cardEl.classList.add('selected');
      return;
    }
  
    const firstCardEl = findCardElement(selectedCard.id);
    if (!firstCardEl) return;
    animatingCards.add(selectedCard.id);
    animatingCards.add(card.id);
    firstCardEl.classList.remove('selected');
  
    if (selectedCard.pairId === card.pairId) {
      firstCardEl.classList.add('success');
      cardEl.classList.add('success');
      matchedCards.add(selectedCard.id);
      matchedCards.add(card.id);
      correctMatches++;
      updateUI();
      speakWord(card.column === 'right' ? card.word : selectedCard.word);
      await new Promise(resolve => setTimeout(resolve, 500));
      firstCardEl.classList.remove('success');
      cardEl.classList.remove('success');
      firstCardEl.classList.add('matched');
      cardEl.classList.add('matched');
      // disapear after      |
      if (correctMatches === 5 && availablePairs.length >= 5) { 
        await new Promise(resolve => setTimeout(resolve, 800));
        const newPairs = availablePairs.slice(0, 5);
        availablePairs = availablePairs.slice(5);
        activePairs = newPairs;
        cards = {
          left: newPairs.map((pair, idx) => ({
            id: `left-${idx}-${Date.now()}`,
            word: pair.eng,
            pairId: idx,
            column: 'left'
          })).sort(() => Math.random() - 0.5),
          right: newPairs.map((pair, idx) => ({
            id: `right-${idx}-${Date.now()}`,
            word: pair.foreign,
            pairId: idx,
            column: 'right'
          })).sort(() => Math.random() - 0.5)
        };
        correctMatches = 0;
        matchedCards = new Set();
        renderCards();
        updateUI();
      }
    } else {
      firstCardEl.classList.add('error');
      cardEl.classList.add('error');
      mistakes++;
      updateUI();
      await new Promise(resolve => setTimeout(resolve, 2000));
      firstCardEl.classList.remove('error');
      cardEl.classList.remove('error');
      if (mistakes >= 5) {
        gameOver = true;
        showSummary();
      }
    }
    selectedCard = null;
    animatingCards.delete(selectedCard.id);
    animatingCards.delete(card.id);
  }
  
  function initializeGame() {
    const shuffled = shuffle(allWordPairs);
    availablePairs = shuffled.slice(5);
    activePairs = shuffled.slice(0, 5);
    const leftColumn = shuffled.slice(0, 5).map((pair, idx) => ({
      id: `left-${idx}`,
      word: pair.eng,
      pairId: idx,
      column: 'left'
    }));
    const rightColumn = shuffled.slice(0, 5).map((pair, idx) => ({
      id: `right-${idx}`,
      word: pair.foreign,
      pairId: idx,
      column: 'right'
    }));
    cards = {
      left: shuffle(leftColumn),
      right: shuffle(rightColumn)
    };
    selectedCard = null;
    mistakes = 0;
    gameOver = false;
    animatingCards = new Set();
    matchedCards = new Set();
    correctMatches = 0;
    renderCards();
    updateUI();
    hideSummary();
  }
  
  resetButtonEl.addEventListener('click', initializeGame);
  dialogButtonEl.addEventListener('click', initializeGame);
  
  setUpVoice();
  initializeGame();