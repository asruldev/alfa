// Game state
let currentGame = null;
let currentQuestion = null;
let score = 0;
let level = 1;
let correctAnswers = 0;
let totalQuestions = 0;

// Audio system
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioEnabled = true;

// Sound effects
const sounds = {
    correct: null,
    incorrect: null,
    click: null,
    levelUp: null,
    background: null,
    celebration: null
};

// Initialize audio
function initAudio() {
    // Create audio elements
    sounds.correct = createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    sounds.incorrect = createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    sounds.click = createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    sounds.levelUp = createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    sounds.celebration = createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    
    // Set volume levels
    Object.values(sounds).forEach(sound => {
        if (sound) {
            sound.volume = 0.3;
        }
    });
}

// Create audio element with base64 encoded sound
function createAudio(base64Data) {
    const audio = new Audio();
    audio.src = base64Data;
    audio.preload = 'auto';
    return audio;
}

// Play sound function
function playSound(soundName) {
    if (!audioEnabled || !sounds[soundName]) return;
    
    try {
        // Reset audio to start
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
        console.log('Audio error:', error);
    }
}

// Generate simple beep sound using Web Audio API
function generateBeep(frequency = 800, duration = 200, type = 'sine') {
    if (!audioEnabled) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
        console.log('Web Audio API error:', error);
    }
}

// Generate different sound effects
function playCorrectSound() {
    generateBeep(800, 300, 'sine');
    setTimeout(() => generateBeep(1000, 200, 'sine'), 100);
    setTimeout(() => generateBeep(1200, 400, 'sine'), 200);
}

function playIncorrectSound() {
    generateBeep(200, 500, 'sawtooth');
}

function playClickSound() {
    generateBeep(600, 100, 'square');
}

function playLevelUpSound() {
    generateBeep(400, 200, 'sine');
    setTimeout(() => generateBeep(600, 200, 'sine'), 100);
    setTimeout(() => generateBeep(800, 200, 'sine'), 200);
    setTimeout(() => generateBeep(1000, 400, 'sine'), 300);
}

function playCelebrationSound() {
    const notes = [523, 659, 784, 1047]; // C, E, G, C (high)
    notes.forEach((note, index) => {
        setTimeout(() => generateBeep(note, 300, 'sine'), index * 150);
    });
}

// Toggle audio on/off
function toggleAudio() {
    audioEnabled = !audioEnabled;
    const audioBtn = document.getElementById('audioBtn');
    if (audioBtn) {
        audioBtn.innerHTML = audioEnabled ? '🔊' : '🔇';
        audioBtn.title = audioEnabled ? 'Matikan Suara' : 'Nyalakan Suara';
    }
}

