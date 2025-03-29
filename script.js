const CELL_TYPES = {
    EMPTY: 0,
    WALL: 1,
    BALL: 2,
    TARGET: 3,
    MOVABLE: 4,
    ONE_WAY_UP: 5,
    ONE_WAY_DOWN: 6,
    ONE_WAY_LEFT: 7,
    ONE_WAY_RIGHT: 8,
    PORTAL_A: 9,
    PORTAL_B: 10
};

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

const settings = {
    soundEnabled: true,
    volume: 70,
    animationSpeed: 5,
    theme: 'dark',
    highScores: [],
    completedLevels: [],
    currentLevelStats: {},
    movementMode: 'full'
};

let gameState = {
    currentLevel: 0,
    grid: [],
    ball: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    portals: [],
    moves: 0,
    moveLimit: 0,
    currentGravity: DIRECTIONS.DOWN,
    isAnimating: false,
    isLevelComplete: false,
    startTime: 0,
    elapsedTime: 0,
    timerInterval: null
};

const levels = [
    {
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 4, 0, 1],
            [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 4, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 3, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        moveLimit: 10,
        name: "Block Push",
        description: "Learn to push blocks with gravity"
    },
    {
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 2, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 4, 0, 4, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 3, 0, 1, 0, 0, 6, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        moveLimit: 15,
        name: "One-Way Path",
        description: "Use one-way tiles to navigate"
    },
    {
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 9, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 2, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 1, 1, 0, 0, 1],
            [1, 10, 0, 0, 0, 0, 0, 0, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        moveLimit: 20,
        name: "Portal Jump",
        description: "Use portals to teleport across the map"
    },
    {
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 8, 0, 0, 5, 0, 0, 1],
            [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 2, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
            [1, 0, 0, 7, 0, 3, 6, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        moveLimit: 20,
        name: "One-Way Maze",
        description: "Navigate through a maze of one-way tiles"
    },
    {
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 2, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 9, 1],
            [1, 0, 0, 0, 4, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 4, 0, 0, 0, 0, 1],
            [1, 10, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        moveLimit: 25,
        name: "Block and Portal",
        description: "Combine block pushing and portals"
    },
    {
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 6, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 0, 0, 1],
            [1, 0, 9, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 4, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 2, 0, 0, 0, 10, 1],
            [1, 5, 0, 1, 0, 1, 0, 0, 0, 1],
            [1, 1, 0, 1, 0, 1, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        moveLimit: 30,
        name: "Advanced Challenge",
        description: "Combine all mechanics in a complex puzzle"
    }
];

const sounds = {
    move: document.getElementById('move-sound'),
    block: document.getElementById('block-sound'),
    portal: document.getElementById('portal-sound'),
    win: document.getElementById('win-sound'),
    fail: document.getElementById('fail-sound'),
    background: document.getElementById('background-music')
};

const gameBoard = document.getElementById('game-board');
const levelNumber = document.getElementById('level-number');
const movesCount = document.getElementById('moves-count');
const movesLimit = document.getElementById('moves-limit');
const messageArea = document.getElementById('message-area');
const restartBtn = document.getElementById('restart-btn');
const nextLevelBtn = document.getElementById('next-level-btn');
const levelSelectBtn = document.getElementById('level-select-btn');
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const soundToggle = document.getElementById('sound-toggle');
const settingsBtn = document.getElementById('settings-btn');
const timerDisplay = document.getElementById('timer-display');
const levelSelectModal = document.getElementById('level-select-modal');
const settingsModal = document.getElementById('settings-modal');
const winModal = document.getElementById('win-modal');
const levelGrid = document.getElementById('level-grid');
const animationSpeedSlider = document.getElementById('animation-speed');
const themeSelect = document.getElementById('theme-select');
const soundVolumeSlider = document.getElementById('sound-volume');
const particlesContainer = document.getElementById('particles-container');
const movementModeBtn = document.getElementById('movement-mode-btn');
const defaultMovementSelect = document.getElementById('default-movement');

function setTheme(themeName) {
    // Save the previous theme for transition effect
    const previousTheme = settings.theme;
    
    // Update theme setting
    settings.theme = themeName;
    
    // Apply theme to body with a transition
    document.body.classList.add('theme-transitioning');
    document.body.classList.remove(previousTheme + '-theme');
    document.body.classList.add(themeName + '-theme');
    
    // Remove transition class after animation completes
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 500);
    
    // Save settings
    saveSettings();
    
    // Play a sound for feedback
    playSound('move');
}

