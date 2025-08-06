// Real-Time Emotion Detection System
class EmotionDetectionSystem {
    constructor() {
        // Configuration from JSON data
        this.emotions = [
            { name: "happy", emoji: "😊", color: "#4CAF50", type: "positive" },
            { name: "sad", emoji: "😢", color: "#F44336", type: "distress" },
            { name: "angry", emoji: "😠", color: "#D32F2F", type: "distress" },
            { name: "fear", emoji: "😨", color: "#FF9800", type: "distress" },
            { name: "surprise", emoji: "😲", color: "#2196F3", type: "neutral" },
            { name: "disgust", emoji: "🤢", color: "#795548", type: "negative" },
            { name: "neutral", emoji: "😐", color: "#9E9E9E", type: "neutral" }
        ];
        
        this.distressEmotions = ["sad", "angry", "fear"];
        
        this.settings = {
            alertThreshold: 10,
            confidenceThreshold: 0.5,
            bufferSize: 30,
            frameSkip: 3,
            audioAlerts: true
        };

        // System state
        this.isDetecting = false;
        this.modelsLoaded = false;
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        
        // Detection state
        this.currentEmotion = 'neutral';
        this.currentEmotions = {};
        this.detectionBuffer = [];
        this.distressStartTime = null;
        this.distressTimer = 0;
        this.isAlertActive = false;
        this.frameCount = 0;
        
        // Statistics
        this.detectionCount = 0;
        this.alertCount = 0;
        this.fps = 0;
        this.lastFrameTime = 0;
        
        // History
        this.emotionHistory = [];
        this.emotionDistribution = {};
        
        // Chart
        this.chart = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadModels();
    }