// Game data
const gameData = {
    colors: {
        title: "Game Warna",
        questions: [
            { target: "Merah", options: ["Merah", "Biru", "Kuning", "Hijau"], emoji: "🔴" },
            { target: "Biru", options: ["Merah", "Biru", "Kuning", "Hijau"], emoji: "🔵" },
            { target: "Kuning", options: ["Merah", "Biru", "Kuning", "Hijau"], emoji: "🟡" },
            { target: "Hijau", options: ["Merah", "Biru", "Kuning", "Hijau"], emoji: "🟢" },
            { target: "Ungu", options: ["Ungu", "Oranye", "Pink", "Coklat"], emoji: "🟣" },
            { target: "Oranye", options: ["Ungu", "Oranye", "Pink", "Coklat"], emoji: "🟠" },
            { target: "Pink", options: ["Ungu", "Oranye", "Pink", "Coklat"], emoji: "🩷" },
            { target: "Coklat", options: ["Ungu", "Oranye", "Pink", "Coklat"], emoji: "🟤" }
        ]
    },
    shapes: {
        title: "Game Bentuk",
        questions: [
            { target: "Lingkaran", options: ["Lingkaran", "Segitiga", "Kotak", "Persegi Panjang"], emoji: "⭕" },
            { target: "Segitiga", options: ["Lingkaran", "Segitiga", "Kotak", "Persegi Panjang"], emoji: "🔺" },
            { target: "Kotak", options: ["Lingkaran", "Segitiga", "Kotak", "Persegi Panjang"], emoji: "⬜" },
            { target: "Bintang", options: ["Bintang", "Hati", "Diamond", "Oval"], emoji: "⭐" },
            { target: "Hati", options: ["Bintang", "Hati", "Diamond", "Oval"], emoji: "❤️" },
            { target: "Diamond", options: ["Bintang", "Hati", "Diamond", "Oval"], emoji: "💎" },
            { target: "Oval", options: ["Bintang", "Hati", "Diamond", "Oval"], emoji: "🟢" }
        ]
    },
    numbers: {
        title: "Game Angka",
        questions: [
            { target: "1", options: ["1", "2", "3", "4"], emoji: "1️⃣" },
            { target: "2", options: ["1", "2", "3", "4"], emoji: "2️⃣" },
            { target: "3", options: ["1", "2", "3", "4"], emoji: "3️⃣" },
            { target: "4", options: ["1", "2", "3", "4"], emoji: "4️⃣" },
            { target: "5", options: ["5", "6", "7", "8"], emoji: "5️⃣" },
            { target: "6", options: ["5", "6", "7", "8"], emoji: "6️⃣" },
            { target: "7", options: ["5", "6", "7", "8"], emoji: "7️⃣" },
            { target: "8", options: ["5", "6", "7", "8"], emoji: "8️⃣" },
            { target: "9", options: ["9", "10", "0", "5"], emoji: "9️⃣" },
            { target: "10", options: ["9", "10", "0", "5"], emoji: "🔟" },
            { target: "0", options: ["9", "10", "0", "5"], emoji: "0️⃣" }
        ]
    },
    animals: {
        title: "Game Hewan",
        questions: [
            { target: "Kucing", options: ["Kucing", "Anjing", "Kelinci", "Hamster"], emoji: "🐱" },
            { target: "Anjing", options: ["Kucing", "Anjing", "Kelinci", "Hamster"], emoji: "🐶" },
            { target: "Kelinci", options: ["Kucing", "Anjing", "Kelinci", "Hamster"], emoji: "🐰" },
            { target: "Hamster", options: ["Kucing", "Anjing", "Kelinci", "Hamster"], emoji: "🐹" },
            { target: "Gajah", options: ["Gajah", "Jerapah", "Zebra", "Singa"], emoji: "🐘" },
            { target: "Jerapah", options: ["Gajah", "Jerapah", "Zebra", "Singa"], emoji: "🦒" },
            { target: "Zebra", options: ["Gajah", "Jerapah", "Zebra", "Singa"], emoji: "🦓" },
            { target: "Singa", options: ["Gajah", "Jerapah", "Zebra", "Singa"], emoji: "🦁" },
            { target: "Burung", options: ["Burung", "Bebek", "Ayam", "Merpati"], emoji: "🐦" },
            { target: "Bebek", options: ["Burung", "Bebek", "Ayam", "Merpati"], emoji: "🦆" },
            { target: "Ayam", options: ["Burung", "Bebek", "Ayam", "Merpati"], emoji: "🐔" },
            { target: "Merpati", options: ["Burung", "Bebek", "Ayam", "Merpati"], emoji: "🕊️" }
        ]
    },
    fruits: {
        title: "Game Buah",
        questions: [
            { target: "Apel", options: ["Apel", "Jeruk", "Pisang", "Anggur"], emoji: "🍎" },
            { target: "Jeruk", options: ["Apel", "Jeruk", "Pisang", "Anggur"], emoji: "🍊" },
            { target: "Pisang", options: ["Apel", "Jeruk", "Pisang", "Anggur"], emoji: "🍌" },
            { target: "Stroberi", options: ["Stroberi", "Jeruk", "Pisang", "Anggur"], emoji: "🍓" },
            { target: "Nanas", options: ["Pisang", "Apel", "Jeruk", "Nanas"], emoji: "🍍" },
            { target: "Melon", options: ["Pisang", "Apel", "Jeruk", "Melon"], emoji: "🍈" },
            { target: "Semangka", options: ["Pisang", "Apel", "Jeruk", "Semangka"], emoji: "🍉" },
            { target: "Anggur", options: ["Pisang", "Apel", "Jeruk", "Anggur"], emoji: "🍇" }
        ]
    },
    vegetables: {
        title: "Game Sayur",
        questions: [
            { target: "Tomat", options: ["Tomat", "Wortel", "Kangkung", "Bayam"], emoji: "🍅" },
            { target: "Wortel", options: ["Tomat", "Wortel", "Kangkung", "Bayam"], emoji: "🥕" },
            { target: "Sawi", options: ["Tomat", "Wortel", "Kangkung", "Sawi"], emoji: "🥬" },
            { target: "Cabai", options: ["Cabai", "Wortel", "Kangkung", "Sawi"], emoji: "🌶️" },
            { target: "Timun", options: ["Cabai", "Timun", "Kangkung", "Sawi"], emoji: "🥒" },
            { target: "Paprika", options: ["Cabai", "Paprika", "Kangkung", "Sawi"], emoji: "🫑" }
        ]
    },
    vehicles: {
        title: "Game Kendaraan",
        questions: [
            { target: "Mobil", options: ["Mobil", "Motor", "Pesawat", "Kapal"], emoji: "🚗" },
            { target: "Motor", options: ["Mobil", "Motor", "Pesawat", "Kapal"], emoji: "🛵" },
            { target: "Pesawat", options: ["Mobil", "Motor", "Pesawat", "Kapal"], emoji: "🛩️" },
            { target: "Kapal", options: ["Mobil", "Motor", "Pesawat", "Kapal"], emoji: "🚢" },
            { target: "Kereta Api", options: ["Mobil", "Motor", "Pesawat", "Kereta Api"], emoji: "🚂" },
            { target: "Kapal Pesiar", options: ["Mobil", "Motor", "Pesawat", "Kapal Pesiar"], emoji: "🛥️" },
            { target: "Sepeda", options: ["Mobil", "Motor", "Pesawat", "Sepeda"], emoji: "🚲" }
        ]
    },
    family: {
        title: "Game Keluarga",
        questions: [
            { target: "Ayah", options: ["Ayah", "Ibu", "Anak", "Kakak"], emoji: "👨" },
            { target: "Ibu", options: ["Ayah", "Ibu", "Anak", "Kakak"], emoji: "👩" },
            { target: "Saudara Laki-laki", options: ["Ayah", "Ibu", "Saudara Laki-laki", "Kakak"], emoji: "👦" },
            { target: "Saudara Perempuan", options: ["Ayah", "Ibu", "Anak", "Saudara Perempuan"], emoji: "👧" },
            { target: "Kakek", options: ["Ayah", "Ibu", "Anak", "Kakek"], emoji: "👴" },
            { target: "Nenek", options: ["Ayah", "Ibu", "Anak", "Nenek"], emoji: "👵" }
        ]
    }
};

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    initAudio();
    updateScore();
    showMenu();
    
    // Add audio toggle button
    addAudioToggleButton();
    
    // Prevent zoom on double tap
    preventZoom();
    
    // Add touch event listeners
    addTouchListeners();
    
    // iPhone specific optimizations
    optimizeForIPhone();
});