function toggleSound() {
    settings.soundEnabled = !settings.soundEnabled;
    soundToggle.innerHTML = settings.soundEnabled ? 
        '<i class="fas fa-volume-up"></i>' : 
        '<i class="fas fa-volume-mute"></i>';
    
    if (settings.soundEnabled) {
        sounds.background.volume = settings.volume / 100;
        sounds.background.play();
    } else {
        sounds.background.pause();
    }
    
    saveSettings();
}

function playSound(soundName) {
    if (settings.soundEnabled && sounds[soundName]) {
        const sound = sounds[soundName];
        sound.volume = settings.volume / 100;
        sound.currentTime = 0;
        sound.play();
    }
}

function showModal(modal) {
    modal.classList.add('show');
}

function hideModal(modal) {
    modal.classList.remove('show');
}

function initGame() {
    loadSettings();
    
    setTheme(settings.theme);
    themeSelect.value = settings.theme;
    
    animationSpeedSlider.value = settings.animationSpeed;
    
    soundVolumeSlider.value = settings.volume;
    
    defaultMovementSelect.value = settings.movementMode;
    updateMovementModeUI();
    
    if (settings.soundEnabled) {
        soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        sounds.background.volume = settings.volume / 100;
        sounds.background.play();
    } else {
        soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    
    populateLevelSelect();
    
    setupEventListeners();
    
    const savedLevel = parseInt(localStorage.getItem('currentLevel')) || 0;
    const startingLevel = savedLevel < levels.length ? savedLevel : 0;
    
    loadLevel(startingLevel);
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyPress);
    upBtn.addEventListener('click', () => changeGravity(DIRECTIONS.UP));
    downBtn.addEventListener('click', () => changeGravity(DIRECTIONS.DOWN));
    leftBtn.addEventListener('click', () => changeGravity(DIRECTIONS.LEFT));
    rightBtn.addEventListener('click', () => changeGravity(DIRECTIONS.RIGHT));
    
    restartBtn.addEventListener('click', restartLevel);
    nextLevelBtn.addEventListener('click', loadNextLevel);
    levelSelectBtn.addEventListener('click', () => showModal(levelSelectModal));
    
    soundToggle.addEventListener('click', toggleSound);
    settingsBtn.addEventListener('click', () => showModal(settingsModal));
    
    movementModeBtn.addEventListener('click', toggleMovementMode);
    
    themeSelect.addEventListener('change', () => setTheme(themeSelect.value));
    animationSpeedSlider.addEventListener('input', () => {
        settings.animationSpeed = parseInt(animationSpeedSlider.value);
        saveSettings();
    });
    soundVolumeSlider.addEventListener('input', () => {
        settings.volume = parseInt(soundVolumeSlider.value);
        if (settings.soundEnabled) {
            sounds.background.volume = settings.volume / 100;
        }
        saveSettings();
    });
    defaultMovementSelect.addEventListener('change', () => {
        settings.movementMode = defaultMovementSelect.value;
        updateMovementModeUI();
        saveSettings();
    });
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal);
        });
    });
    
    document.getElementById('win-restart').addEventListener('click', () => {
        hideModal(winModal);
        restartLevel();
    });
    
    document.getElementById('win-next').addEventListener('click', () => {
        hideModal(winModal);
        loadNextLevel();
    });
}

function toggleMovementMode() {
    settings.movementMode = settings.movementMode === 'full' ? 'step' : 'full';
    
    updateMovementModeUI();
    
    saveSettings();
    
    const modeMessage = settings.movementMode === 'full' 
        ? "Full Movement: Ball will move until it hits an obstacle"
        : "Step Movement: Ball will move only one tile at a time";
    showMessage(modeMessage);
    
    playSound('move');
    
    movementModeBtn.classList.add('highlight');
    setTimeout(() => {
        movementModeBtn.classList.remove('highlight');
    }, 500);
}

