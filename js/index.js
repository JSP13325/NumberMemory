const container = document.getElementById('card_container')
let cardList = []
let domList = []
const cardWidth = 196
const cardHeight = 256
let prevCardNumber = null;
let copyArr = [];

let panel = {
	currentLevel: 1, // 初始难度级别
	resetThreshold: 20, // 重置难度的阈值
	consecutiveCorrectGuesses: 0, // 用于跟踪连续正确次数
	totalCorrectGuesses: 0, // 总共正确次数
	totalPoint: 0, // 总共得分
};

Object.keys(panel).forEach(key => {
	let internalValue = panel[key];
	Object.defineProperty(panel, key, {
		get: function() {
			return internalValue;
		},
		set: function(newValue) {
			internalValue = newValue;
			handlePoint(key, newValue);
		}
	});
});

function countdown(callback, type) {
	handlePoint()
	const mark = document.querySelector('.mark');
	const judgment = document.querySelector('.judgment div');
	const secondsDisplay = mark.querySelector('span');
	judgment.style.display = 'block';
	setTimeout(() => {
		judgment.style.display = 'none';
		let seconds = 3;
		const countdownInterval = setInterval(() => {
			secondsDisplay.textContent = seconds;
			mark.style.display = 'flex';
			container.innerHTML = '';

			if (seconds > 0) {
				seconds--;
			} else {
				clearInterval(countdownInterval);
				secondsDisplay.textContent = '';
				mark.style.display = 'none';
				callback(type);
			}
		}, 1000);
	}, 1500);
}

function handlePoint(k, v) {
	const point = document.querySelectorAll('.point')
	point.forEach(dom => {
		const divInside = dom.querySelector('div');
		if (k == 'totalPoint'||dom.classList.contains('score')  ) {
			divInside.textContent = panel.totalPoint;
		}

		if (k == 'totalCorrectGuesses'||dom.classList.contains('correct')) {
			divInside.textContent = panel.totalCorrectGuesses;
		}

		if (k == 'currentLevel'||dom.classList.contains('rank')  ) {
			divInside.textContent = panel.currentLevel;
		}
		if (k == 'resetThreshold'||dom.classList.contains('leave')  ) {
			divInside.textContent = panel.resetThreshold;
		}
	});
}

function handleCorrectGuess() {
	panel.totalCorrectGuesses+=1;
	handlePoint()
}

function handleIncorrectGuess() {
	panel.consecutiveCorrectGuesses = 0;
}

function resetDifficulty() {
	panel.consecutiveCorrectGuesses = 0;
	panel.totalCorrectGuesses = 0;
	panel.currentLevel = 1;
	panel.totalPoint = 0;
	panel.resetThreshold = 20;
}

let minL = 3; // 最小值
let maxL = 8; // 最大值

function getRandomNumber(length = 3, size = 10) {
	let l = Math.min(length - panel.currentLevel, maxL);
	// if (currentLevel >= 2 && currentLevel % 2 === 0) {
	// 	minL += 1; 
	// }
	l = Math.min(maxL, Math.max(minL, l));
	const numberList = new Set();
	while (numberList.size < l) {
		numberList.add(Math.floor(Math.random() * size) + 1);
	}
	return Array.from(numberList);
}

function createdCard(number) {
	const cardItem = document.createElement('div')
	cardItem.className = 'card_item'
	cardItem.innerHTML = `
				<div class="cover">${number}</div>
				<div class="back"></div>
				`
	cardItem.dataset.number = number
	const backElement = cardItem.querySelector('.back');
	const coverElement = cardItem.querySelector('.cover');
	coverElement.style.transform = 'rotateY(0deg)';
	backElement.style.transform = 'rotateY(-180deg)';
	setTimeout(() => {
		coverElement.style.transform = 'rotateY(180deg)';
		backElement.style.transform = 'rotateY(0deg)';
		initializeCardClickHandlers();
	}, 2000);
	return cardItem
}

function createCardElements() {
	domList = cardList.map(cardNumber => createdCard(cardNumber));
	domList.forEach(dom => container.appendChild(dom));
	const itemCount = container.querySelectorAll('.card_item').length;
	container.style.maxWidth = '800px'
	container.style.gridAutoFlow = 'inherit'
	if (itemCount < 6) {
		container.style.maxWidth = '996px'
		container.style.gridAutoFlow = 'column'
	} else if (itemCount === 6) {
		container.style.gridTemplateColumns = 'repeat(3, 1fr)';
		container.style.gridAutoRows = '1fr';
	} else if (itemCount === 7) {
		container.style.gridTemplateColumns = 'repeat(4, 1fr)';
	} else if (itemCount === 8) {
		container.style.gridTemplateColumns = 'repeat(4, 1fr)';
		container.style.gridAutoRows = '1fr';
	}
}

function handleTotalPoint(min = 50, max = 100) {
	let scope = Math.floor(Math.random() * ((max * panel.currentLevel) - (min * panel.currentLevel) + 1)) + min;
	panel.totalPoint += panel.totalCorrectGuesses + scope
}

function handleClick(e) {
	let targetElement = e.target;
	while (targetElement.classList !== 'card_item' && !targetElement.dataset.number) {
		targetElement = targetElement.parentElement;
	}
	const coverElement = targetElement.querySelector('.cover');
	const backElement = targetElement.querySelector('.back');
	copyArr = copyArr.filter(num => num !== prevCardNumber)
	minNumber = Math.min(...copyArr);
	const currentCardNumber = parseInt(targetElement.dataset.number);
	if (prevCardNumber === currentCardNumber) return;

	let judgment = document.querySelector('.judgment div');
	if (currentCardNumber === minNumber) {
		handleTotalPoint()
		coverElement.style.transform = 'rotateY(0deg)';
		backElement.style.transform = 'rotateY(-180deg)';
		if (copyArr.length === 1) {
			judgment.className = 'correct';
			judgment.style.display = 'block'
			countdown(getNewCardsAndResetGame, 1)
		}
		handleCorrectGuess()
	} else {
		judgment.className = 'error';
		judgment.style.display = 'block'
		handleIncorrectGuess()
		coverElement.className = 'error';
		coverElement.style.transform = 'rotateY(0deg)';
		backElement.style.transform = 'rotateY(-180deg)';
		document.getElementById('card_container').removeEventListener('click', handleClick);
		countdown(getNewCardsAndResetGame, 0)
	}
	prevCardNumber = currentCardNumber;
}

function initializeCardClickHandlers() {
	document.getElementById('card_container').addEventListener('click', handleClick)
}

function getNewCardsAndResetGame(type) {
	if (type) {
		panel.consecutiveCorrectGuesses+=1;
		minL++;
		
		panel.currentLevel+=1;
		panel.consecutiveCorrectGuesses = 0; // 重置连续正确次数
		panel.resetThreshold-=1
	}
	
	if (panel.currentLevel >= panel.resetThreshold) {
		// 达到重置阈值，重置难度
		resetDifficulty();
	}
	// if (panel.consecutiveCorrectGuesses >= 2) {
	// 	// 连续正确两次，增加难度
	// 	panel.currentLevel+=1;
	// 	panel.consecutiveCorrectGuesses = 0; // 重置连续正确次数
	// 	panel.resetThreshold-=1
	// }
	resetGame()
	handlePoint()
}

function resetGame() {
	cardList = getRandomNumber(3, 50)
	domList = []
	copyArr = [...cardList];
	container.innerHTML = ''
	createCardElements()
}

countdown(resetGame)