// iPhone specific optimizations
function optimizeForIPhone() {
    // Detect iPhone
    const isIPhone = /iPhone|iPod/.test(navigator.userAgent);
    
    if (isIPhone) {
        // Add iPhone specific styles
        const style = document.createElement('style');
        style.textContent = `
            /* iPhone specific optimizations */
            body {
                -webkit-overflow-scrolling: touch;
                -webkit-tap-highlight-color: transparent;
            }
            
            .menu-btn, .option-btn, .back-btn, .audio-toggle {
                -webkit-appearance: none;
                -webkit-tap-highlight-color: transparent;
                touch-action: manipulation;
            }
            
            /* Larger touch targets for iPhone */
            .menu-btn {
                min-height: 60px;
                min-width: 120px;
            }
            
            .option-btn {
                min-height: 80px;
                min-width: 140px;
            }
            
            /* Prevent text selection on iPhone */
            * {
                -webkit-user-select: none;
                -webkit-touch-callout: none;
            }
        `;
        document.head.appendChild(style);
    }
}

// Prevent zoom on double tap
function preventZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Add touch event listeners for better mobile experience
function addTouchListeners() {
    // Add touch feedback to all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function(e) {
            this.style.transform = '';
        });
        
        button.addEventListener('touchcancel', function(e) {
            this.style.transform = '';
        });
    });
}