function updateMovementModeUI() {
    // Update toggle button appearance
    if (settings.movementMode === 'step') {
        movementModeBtn.classList.add('step-mode');
        document.querySelector('.mode-indicator.step').classList.add('active');
        document.querySelector('.mode-indicator.full').classList.remove('active');
    } else {
        movementModeBtn.classList.remove('step-mode');
        document.querySelector('.mode-indicator.full').classList.add('active');
        document.querySelector('.mode-indicator.step').classList.remove('active');
    }
    
    // Update settings dropdown
    defaultMovementSelect.value = settings.movementMode;
    
    // Update any UI elements that need to display the current mode
    const modeDisplays = document.querySelectorAll('.current-mode-display');
    if (modeDisplays.length > 0) {
        modeDisplays.forEach(display => {
            display.textContent = settings.movementMode === 'full' ? 'Full' : 'Step';
        });
    }
}

function saveSettings() {
    const settingsJSON = JSON.stringify(settings);
    
    localStorage.setItem('gameSettings', settingsJSON);
}

function loadSettings() {
    const savedSettings = localStorage.getItem('gameSettings');
    
    if (savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings);
            
            Object.assign(settings, parsedSettings);
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    }
}

function populateLevelSelect() {
    levelGrid.innerHTML = '';
    
    levels.forEach((level, index) => {
        const levelTile = document.createElement('div');
        levelTile.className = 'level-tile';
        
        if (settings.completedLevels.includes(index)) {
            levelTile.classList.add('completed');
        }
        
        if (index === gameState.currentLevel) {
            levelTile.classList.add('current');
        }
        
        levelTile.textContent = index + 1;
        
        levelTile.addEventListener('click', () => {
            loadLevel(index);
            hideModal(levelSelectModal);
        });
        
        levelGrid.appendChild(levelTile);
    });
}

function startTimer() {
    stopTimer();
    
    gameState.startTime = Date.now() - gameState.elapsedTime;
    
    gameState.timerInterval = setInterval(updateTimer, 1000);
    
    updateTimer();
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        
        gameState.timerInterval = null;
    }
}

function updateTimer() {
    gameState.elapsedTime = Date.now() - gameState.startTime;
    
    const totalSeconds = Math.floor(gameState.elapsedTime / 1000);
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerDisplay.textContent = formattedTime;
}

function loadLevel(levelIndex) {
    if (levelIndex >= levels.length) {
        showMessage("Congratulations! You've completed all levels!");
        return;
    }
    
    gameState = {
        currentLevel: levelIndex,
        grid: [],
        ball: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
        portals: [],
        moves: 0,
        moveLimit: levels[levelIndex].moveLimit,
        currentGravity: DIRECTIONS.DOWN,
        isAnimating: false,
        isLevelComplete: false,
        startTime: 0,
        elapsedTime: 0,
        timerInterval: null
    };
    
    localStorage.setItem('currentLevel', levelIndex);
    
    gameState.grid = levels[levelIndex].grid.map(row => [...row]);
    
    findSpecialCells();
    
    levelNumber.textContent = levelIndex + 1;
    movesCount.textContent = gameState.moves;
    movesLimit.textContent = gameState.moveLimit;
    nextLevelBtn.disabled = true;
    messageArea.textContent = `Level ${levelIndex + 1}: ${levels[levelIndex].description}`;
    
    startTimer();
    
    populateLevelSelect();
    
    renderGame();
}

function findSpecialCells() {
    gameState.portals = [];
    
    for (let y = 0; y < gameState.grid.length; y++) {
        for (let x = 0; x < gameState.grid[y].length; x++) {
            if (gameState.grid[y][x] === CELL_TYPES.BALL) {
                gameState.ball = { x, y };
                gameState.grid[y][x] = CELL_TYPES.EMPTY;
            } else if (gameState.grid[y][x] === CELL_TYPES.TARGET) {
                gameState.target = { x, y };
            } else if (gameState.grid[y][x] === CELL_TYPES.PORTAL_A || gameState.grid[y][x] === CELL_TYPES.PORTAL_B) {
                gameState.portals.push({ x, y, type: gameState.grid[y][x] });
            }
        }
    }
}

