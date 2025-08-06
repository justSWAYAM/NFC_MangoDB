
import streamlit as st
import cv2
import numpy as np
from deepface import DeepFace
import time
import threading
from collections import deque
import pandas as pd
from datetime import datetime
import json
import os

# Configuration
EMOTION_WINDOW_SIZE = 30  # Number of frames to consider for majority voting
ALERT_DURATION_THRESHOLD = 10  # Seconds to trigger alert
DISTRESS_EMOTIONS = ['angry', 'fear', 'sad']

class EmotionTracker:
    def __init__(self, alert_threshold=ALERT_DURATION_THRESHOLD):
        self.emotion_buffer = deque(maxlen=EMOTION_WINDOW_SIZE)
        self.distress_start_time = None
        self.current_emotion = 'neutral'
        self.alert_triggered = False
        self.emotion_history = []
        self.alert_threshold = alert_threshold

    def update_alert_threshold(self, new_threshold):
        """Update alert threshold"""
        self.alert_threshold = new_threshold

    def add_emotion(self, emotion, confidence=0):
        """Add emotion to buffer and check for sustained distress"""
        timestamp = datetime.now()
        self.emotion_buffer.append(emotion)
        self.emotion_history.append({
            'timestamp': timestamp,
            'emotion': emotion,
            'confidence': confidence
        })

        # Get majority emotion from buffer
        if len(self.emotion_buffer) >= 5:  # Minimum buffer size
            emotion_counts = {}
            for e in self.emotion_buffer:
                emotion_counts[e] = emotion_counts.get(e, 0) + 1
            self.current_emotion = max(emotion_counts, key=emotion_counts.get)
        else:
            self.current_emotion = emotion

        # Check for sustained distress
        if self.current_emotion in DISTRESS_EMOTIONS:
            if self.distress_start_time is None:
                self.distress_start_time = time.time()
            elif time.time() - self.distress_start_time >= self.alert_threshold:
                if not self.alert_triggered:
                    self.trigger_alert()
                    self.alert_triggered = True
        else:
            self.distress_start_time = None
            self.alert_triggered = False

    def trigger_alert(self):
        """Trigger alert for sustained distress"""
        alert_msg = f"⚠️ ALERT: Sustained {self.current_emotion} emotion detected for {self.alert_threshold}+ seconds!"
        st.error(alert_msg)
        st.balloons()  # Visual feedback

        # Log alert
        self.emotion_history.append({
            'timestamp': datetime.now(),
            'emotion': 'ALERT_TRIGGERED',
            'confidence': 100,
            'details': f"Sustained {self.current_emotion} for {self.alert_threshold}s"
        })

    def get_distress_duration(self):
        """Get current distress duration"""
        if self.distress_start_time:
            return time.time() - self.distress_start_time
        return 0

def analyze_emotion(frame):
    """Analyze emotion from frame using DeepFace"""
    try:
        # Convert BGR to RGB for DeepFace
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Analyze emotion
        result = DeepFace.analyze(
            rgb_frame, 
            actions=['emotion'], 
            enforce_detection=False,
            silent=True
        )

        # Handle both single face and multiple faces cases
        if isinstance(result, list):
            result = result[0]

        # Get dominant emotion
        emotions = result['emotion']
        dominant_emotion = max(emotions, key=emotions.get)
        confidence = emotions[dominant_emotion]

        return dominant_emotion, confidence, emotions
    except Exception as e:
        return 'neutral', 0, {'neutral': 100}