// Add audio toggle button to header
function addAudioToggleButton() {
    const header = document.querySelector('header');
    const audioBtn = document.createElement('button');
    audioBtn.id = 'audioBtn';
    audioBtn.innerHTML = '🔊';
    audioBtn.title = 'Matikan Suara';
    audioBtn.className = 'audio-toggle';
    audioBtn.onclick = toggleAudio;
    
    header.appendChild(audioBtn);
}

// Show main menu
function showMenu() {
    document.getElementById('gameMenu').style.display = 'block';
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('celebration').style.display = 'none';
    playClickSound();
}

// Start a specific game
function startGame(gameType) {
    currentGame = gameType;
    currentQuestion = 0;
    correctAnswers = 0;
    totalQuestions = 0;
    
    document.getElementById('gameMenu').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('gameTitle').textContent = gameData[gameType].title;
    
    playClickSound();
    generateQuestion();
}

// Generate a new question
function generateQuestion() {
    if (!currentGame) return;
    
    const questions = gameData[currentGame].questions;
    const question = questions[Math.floor(Math.random() * questions.length)];
    currentQuestion = question;
    totalQuestions++;
    
    // Shuffle options
    const shuffledOptions = shuffleArray([...question.options]);
    
    // Update display
    document.getElementById('question').textContent = `Pilih apa ini?`;
    
    const targetDisplay = document.getElementById('targetDisplay');
    targetDisplay.innerHTML = '';
    
    if (currentGame === 'colors') {
        const colorSwatch = document.createElement('div');
        colorSwatch.className = 'color-swatch';
        colorSwatch.style.backgroundColor = getColorCode(question.target);
        targetDisplay.appendChild(colorSwatch);
    } else if (currentGame === 'shapes') {
        const shapeDisplay = document.createElement('div');
        shapeDisplay.className = 'shape-display';
        shapeDisplay.textContent = question.emoji;
        targetDisplay.appendChild(shapeDisplay);
    } else if (currentGame === 'numbers') {
        const numberDisplay = document.createElement('div');
        numberDisplay.className = 'number-display';
        numberDisplay.textContent = question.emoji;
        targetDisplay.appendChild(numberDisplay);
    } else if (currentGame === 'animals') {
        const animalDisplay = document.createElement('div');
        animalDisplay.className = 'animal-display';
        animalDisplay.textContent = question.emoji;
        targetDisplay.appendChild(animalDisplay);
    } else if (currentGame === 'fruits') {
        const fruitDisplay = document.createElement('div');
        fruitDisplay.className = 'fruit-display';
        fruitDisplay.textContent = question.emoji;
        targetDisplay.appendChild(fruitDisplay);
    } else if (currentGame === 'vegetables') {
        const vegetableDisplay = document.createElement('div');
        vegetableDisplay.className = 'vegetable-display';
        vegetableDisplay.textContent = question.emoji;
        targetDisplay.appendChild(vegetableDisplay);
    } else if (currentGame === 'vehicles') {
        const vehicleDisplay = document.createElement('div');
        vehicleDisplay.className = 'vehicle-display';
        vehicleDisplay.textContent = question.emoji;
        targetDisplay.appendChild(vehicleDisplay);
    } else if (currentGame === 'family') {
        const familyDisplay = document.createElement('div');
        familyDisplay.className = 'family-display';
        familyDisplay.textContent = question.emoji;
        targetDisplay.appendChild(familyDisplay);
    }
    
    // Create option buttons
    const optionsArea = document.getElementById('optionsArea');
    optionsArea.innerHTML = '';
    
    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => checkAnswer(option);
        
        // Add touch event listeners for new buttons
        button.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function(e) {
            this.style.transform = '';
        });
        
        button.addEventListener('touchcancel', function(e) {
            this.style.transform = '';
        });
        
        optionsArea.appendChild(button);
    });
    
    // Clear feedback
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
}