function renderGame() {
    gameBoard.innerHTML = '';

    const gridSize = gameState.grid.length;
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            switch (gameState.grid[y][x]) {
                case CELL_TYPES.WALL:
                    cell.classList.add('wall');
                    break;
                case CELL_TYPES.TARGET:
                    cell.classList.add('target');
                    break;
                case CELL_TYPES.MOVABLE:
                    cell.classList.add('movable');
                    break;
                case CELL_TYPES.ONE_WAY_UP:
                    cell.classList.add('one-way-up');
                    break;
                case CELL_TYPES.ONE_WAY_DOWN:
                    cell.classList.add('one-way-down');
                    break;
                case CELL_TYPES.ONE_WAY_LEFT:
                    cell.classList.add('one-way-left');
                    break;
                case CELL_TYPES.ONE_WAY_RIGHT:
                    cell.classList.add('one-way-right');
                    break;
                case CELL_TYPES.PORTAL_A:
                    cell.classList.add('portal-a');
                    break;
                case CELL_TYPES.PORTAL_B:
                    cell.classList.add('portal-b');
                    break;
                default:
                    cell.classList.add('empty');
            }

            if (x === gameState.ball.x && y === gameState.ball.y) {
                cell.classList.add('ball');
                const ballObject = document.createElement('div');
                ballObject.className = 'ball-object';
                cell.appendChild(ballObject);
            }

            cell.dataset.x = x;
            cell.dataset.y = y;

            gameBoard.appendChild(cell);
        }
    }
}

function handleKeyPress(event) {
    if (gameState.isAnimating || gameState.isLevelComplete) return;

    switch (event.key) {
        case 'ArrowUp':
            changeGravity(DIRECTIONS.UP);
            break;
        case 'ArrowDown':
            changeGravity(DIRECTIONS.DOWN);
            break;
        case 'ArrowLeft':
            changeGravity(DIRECTIONS.LEFT);
            break;
        case 'ArrowRight':
            changeGravity(DIRECTIONS.RIGHT);
            break;
        case 'r':
        case 'R':
            restartLevel();
            break;
    }
}

function changeGravity(direction) {
    if (gameState.isAnimating || gameState.isLevelComplete) return;
    
    if (gameState.currentGravity.x === direction.x && 
        gameState.currentGravity.y === direction.y) return;

    highlightActiveDirection(direction);

    gameState.currentGravity = direction;
    gameState.moves++;
    movesCount.textContent = gameState.moves;
    
    playSound('move');
    
    moveBall();
    
    checkWinCondition();
    
    if (gameState.moves >= gameState.moveLimit && !gameState.isLevelComplete) {
        playSound('fail');
        showMessage("Out of moves! Try again.");
    }
}

function highlightActiveDirection(direction) {
    [upBtn, downBtn, leftBtn, rightBtn].forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (direction === DIRECTIONS.UP) upBtn.classList.add('active');
    else if (direction === DIRECTIONS.DOWN) downBtn.classList.add('active');
    else if (direction === DIRECTIONS.LEFT) leftBtn.classList.add('active');
    else if (direction === DIRECTIONS.RIGHT) rightBtn.classList.add('active');
}