    initializeElements() {
        // Video elements
        this.video = document.getElementById('videoElement');
        this.canvas = document.getElementById('overlay');
        this.ctx = this.canvas.getContext('2d');
        
        // UI elements
        this.startBtn = document.getElementById('startDetectionBtn');
        this.stopBtn = document.getElementById('stopDetectionBtn');
        this.resetBtn = document.getElementById('resetSystemBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsBtn2 = document.getElementById('settingsBtn2');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Status elements
        this.currentEmotionEl = document.getElementById('currentEmotion');
        this.confidenceLevelEl = document.getElementById('confidenceLevel');
        this.systemStatusEl = document.getElementById('systemStatus');
        this.distressTimerEl = document.getElementById('distressTimer');
        this.distressProgressEl = document.getElementById('distressProgress');
        this.alertStatusEl = document.getElementById('alertStatus');
        this.emotionHistoryEl = document.getElementById('emotionHistory');
        this.fpsCounterEl = document.getElementById('fpsCounter');
        this.detectionCountEl = document.getElementById('detectionCount');
        this.alertCountEl = document.getElementById('alertCount');
        
        // Panel elements
        this.controlsPanel = document.getElementById('controlsPanel');
        this.statusPanel = document.getElementById('statusPanel');
        this.analyticsPanel = document.getElementById('analyticsPanel');
        
        // Modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.resetSettingsBtn = document.getElementById('resetSettingsBtn');
        
        // Settings inputs
        this.alertThresholdInput = document.getElementById('alertThreshold');
        this.confidenceThresholdInput = document.getElementById('confidenceThreshold');
        this.frameSkipInput = document.getElementById('frameSkip');
        this.audioAlertsInput = document.getElementById('audioAlerts');
        
        // Alert notification
        this.alertNotification = document.getElementById('alertNotification');
        this.dismissAlertBtn = document.getElementById('dismissAlert');
        
        // State elements
        this.loadingState = document.getElementById('loadingState');
        this.welcomeState = document.getElementById('welcomeState');
        this.errorState = document.getElementById('errorState');
        this.errorMessage = document.getElementById('errorMessage');
        this.webcamContainer = document.getElementById('webcamContainer');
    }

    setupEventListeners() {
        // Control buttons
        this.startBtn.addEventListener('click', () => this.startDetection());
        this.stopBtn.addEventListener('click', () => this.stopDetection());
        this.resetBtn.addEventListener('click', () => this.resetSystem());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.settingsBtn2.addEventListener('click', () => this.openSettings());
        this.retryBtn.addEventListener('click', () => this.startDetection());
        
        // Modal controls
        this.closeModalBtn.addEventListener('click', () => this.closeSettings());
        this.modalOverlay.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.resetSettingsBtn.addEventListener('click', () => this.resetToDefaults());
        
        // Settings inputs
        this.alertThresholdInput.addEventListener('input', (e) => {
            document.getElementById('thresholdValue').textContent = e.target.value + 's';
        });
        this.confidenceThresholdInput.addEventListener('input', (e) => {
            document.getElementById('confidenceValue').textContent = e.target.value;
        });
        this.frameSkipInput.addEventListener('input', (e) => {
            document.getElementById('frameSkipValue').textContent = e.target.value;
        });
        
        // Alert dismissal
        this.dismissAlertBtn.addEventListener('click', () => this.dismissAlert());
        
        // Initialize settings display
        this.updateSettingsDisplay();
    }

    async loadModels() {
        try {
            this.showLoadingState();
            
            // Load face-api.js models from CDN
            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
            
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
            ]);
            
            this.modelsLoaded = true;
            this.updateSystemStatus('Models loaded successfully', 'success');
            
            this.showWelcomeState();
            this.initializeChart();
            
        } catch (error) {
            console.error('Error loading models:', error);
            this.showError('Failed to load emotion detection models. Please refresh the page.');
        }
    }

    async startDetection() {
        if (!this.modelsLoaded) {
            this.showError('Models are still loading. Please wait and try again.');
            return;
        }

        try {
            this.showLoadingState();
            
            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                } 
            });
            
            this.video.srcObject = this.stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.video.addEventListener('loadedmetadata', () => {
                    // Set canvas dimensions
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    
                    // Show active detection UI
                    this.showDetectionState();
                    
                    // Start detection
                    this.isDetecting = true;
                    this.detectEmotions();
                    
                    resolve();
                }, { once: true });
            });
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            let errorMsg = 'Unable to access camera. ';
            
            if (error.name === 'NotAllowedError') {
                errorMsg += 'Please allow camera permissions and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMsg += 'No camera found on this device.';
            } else {
                errorMsg += 'Please check your camera and try again.';
            }
            
            this.showError(errorMsg);
        }
    }

    stopDetection() {
        this.isDetecting = false;
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.srcObject = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.showWelcomeState();
        this.updateSystemStatus('Detection stopped', 'info');
        this.clearDistressTimer();
    }

    async detectEmotions() {
        if (!this.isDetecting) return;
        
        this.frameCount++;
        
        // Skip frames for performance
        if (this.frameCount % this.settings.frameSkip !== 0) {
            requestAnimationFrame(() => this.detectEmotions());
            return;
        }
        
        try {
            // Detect faces and expressions
            const detections = await faceapi.detectAllFaces(
                this.video, 
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceExpressions();
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (detections.length > 0) {
                const detection = detections[0];
                const emotions = detection.expressions;
                
                // Find dominant emotion
                let maxEmotion = 'neutral';
                let maxConfidence = 0;
                
                // Map face-api.js emotion names to our emotion names
                const emotionMapping = {
                    'happy': 'happy',
                    'sad': 'sad',
                    'angry': 'angry',
                    'fearful': 'fear',
                    'surprised': 'surprise',
                    'disgusted': 'disgust',
                    'neutral': 'neutral'
                };
                
                Object.entries(emotions).forEach(([emotion, confidence]) => {
                    const mappedEmotion = emotionMapping[emotion] || emotion;
                    if (confidence > maxConfidence && confidence > this.settings.confidenceThreshold) {
                        maxConfidence = confidence;
                        maxEmotion = mappedEmotion;
                    }
                });
                
                this.processEmotionDetection(maxEmotion, maxConfidence, emotions);
                this.drawFaceDetection(detection);
                
            } else {
                // No face detected
                this.processEmotionDetection('neutral', 0, {});
            }
            
            this.updatePerformanceMetrics();
            
        } catch (error) {
            console.error('Detection error:', error);
        }
        
        requestAnimationFrame(() => this.detectEmotions());
    }

    processEmotionDetection(emotion, confidence, allEmotions) {
        this.currentEmotion = emotion;
        this.currentEmotions = allEmotions;
        this.detectionCount++;
        
        // Update detection buffer for stability
        this.detectionBuffer.push(emotion);
        if (this.detectionBuffer.length > this.settings.bufferSize) {
            this.detectionBuffer.shift();
        }
        
        // Update emotion distribution
        if (!this.emotionDistribution[emotion]) {
            this.emotionDistribution[emotion] = 0;
        }
        this.emotionDistribution[emotion]++;
        
        // Update UI
        this.updateEmotionDisplay(emotion, confidence);
        this.updateChart();
        
        // Add to history
        this.addToHistory(emotion, confidence);
        
        // Check for distress
        this.checkDistressEmotion(emotion);
    }

    checkDistressEmotion(emotion) {
        const isDistress = this.distressEmotions.includes(emotion);
        
        if (isDistress) {
            if (this.distressStartTime === null) {
                this.distressStartTime = Date.now();
            }
            
            this.distressTimer = (Date.now() - this.distressStartTime) / 1000;
            
            // Update progress bar and timer
            const progress = Math.min((this.distressTimer / this.settings.alertThreshold) * 100, 100);
            this.distressProgressEl.style.width = progress + '%';
            this.distressTimerEl.textContent = this.distressTimer.toFixed(1) + 's';
            
            // Check for alert threshold
            if (this.distressTimer >= this.settings.alertThreshold && !this.isAlertActive) {
                this.triggerAlert();
            }
            
        } else {
            this.clearDistressTimer();
        }
    }

    clearDistressTimer() {
        this.distressStartTime = null;
        this.distressTimer = 0;
        this.distressProgressEl.style.width = '0%';
        this.distressTimerEl.textContent = '0.0s';
        
        if (this.isAlertActive) {
            this.clearAlert();
        }
    }

    triggerAlert() {
        this.isAlertActive = true;
        this.alertCount++;
        
        // Update UI
        this.webcamContainer.classList.add('alert-active');
        this.alertStatusEl.innerHTML = '<span class="status status--error">🚨 ALERT ACTIVE</span>';
        this.alertCountEl.textContent = this.alertCount;
        
        // Show notification
        this.showAlertNotification();
        
        // Audio alert
        if (this.settings.audioAlerts) {
            this.playAlertSound();
        }
    }

    clearAlert() {
        this.isAlertActive = false;
        this.webcamContainer.classList.remove('alert-active');
        this.alertStatusEl.innerHTML = '<span class="status status--success">No Alert</span>';
        this.hideAlertNotification();
    }

    // UI State Management
    showLoadingState() {
        this.loadingState.classList.remove('hidden');
        this.welcomeState.classList.add('hidden');
        this.errorState.classList.add('hidden');
        this.controlsPanel.classList.add('hidden');
        this.statusPanel.classList.add('hidden');
        this.analyticsPanel.classList.add('hidden');
    }

    showWelcomeState() {
        this.loadingState.classList.add('hidden');
        this.welcomeState.classList.remove('hidden');
        this.errorState.classList.add('hidden');
        this.controlsPanel.classList.add('hidden');
        this.statusPanel.classList.add('hidden');
        this.analyticsPanel.classList.add('hidden');
    }

    showDetectionState() {
        this.loadingState.classList.add('hidden');
        this.welcomeState.classList.add('hidden');
        this.errorState.classList.add('hidden');
        this.controlsPanel.classList.remove('hidden');
        this.statusPanel.classList.remove('hidden');
        this.analyticsPanel.classList.remove('hidden');
        
        this.updateSystemStatus('Detection active', 'success');
    }

    showError(message) {
        this.loadingState.classList.add('hidden');
        this.welcomeState.classList.add('hidden');
        this.errorState.classList.remove('hidden');
        this.controlsPanel.classList.add('hidden');
        this.statusPanel.classList.add('hidden');
        this.analyticsPanel.classList.add('hidden');
        
        this.errorMessage.textContent = message;
        this.updateSystemStatus('Error', 'error');
    }

    showAlertNotification() {
        const alertMessages = [
            "⚠️ ALERT: Sustained distress emotion detected!",
            "🚨 Attention needed: Prolonged emotional distress",
            "⚠️ Warning: Distress threshold exceeded"
        ];
        
        const message = alertMessages[Math.floor(Math.random() * alertMessages.length)];
        document.getElementById('alertText').textContent = message;
        this.alertNotification.classList.remove('hidden');
    }

    hideAlertNotification() {
        this.alertNotification.classList.add('hidden');
    }

    dismissAlert() {
        this.hideAlertNotification();
        this.clearDistressTimer();
    }

    playAlertSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('Could not play alert sound:', error);
        }
    }

    drawFaceDetection(detection) {
        const { x, y, width, height } = detection.detection.box;
        
        // Draw face box
        this.ctx.strokeStyle = this.isAlertActive ? '#f44336' : '#32c1d8';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw emotion label
        const emotionData = this.emotions.find(e => e.name === this.currentEmotion);
        if (emotionData) {
            this.ctx.fillStyle = this.isAlertActive ? '#f44336' : '#32c1d8';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(
                `${emotionData.emoji} ${this.currentEmotion.toUpperCase()}`,
                x, y - 10
            );
        }
    }

    updateEmotionDisplay(emotion, confidence) {
        const emotionData = this.emotions.find(e => e.name === emotion);
        if (emotionData) {
            this.currentEmotionEl.innerHTML = `
                <span class="emotion-emoji">${emotionData.emoji}</span>
                <span class="emotion-name">${emotion}</span>
            `;
        }
        
        this.confidenceLevelEl.textContent = Math.round(confidence * 100) + '%';
    }

    addToHistory(emotion, confidence) {
        const timestamp = new Date().toLocaleTimeString();
        const emotionData = this.emotions.find(e => e.name === emotion);
        
        this.emotionHistory.unshift({
            time: timestamp,
            emotion: emotion,
            emoji: emotionData ? emotionData.emoji : '😐',
            confidence: confidence
        });
        
        // Keep only last 20 detections
        if (this.emotionHistory.length > 20) {
            this.emotionHistory.pop();
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (this.emotionHistory.length === 0) {
            this.emotionHistoryEl.innerHTML = '<p class="text-secondary">No detections yet</p>';
            return;
        }
        
        const historyHTML = this.emotionHistory.slice(0, 10).map(item => `
            <div class="history-item">
                <span class="history-time">${item.time}</span>
                <span class="history-emotion">
                    <span>${item.emoji}</span>
                    <span>${item.emotion}</span>
                </span>
                <span>${Math.round(item.confidence * 100)}%</span>
            </div>
        `).join('');
        
        this.emotionHistoryEl.innerHTML = historyHTML;
    }

    initializeChart() {
        const ctx = document.getElementById('emotionChart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.emotions.map(e => e.name),
                datasets: [{
                    data: this.emotions.map(() => 0),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    updateChart() {
        if (!this.chart) return;
        
        const data = this.emotions.map(emotion => 
            this.emotionDistribution[emotion.name] || 0
        );
        
        this.chart.data.datasets[0].data = data;
        this.chart.update('none');
    }

    updatePerformanceMetrics() {
        const now = performance.now();
        if (this.lastFrameTime > 0) {
            const frameDelta = now - this.lastFrameTime;
            this.fps = Math.round(1000 / (frameDelta * this.settings.frameSkip));
            this.fpsCounterEl.textContent = this.fps;
        }
        this.lastFrameTime = now;
        
        this.detectionCountEl.textContent = this.detectionCount;
    }

    updateSystemStatus(message, type = 'info') {
        this.systemStatusEl.innerHTML = `<span class="status status--${type}">${message}</span>`;
    }

    resetSystem() {
        this.stopDetection();
        
        // Reset all counters and data
        this.detectionCount = 0;
        this.alertCount = 0;
        this.fps = 0;
        this.emotionHistory = [];
        this.emotionDistribution = {};
        this.detectionBuffer = [];
        
        // Update UI
        this.updateEmotionDisplay('neutral', 0);
        this.updateHistoryDisplay();
        this.detectionCountEl.textContent = '0';
        this.alertCountEl.textContent = '0';
        this.fpsCounterEl.textContent = '0';
        
        // Reset chart
        if (this.chart) {
            this.chart.data.datasets[0].data = this.emotions.map(() => 0);
            this.chart.update();
        }
        
        this.clearDistressTimer();
        this.updateSystemStatus('System reset', 'success');
    }

    // Settings Management
    openSettings() {
        this.settingsModal.classList.remove('hidden');
        this.updateSettingsDisplay();
    }

    closeSettings() {
        this.settingsModal.classList.add('hidden');
    }

    updateSettingsDisplay() {
        this.alertThresholdInput.value = this.settings.alertThreshold;
        this.confidenceThresholdInput.value = this.settings.confidenceThreshold;
        this.frameSkipInput.value = this.settings.frameSkip;
        this.audioAlertsInput.checked = this.settings.audioAlerts;
        
        document.getElementById('thresholdValue').textContent = this.settings.alertThreshold + 's';
        document.getElementById('confidenceValue').textContent = this.settings.confidenceThreshold;
        document.getElementById('frameSkipValue').textContent = this.settings.frameSkip;
    }

    saveSettings() {
        this.settings.alertThreshold = parseInt(this.alertThresholdInput.value);
        this.settings.confidenceThreshold = parseFloat(this.confidenceThresholdInput.value);
        this.settings.frameSkip = parseInt(this.frameSkipInput.value);
        this.settings.audioAlerts = this.audioAlertsInput.checked;
        
        this.closeSettings();
        this.updateSystemStatus('Settings saved', 'success');
    }

    resetToDefaults() {
        this.settings = {
            alertThreshold: 10,
            confidenceThreshold: 0.5,
            bufferSize: 30,
            frameSkip: 3,
            audioAlerts: true
        };
        
        this.updateSettingsDisplay();
        this.updateSystemStatus('Settings reset to defaults', 'info');
    }
}

// Initialize the system when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.emotionSystem = new EmotionDetectionSystem();
});