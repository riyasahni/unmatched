// State management
let currentState = 'IDLE'; // IDLE, SCANNING, PROCESSING, DATA_COLLECTION, RESULTS, REFRESH
let video, scanOverlay, processingOverlay, dataOverlay, resultsOverlay, refreshOverlay;
let rateBtn, notifications, dataForm;
let audioContext, scanSound;
let userData = null;

// Snarky comments based on score ranges
const comments = {
    1: [
        "Unfortunately, you're not attractive.",
        "The algorithm has spoken. It's not good news.",
        "Some faces are unforgettable. Yours isn't one of them.",
        "Yikes. The data doesn't lie."
    ],
    2: [
        "You look weird but I guess there's some potential.",
        "Not everyone can be beautiful. That's okay.",
        "The system struggled to find your best angle.",
        "There's a lid for every pot... yours is just hard to find."
    ],
    3: [
        "Below average, but you probably already knew that.",
        "There's room for improvement. A lot of room.",
        "The algorithm is being generous here.",
        "You're not ugly, just... forgettable."
    ],
    4: [
        "Mediocre. You meet the minimum requirements.",
        "Unremarkable but functional.",
        "You blend into a crowd effortlessly.",
        "Average in the most average way possible."
    ],
    5: [
        "Neither impressive nor disappointing.",
        "Perfectly forgettable.",
        "Statistically average. Congratulations?",
        "You're the human equivalent of room temperature water."
    ],
    6: [
        "Slightly above baseline. Not bad.",
        "Shows promise but lacks that special something.",
        "Moderately attractive. Could be worse.",
        "You clean up okay."
    ],
    7: [
        "Exceeds standard parameters. Impressive.",
        "Aesthetically pleasing. Well done.",
        "Above average specimen detected.",
        "You've got something going on. Keep it up."
    ],
    8: [
        "High-quality facial structure detected.",
        "Superior genetic configuration confirmed.",
        "Remarkably photogenic.",
        "The algorithm approves. Strongly."
    ],
    9: [
        "Near-perfect symmetry detected.",
        "Exceptional. The data is very favorable.",
        "Approaching theoretical maximum attractiveness.",
        "You're in the top tier. Own it."
    ],
    10: [
        "System overload - too attractive.",
        "Beauty exceeds computational limits.",
        "Attractiveness breaks the algorithm.",
        "Perfect score. The system has never seen anything like you."
    ]
};

// Initialize the app
async function init() {
    // Get DOM elements
    video = document.getElementById('video');
    scanOverlay = document.getElementById('scanOverlay');
    processingOverlay = document.getElementById('processingOverlay');
    dataOverlay = document.getElementById('dataOverlay');
    resultsOverlay = document.getElementById('resultsOverlay');
    refreshOverlay = document.getElementById('refreshOverlay');
    rateBtn = document.getElementById('rateBtn');
    notifications = document.getElementById('notifications');
    dataForm = document.getElementById('dataForm');

    // Initialize audio context for scanning sound
    initAudio();

    // Set up camera
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            } 
        });
        video.srcObject = stream;
        addNotification('CAMERA INITIALIZED');
        addNotification('NEURAL NETWORK READY');
    } catch (err) {
        console.error('Camera access error:', err);
        addNotification('ERROR: CAMERA ACCESS DENIED');
        addNotification('PLEASE ENABLE CAMERA PERMISSIONS');
    }

    // Set up button listener
    rateBtn.addEventListener('click', startRating);
    
    // Set up form listener
    dataForm.addEventListener('submit', handleDataSubmit);
}

// Initialize audio for scanning sound effect
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// Play scanning sound effect
function playScanSound() {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a sweeping sound effect
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
}

// Add notification message
function addNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = `> ${message}`;
    notifications.appendChild(notification);

    // Remove old notifications if too many
    while (notifications.children.length > 3) {
        notifications.removeChild(notifications.firstChild);
    }

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Start the rating process
async function startRating() {
    if (currentState !== 'IDLE') return;

    currentState = 'SCANNING';
    rateBtn.disabled = true;
    addNotification('INITIATING FACIAL SCAN...');

    // Show scanning overlay
    scanOverlay.classList.add('active');
    playScanSound();

    // Scanning phase (2 seconds)
    await sleep(2000);

    // Transition to processing
    scanOverlay.classList.remove('active');
    currentState = 'PROCESSING';
    addNotification('ANALYZING FACIAL DATA...');
    processingOverlay.classList.add('active');

    // Animate processing stats
    animateProcessingStats();

    // Processing phase (3 seconds)
    await sleep(3000);

    // Transition to data collection
    processingOverlay.classList.remove('active');
    currentState = 'DATA_COLLECTION';
    addNotification('DATA COLLECTION REQUIRED');
    dataOverlay.classList.add('active');
}

// Handle data form submission
async function handleDataSubmit(e) {
    e.preventDefault();
    
    if (currentState !== 'DATA_COLLECTION') return;

    // Collect user data
    userData = {
        name: document.getElementById('userName').value,
        age: document.getElementById('userAge').value,
        words: [
            document.getElementById('word1').value,
            document.getElementById('word2').value,
            document.getElementById('word3').value
        ]
    };

    addNotification('DATA RECEIVED');
    addNotification('PROCESSING USER PROFILE...');

    // Hide data overlay
    dataOverlay.classList.remove('active');

    // Brief processing animation
    processingOverlay.classList.add('active');
    await sleep(2000);

    // Generate fake score
    const score = Math.floor(Math.random() * 10) + 1;
    const comment = comments[score][Math.floor(Math.random() * comments[score].length)];

    // Show results
    processingOverlay.classList.remove('active');
    currentState = 'RESULTS';
    addNotification('ANALYSIS COMPLETE');
    showResults(score, comment);
    
    // Results stay on screen permanently - no auto-reset
}

// Animate processing statistics
function animateProcessingStats() {
    const nodesEl = document.getElementById('nodes');
    const confidenceEl = document.getElementById('confidence');
    const processingEl = document.getElementById('processing');

    let nodes = 0;
    let confidence = 0;
    let processing = 0;

    const interval = setInterval(() => {
        if (currentState !== 'PROCESSING') {
            clearInterval(interval);
            return;
        }

        nodes = Math.min(nodes + Math.floor(Math.random() * 50000), 999999);
        confidence = Math.min(confidence + Math.floor(Math.random() * 15), 99);
        processing = Math.min(processing + Math.floor(Math.random() * 20), 100);

        nodesEl.textContent = nodes.toLocaleString();
        confidenceEl.textContent = confidence + '%';
        processingEl.textContent = processing + '%';
    }, 100);
}

// Show results
function showResults(score, comment) {
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('comment').textContent = comment;
    resultsOverlay.classList.add('active');
}

// Start refresh countdown
async function startRefreshCountdown() {
    resultsOverlay.classList.remove('active');
    currentState = 'REFRESH';
    refreshOverlay.classList.add('active');
    addNotification('SYSTEM RESET INITIATED');

    const countdownEl = document.getElementById('countdown');
    
    for (let i = 5; i > 0; i--) {
        countdownEl.textContent = i;
        await sleep(1000);
    }

    // Reset to idle
    refreshOverlay.classList.remove('active');
    currentState = 'IDLE';
    rateBtn.disabled = false;
    userData = null;
    
    // Clear form fields
    dataForm.reset();
    
    addNotification('READY FOR NEXT SCAN');
}

// Utility sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', init);