function moveBall() {
    gameState.isAnimating = true;
    
    let hasMoved = false;
    let hasTeleported = false;
    let ballPositionX = gameState.ball.x;
    let ballPositionY = gameState.ball.y;
    
    const animationDuration = 300 / settings.animationSpeed;
    
    const ballMovementPath = [];
    
    const useStepByStepMode = settings.movementMode === 'step';
    let stepsCompleted = 0;
    
    while (true) {
        let nextPositionX = ballPositionX + gameState.currentGravity.x;
        let nextPositionY = ballPositionY + gameState.currentGravity.y;
        
        if (nextPositionX < 0 || nextPositionX >= gameState.grid[0].length || 
            nextPositionY < 0 || nextPositionY >= gameState.grid.length) {
            break;
        }
        
        const nextCellType = gameState.grid[nextPositionY][nextPositionX];
        
        if (nextCellType === CELL_TYPES.WALL) {
            break;
        } else if (nextCellType === CELL_TYPES.MOVABLE) {
            if (canPushBlock(nextPositionX, nextPositionY)) {
                pushBlocks(nextPositionX, nextPositionY);
                playSound('block');
                hasMoved = true;
                
                ballPositionX = nextPositionX;
                ballPositionY = nextPositionY;
                
                ballMovementPath.push({ x: nextPositionX, y: nextPositionY, portal: false });
                
                if (useStepByStepMode) {
                    stepsCompleted++;
                    if (stepsCompleted >= 1) break;
                }
            } else {
                break;
            }
        } else if (nextCellType === CELL_TYPES.ONE_WAY_UP) {
            if (gameState.currentGravity.y === -1 && gameState.currentGravity.x === 0) {
                hasMoved = true;
                
                ballPositionX = nextPositionX;
                ballPositionY = nextPositionY;
                
                ballMovementPath.push({ x: nextPositionX, y: nextPositionY, portal: false });
                
                if (useStepByStepMode) {
                    stepsCompleted++;
                    if (stepsCompleted >= 1) break;
                }
            } else {
                break;
            }
        } else if (nextCellType === CELL_TYPES.ONE_WAY_DOWN) {
            if (gameState.currentGravity.y === 1 && gameState.currentGravity.x === 0) {
                hasMoved = true;
                
                ballPositionX = nextPositionX;
                ballPositionY = nextPositionY;
                
                ballMovementPath.push({ x: nextPositionX, y: nextPositionY, portal: false });
                
                if (useStepByStepMode) {
                    stepsCompleted++;
                    if (stepsCompleted >= 1) break;
                }
            } else {
                break;
            }
        } else if (nextCellType === CELL_TYPES.ONE_WAY_LEFT) {
            if (gameState.currentGravity.x === -1 && gameState.currentGravity.y === 0) {
                hasMoved = true;
                
                ballPositionX = nextPositionX;
                ballPositionY = nextPositionY;
                
                ballMovementPath.push({ x: nextPositionX, y: nextPositionY, portal: false });
                
                if (useStepByStepMode) {
                    stepsCompleted++;
                    if (stepsCompleted >= 1) break;
                }
            } else {
                break;
            }
        } else if (nextCellType === CELL_TYPES.ONE_WAY_RIGHT) {
            if (gameState.currentGravity.x === 1 && gameState.currentGravity.y === 0) {
                hasMoved = true;
                
                ballPositionX = nextPositionX;
                ballPositionY = nextPositionY;
                
                ballMovementPath.push({ x: nextPositionX, y: nextPositionY, portal: false });
                
                if (useStepByStepMode) {
                    stepsCompleted++;
                    if (stepsCompleted >= 1) break;
                }
            } else {
                break;
            }
        } else if (nextCellType === CELL_TYPES.PORTAL_A || nextCellType === CELL_TYPES.PORTAL_B) {
            if (!hasTeleported) {
                const exitPortal = gameState.portals.find(portal => 
                    portal.type !== nextCellType && 
                    !(portal.x === nextPositionX && portal.y === nextPositionY)
                );
                
                if (exitPortal) {
                    hasMoved = true;
                    hasTeleported = true;
                    
                    ballMovementPath.push({ 
                        x: nextPositionX, 
                        y: nextPositionY, 
                        portal: true, 
                        exitX: exitPortal.x, 
                        exitY: exitPortal.y 
                    });
                    
                    ballPositionX = exitPortal.x;
                    ballPositionY = exitPortal.y;
                    
                    playSound('portal');
                    
                    if (useStepByStepMode) {
                        stepsCompleted++;
                        if (stepsCompleted >= 1) break;
                    }
                    
                    continue;
                }
            }
            
            hasMoved = true;
            
            ballPositionX = nextPositionX;
            ballPositionY = nextPositionY;
            
            ballMovementPath.push({ x: nextPositionX, y: nextPositionY, portal: false });
            
            if (useStepByStepMode) {
                stepsCompleted++;
                if (stepsCompleted >= 1) break;
            }
        } else {
            hasMoved = true;
            
            ballPositionX = nextPositionX;
            ballPositionY = nextPositionY;
            
            ballMovementPath.push({ x: nextPositionX, y: nextPositionY, portal: false });
            
            if (useStepByStepMode) {
                stepsCompleted++;
                if (stepsCompleted >= 1) break;
            }
        }
    }
    
    if (hasMoved) {
        animateBallMovement(gameState.ball, ballMovementPath, animationDuration).then(() => {
            gameState.ball.x = ballPositionX;
            gameState.ball.y = ballPositionY;
            
            gameState.isAnimating = false;
            
            renderGame();
            
            if (gameState.ball.x === gameState.target.x && 
                gameState.ball.y === gameState.target.y) {
                handleLevelComplete();
            }
        });
    } else {
        gameState.isAnimating = false;
    }
}