def draw_emotion_overlay(frame, emotion, confidence, distress_duration, alert_threshold):
    """Draw emotion information on the frame"""
    height, width = frame.shape[:2]

    # Create semi-transparent overlay
    overlay = frame.copy()

    # Draw emotion info box
    cv2.rectangle(overlay, (10, 10), (400, 120), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)

    # Add text
    cv2.putText(frame, f"Emotion: {emotion}", (20, 40), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    cv2.putText(frame, f"Confidence: {confidence:.1f}%", (20, 70), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    if distress_duration > 0:
        color = (0, 0, 255) if distress_duration >= alert_threshold else (0, 165, 255)
        cv2.putText(frame, f"Distress: {distress_duration:.1f}s", (20, 100), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    return frame

def main():
    st.set_page_config(
        page_title="Real-Time Emotion Detection & Alert System",
        page_icon="🎭",
        layout="wide"
    )

    # Custom CSS for better styling
    st.markdown("""
    <style>
    .main-header {
        text-align: center;
        padding: 1rem 0;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    .metric-container {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #007bff;
    }
    .alert-box {
        background: #ffe6e6;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #ff4444;
        margin: 1rem 0;
    }
    .stProgress > div > div > div > div {
        background-image: linear-gradient(to right, #ff4444, #ff8888);
    }
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<div class="main-header"><h1>🎭 Real-Time Emotion Detection & Alert System</h1></div>', 
                unsafe_allow_html=True)

    st.markdown("""
    ### System Features:
    - 🎥 **Real-time webcam emotion detection**
    - ⚠️ **Automatic alerts for sustained distress emotions (fear, anger, sadness)**
    - 📊 **Live emotion analytics and history**
    - 🔧 **Configurable alert thresholds and settings**
    """)

    # Initialize session state
    if 'emotion_tracker' not in st.session_state:
        st.session_state.emotion_tracker = EmotionTracker()

    # Sidebar for configuration
    st.sidebar.header("⚙️ System Configuration")
    st.sidebar.markdown("---")

    detection_threshold = st.sidebar.slider(
        "Detection Confidence Threshold", 
        0.1, 1.0, 0.5, 0.1,
        help="Minimum confidence required to register an emotion"
    )

    alert_threshold = st.sidebar.slider(
        "Alert Duration (seconds)", 
        5, 30, ALERT_DURATION_THRESHOLD, 1,
        help="Time before triggering alert for sustained distress"
    )

    show_emotions_chart = st.sidebar.checkbox("Show Live Emotion Chart", True)
    show_overlay = st.sidebar.checkbox("Show Video Overlay", True)

    # Update the tracker's alert threshold
    st.session_state.emotion_tracker.update_alert_threshold(alert_threshold)

    st.sidebar.markdown("---")
    st.sidebar.markdown("### 📋 Monitored Distress Emotions")
    for emotion in DISTRESS_EMOTIONS:
        st.sidebar.write(f"• {emotion.title()}")

    # Main layout
    col1, col2 = st.columns([2, 1])

    with col1:
        st.header("📹 Live Video Feed")

        # Control buttons
        button_col1, button_col2, button_col3 = st.columns(3)
        with button_col1:
            start_detection = st.button("▶️ Start Detection", type="primary")
        with button_col2:
            stop_detection = st.button("⏹️ Stop Detection")
        with button_col3:
            reset_system = st.button("🔄 Reset System")

        if reset_system:
            st.session_state.emotion_tracker = EmotionTracker(alert_threshold)
            st.success("System reset successfully!")

        # Initialize detection state
        if 'detection_running' not in st.session_state:
            st.session_state.detection_running = False

        if start_detection:
            st.session_state.detection_running = True
        if stop_detection:
            st.session_state.detection_running = False

        if st.session_state.detection_running:
            # Status indicators
            status_col1, status_col2, status_col3 = st.columns(3)
            with status_col1:
                current_emotion_placeholder = st.empty()
            with status_col2:
                confidence_placeholder = st.empty()
            with status_col3:
                alert_status_placeholder = st.empty()

            # Video placeholder
            video_placeholder = st.empty()

            # Camera initialization message
            with st.spinner("Initializing camera..."):
                cap = cv2.VideoCapture(0)

                if not cap.isOpened():
                    st.error("❌ Unable to access webcam. Please check your camera permissions.")
                    st.info("💡 Make sure your camera is not being used by another application.")
                    st.session_state.detection_running = False
                else:
                    st.success("✅ Camera initialized successfully!")

            if st.session_state.detection_running and cap.isOpened():
                # Detection loop
                frame_count = 0

                try:
                    while st.session_state.detection_running:
                        ret, frame = cap.read()
                        if not ret:
                            st.error("Failed to capture frame from webcam.")
                            break

                        frame_count += 1

                        # Analyze emotion every 3rd frame to save computation
                        emotion, confidence, all_emotions = 'neutral', 0, {'neutral': 100}
                        if frame_count % 3 == 0:
                            emotion, confidence, all_emotions = analyze_emotion(frame)

                            if confidence >= detection_threshold:
                                st.session_state.emotion_tracker.add_emotion(emotion, confidence)

                        # Get current status
                        current_emotion = st.session_state.emotion_tracker.current_emotion
                        distress_duration = st.session_state.emotion_tracker.get_distress_duration()

                        # Add overlay to frame if enabled
                        if show_overlay:
                            frame = draw_emotion_overlay(frame, current_emotion, confidence, distress_duration, alert_threshold)

                        # Display frame
                        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        video_placeholder.image(frame_rgb, channels="RGB", use_column_width=True)

                        # Update status indicators
                        emotion_color = "🟢" if current_emotion not in DISTRESS_EMOTIONS else "🔴"
                        current_emotion_placeholder.metric(
                            "Current Emotion", 
                            f"{emotion_color} {current_emotion.title()}",
                            delta=f"{confidence:.1f}%" if confidence > 0 else None
                        )

                        confidence_placeholder.metric(
                            "Detection Confidence", 
                            f"{confidence:.1f}%" if confidence > 0 else "0%"
                        )

                        if distress_duration > 0:
                            alert_status_placeholder.metric(
                                "⚠️ Distress Duration", 
                                f"{distress_duration:.1f}s",
                                delta="🚨 ALERT!" if distress_duration >= alert_threshold else "Monitoring..."
                            )
                        else:
                            alert_status_placeholder.metric("System Status", "✅ Normal", delta="OK")

                        time.sleep(0.1)  # Control frame rate

                except KeyboardInterrupt:
                    st.info("Detection stopped by user.")
                except Exception as e:
                    st.error(f"Error during detection: {str(e)}")
                finally:
                    if 'cap' in locals():
                        cap.release()

        else:
            st.info("👆 Click 'Start Detection' to begin real-time emotion monitoring")
            st.markdown("""
            **Instructions:**
            1. Ensure your webcam is connected and accessible
            2. Position yourself clearly in front of the camera
            3. Click 'Start Detection' to begin monitoring
            4. The system will alert you if distress emotions are sustained for the configured duration
            """)

    with col2:
        st.header("📊 Real-Time Analytics")

        # Current status display
        st.subheader("Current Status")

        if st.session_state.emotion_tracker.emotion_buffer:
            current_emotion = st.session_state.emotion_tracker.current_emotion

            # Emotion status indicator
            emotion_colors = {
                'happy': '😊',
                'sad': '😢', 
                'angry': '😠',
                'fear': '😨',
                'surprise': '😲',
                'disgust': '🤢',
                'neutral': '😐'
            }

            st.markdown(f"### {emotion_colors.get(current_emotion, '😐')} {current_emotion.title()}")

            # Alert status
            distress_duration = st.session_state.emotion_tracker.get_distress_duration()
            if distress_duration > 0:
                progress = min(distress_duration / alert_threshold, 1.0)
                st.progress(progress)

                if distress_duration >= alert_threshold:
                    st.error(f"🚨 ALERT: Distress detected for {distress_duration:.1f}s")
                else:
                    st.warning(f"⚠️ Monitoring distress: {distress_duration:.1f}s")
            else:
                st.success("✅ No distress detected")

            # Emotion distribution chart
            if show_emotions_chart and len(st.session_state.emotion_tracker.emotion_buffer) > 1:
                st.subheader("Recent Emotion Distribution")

                emotions_list = list(st.session_state.emotion_tracker.emotion_buffer)
                emotion_counts = {}
                for e in emotions_list:
                    emotion_counts[e] = emotion_counts.get(e, 0) + 1

                chart_data = pd.DataFrame(
                    list(emotion_counts.items()),
                    columns=['Emotion', 'Count']
                )
                st.bar_chart(chart_data.set_index('Emotion'))

            # Emotion history
            if len(st.session_state.emotion_tracker.emotion_history) > 0:
                st.subheader("Recent Detection History")

                # Show last 10 detections
                recent_history = st.session_state.emotion_tracker.emotion_history[-10:]
                history_df = pd.DataFrame(recent_history)

                if not history_df.empty:
                    history_df['timestamp'] = history_df['timestamp'].dt.strftime('%H:%M:%S')
                    st.dataframe(
                        history_df[['timestamp', 'emotion', 'confidence']], 
                        use_container_width=True,
                        hide_index=True
                    )

        else:
            st.info("📊 Start detection to see live analytics")

        # System information
        st.markdown("---")
        st.subheader("⚙️ System Information")

        info_data = {
            "Alert Threshold": f"{alert_threshold} seconds",
            "Detection Threshold": f"{detection_threshold:.1f}",
            "Buffer Size": f"{EMOTION_WINDOW_SIZE} frames",
            "Monitored Emotions": ", ".join(DISTRESS_EMOTIONS)
        }

        for key, value in info_data.items():
            st.write(f"**{key}:** {value}")

if __name__ == "__main__":
    main()