// Check answer
function checkAnswer(selectedAnswer) {
    const isCorrect = selectedAnswer === currentQuestion.target;
    
    // Play sound based on answer
    if (isCorrect) {
        playCorrectSound();
    } else {
        playIncorrectSound();
    }
    
    // Disable all buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent === selectedAnswer) {
            button.classList.add(isCorrect ? 'correct' : 'incorrect');
        } else if (button.textContent === currentQuestion.target) {
            button.classList.add('correct');
        }
    });
    
    // Show feedback
    const feedback = document.getElementById('feedback');
    if (isCorrect) {
        feedback.textContent = '🎉 Benar! Kamu hebat! 🎉';
        feedback.className = 'feedback correct';
        score += 10;
        correctAnswers++;
        
        // Level up every 5 correct answers
        if (correctAnswers % 5 === 0) {
            level++;
            playLevelUpSound();
        }
    } else {
        feedback.textContent = `❌ Salah! Jawaban yang benar adalah: ${currentQuestion.target}`;
        feedback.className = 'feedback incorrect';
    }
    
    updateScore();
    
    // Show celebration for correct answers
    if (isCorrect) {
        setTimeout(() => {
            playCelebrationSound();
            document.getElementById('celebration').style.display = 'flex';
        }, 1000);
    } else {
        // Continue to next question after 2 seconds for wrong answers
        setTimeout(() => {
            generateQuestion();
        }, 2000);
    }
}

// Continue game after celebration
function continueGame() {
    document.getElementById('celebration').style.display = 'none';
    playClickSound();
    generateQuestion();
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Get color code for color game
function getColorCode(colorName) {
    const colorMap = {
        'Merah': '#ff0000',
        'Biru': '#0000ff',
        'Kuning': '#ffff00',
        'Hijau': '#00ff00',
        'Ungu': '#800080',
        'Oranye': '#ffa500',
        'Pink': '#ffc0cb',
        'Coklat': '#a52a2a'
    };
    return colorMap[colorName] || '#000000';
}

// Add keyboard support for accessibility
document.addEventListener('keydown', function(event) {
    if (event.key >= '1' && event.key <= '4') {
        const buttons = document.querySelectorAll('.option-btn');
        const index = parseInt(event.key) - 1;
        if (buttons[index] && !buttons[index].disabled) {
            playClickSound();
            buttons[index].click();
        }
    }
});

// Add some fun animations
function addConfetti() {
    // Simple confetti effect using CSS
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.top = '0';
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 5)];
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.animation = 'fall 3s linear forwards';
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
        document.body.removeChild(confetti);
    }, 3000);
}

// Add confetti animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Trigger confetti on correct answers
function triggerConfetti() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => addConfetti(), i * 100);
    }
}

// Modify checkAnswer to include confetti
const originalCheckAnswer = checkAnswer;
checkAnswer = function(selectedAnswer) {
    const isCorrect = selectedAnswer === currentQuestion.target;
    
    if (isCorrect) {
        triggerConfetti();
    }
    
    originalCheckAnswer(selectedAnswer);
};