async function animateBallMovement(startPos, path, delay) {
    if (path.length === 0) return;
    
    const tempBall = document.createElement('div');
    tempBall.className = 'ball-object';
    tempBall.style.position = 'absolute';
    
    const boardRect = gameBoard.getBoundingClientRect();
    const cellSize = boardRect.width / gameState.grid[0].length;
    
    tempBall.style.width = `${cellSize * 0.75}px`;
    tempBall.style.height = `${cellSize * 0.75}px`;
    tempBall.style.left = `${startPos.x * cellSize + (cellSize - (cellSize * 0.75)) / 2}px`;
    tempBall.style.top = `${startPos.y * cellSize + (cellSize - (cellSize * 0.75)) / 2}px`;
    tempBall.style.transition = `transform ${delay}ms cubic-bezier(0.175, 0.885, 0.32, 1.275), left ${delay}ms, top ${delay}ms`;
    
    gameBoard.appendChild(tempBall);
    
    for (let i = 0; i < path.length; i++) {
        const step = path[i];
        
        if (step.portal) {
            await new Promise(resolve => {
                tempBall.style.transform = 'scale(0)';
                
                setTimeout(() => {
                    tempBall.style.transition = 'none';
                    tempBall.style.left = `${step.exitX * cellSize + (cellSize - (cellSize * 0.75)) / 2}px`;
                    tempBall.style.top = `${step.exitY * cellSize + (cellSize - (cellSize * 0.75)) / 2}px`;
                    
                    createParticleEffect(step.x * cellSize + cellSize / 2, step.y * cellSize + cellSize / 2, 'portal');
                    
                    setTimeout(() => {
                        tempBall.style.transition = `transform ${delay}ms cubic-bezier(0.175, 0.885, 0.32, 1.275), left ${delay}ms, top ${delay}ms`;
                        tempBall.style.transform = 'scale(1)';
                        resolve();
                    }, 10);
                }, delay);
            });
        } else {
            await new Promise(resolve => {
                tempBall.style.left = `${step.x * cellSize + (cellSize - (cellSize * 0.75)) / 2}px`;
                tempBall.style.top = `${step.y * cellSize + (cellSize - (cellSize * 0.75)) / 2}px`;
                
                setTimeout(resolve, delay);
            });
        }
    }
    
    gameBoard.removeChild(tempBall);
}

function createParticleEffect(x, y, type) {
    const colors = type === 'portal' ? 
        ['#9c27b0', '#ba68c8', '#e1bee7', '#4a148c'] : 
        ['#ffc107', '#ffeb3b', '#ff9800', '#ff5722'];
    
    const count = type === 'portal' ? 20 : 30;
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 8 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        const distance = Math.random() * 50 + 20;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        particlesContainer.appendChild(particle);
        
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 800, 1);
            
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentX = x + Math.cos(angle) * distance * easeOutProgress;
            const currentY = y + Math.sin(angle) * distance * easeOutProgress;
            const opacity = 1 - easeOutProgress;
            
            particle.style.transform = `translate(${currentX - x}px, ${currentY - y}px)`;
            particle.style.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                particlesContainer.removeChild(particle);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

function canPushBlock(blockX, blockY) {
    const dirX = gameState.currentGravity.x;
    const dirY = gameState.currentGravity.y;
    let nextX = blockX + dirX;
    let nextY = blockY + dirY;
    
    if (nextX < 0 || nextX >= gameState.grid[0].length || 
        nextY < 0 || nextY >= gameState.grid.length) {
        return false;
    }
    
    const nextCellType = gameState.grid[nextY][nextX];
    
    if (nextCellType === CELL_TYPES.EMPTY || 
        nextCellType === CELL_TYPES.TARGET ||
        nextCellType === CELL_TYPES.PORTAL_A || 
        nextCellType === CELL_TYPES.PORTAL_B) {
        return true;
    } else if (nextCellType === CELL_TYPES.MOVABLE) {
        return canPushBlock(nextX, nextY);
    }
    
    return false;
}

function pushBlocks(startX, startY) {
    const dirX = gameState.currentGravity.x;
    const dirY = gameState.currentGravity.y;
    let blockPositions = [];
    let currentX = startX;
    let currentY = startY;
    
    while (currentX >= 0 && currentX < gameState.grid[0].length && 
           currentY >= 0 && currentY < gameState.grid.length) {
        if (gameState.grid[currentY][currentX] === CELL_TYPES.MOVABLE) {
            blockPositions.push({ x: currentX, y: currentY });
            currentX += dirX;
            currentY += dirY;
        } else {
            break;
        }
    }
    
    for (let i = blockPositions.length - 1; i >= 0; i--) {
        const block = blockPositions[i];
        const nextX = block.x + dirX;
        const nextY = block.y + dirY;
        
        gameState.grid[block.y][block.x] = CELL_TYPES.EMPTY;
        gameState.grid[nextY][nextX] = CELL_TYPES.MOVABLE;
    }
}

function checkWinCondition() {
    if (gameState.ball.x === gameState.target.x && gameState.ball.y === gameState.target.y && !gameState.isLevelComplete) {
        handleLevelComplete();
    }
}

function handleLevelComplete() {
    gameState.isLevelComplete = true;
    stopTimer();
    
    playSound('win');
    
    createCelebrationEffect();
    
    showMessage("Level Complete!");
    
    nextLevelBtn.disabled = false;
    
    if (!settings.completedLevels.includes(gameState.currentLevel)) {
        settings.completedLevels.push(gameState.currentLevel);
    }
    
    const moveRatio = gameState.moves / gameState.moveLimit;
    let stars = 3;
    if (moveRatio > 0.8) stars = 1;
    else if (moveRatio > 0.6) stars = 2;
    
    settings.currentLevelStats = {
        level: gameState.currentLevel,
        moves: gameState.moves,
        moveLimit: gameState.moveLimit,
        time: gameState.elapsedTime,
        stars: stars
    };
    
    saveSettings();
    
    document.getElementById('win-moves').textContent = gameState.moves;
    document.getElementById('win-move-limit').textContent = gameState.moveLimit;
    document.getElementById('win-time').textContent = timerDisplay.textContent;
    document.getElementById('win-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    
    setTimeout(() => {
        showModal(winModal);
    }, 1000);
}

function createCelebrationEffect() {
    const boardRect = gameBoard.getBoundingClientRect();
    const cellSize = boardRect.width / gameState.grid[0].length;
    const centerX = gameState.target.x * cellSize + cellSize / 2;
    const centerY = gameState.target.y * cellSize + cellSize / 2;
    
    const colors = ['#4caf50', '#ffc107', '#2196f3', '#e91e63', '#9c27b0', '#ff5722'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createParticleEffect(
                centerX + (Math.random() * 100 - 50), 
                centerY + (Math.random() * 100 - 50), 
                'celebration'
            );
        }, i * 20);
    }
}

function showMessage(text) {
    messageArea.textContent = text;
    messageArea.classList.add('animate-pulse');
    
    setTimeout(() => {
        messageArea.classList.remove('animate-pulse');
    }, 1000);
}

function restartLevel() {
    loadLevel(gameState.currentLevel);
}

function loadNextLevel() {
    if (gameState.isLevelComplete) {
        loadLevel(gameState.currentLevel + 1);
    }
}

window.addEventListener('load', initGame);

function createSoundFiles() {
    console.log("Sound files should be placed in a /sounds directory");
} 