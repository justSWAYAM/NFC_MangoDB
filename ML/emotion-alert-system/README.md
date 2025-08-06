# Real-Time Emotion Detection & Alert System

A comprehensive real-time emotion detection system that monitors facial expressions via webcam and triggers alerts when sustained distress emotions (fear, anger, sadness) are detected for more than 10 seconds.

## Features

🎭 **Real-time Emotion Detection**: Uses DeepFace library for accurate emotion recognition
⚠️ **Automated Alert System**: Triggers alerts for sustained distress emotions
📊 **Live Analytics**: Real-time emotion distribution and history tracking
🎥 **Webcam Integration**: Works with any standard webcam
🔧 **Configurable Settings**: Adjustable thresholds and parameters
📱 **Responsive Interface**: Clean, professional Streamlit interface

## Supported Emotions

- Happy 😊
- Sad 😢
- Angry 😠
- Fear 😨
- Surprise 😲
- Disgust 🤢
- Neutral 😐

## Alert System

The system monitors for "distress emotions" (fear, anger, sadness) and triggers an alert when:
- The same distress emotion is sustained for more than 10 seconds (configurable)
- Uses a frame buffer with majority voting to reduce false positives
- Provides visual and audio feedback when alerts are triggered

## Installation

1. Clone or download this repository
2. Install the required packages:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
streamlit run emotion_detection_app.py
```

## Usage

1. **Start the Application**: Run the Streamlit app using the command above
2. **Configure Settings**: Use the sidebar to adjust detection thresholds and alert settings
3. **Start Detection**: Click "Start Detection" to begin webcam monitoring
4. **Monitor Results**: View real-time emotion detection and analytics in the interface
5. **Receive Alerts**: System will automatically alert when distress emotions are sustained

## Configuration Options

- **Detection Confidence Threshold**: Minimum confidence required to register an emotion
- **Alert Duration**: Time before triggering alert for sustained distress (5-30 seconds)
- **Show Live Chart**: Toggle real-time emotion distribution chart
- **Show Video Overlay**: Toggle emotion information overlay on video feed

## Technical Details

### Architecture
- **Frontend**: Streamlit web application
- **Computer Vision**: OpenCV for webcam capture and image processing
- **AI Model**: DeepFace library (built on TensorFlow) for emotion recognition
- **Real-time Processing**: Frame-by-frame analysis with optimized performance

### Alert Logic
1. **Frame Buffer**: Maintains a rolling buffer of recent emotion detections
2. **Majority Voting**: Uses statistical analysis to determine dominant emotion
3. **Time Tracking**: Monitors duration of sustained distress emotions
4. **Alert Trigger**: Activates alert when threshold duration is exceeded

### Performance Optimizations
- Processes every 3rd frame to balance accuracy and performance
- Uses majority voting to reduce noise and false positives
- Efficient memory management with circular buffers
- Optimized video processing pipeline

## Use Cases

- **Victim/Abuser Interviews**: Monitor emotional distress during conversations
- **Mental Health Monitoring**: Track emotional states over time
- **Security Applications**: Detect signs of distress or fear
- **Educational Research**: Study emotional responses in controlled environments
- **Therapy Sessions**: Assist therapists in monitoring patient emotional states

## System Requirements

- **Python**: 3.7 or higher
- **Webcam**: Any USB or built-in camera
- **RAM**: Minimum 4GB recommended
- **Processor**: Multi-core processor recommended for real-time processing
- **Operating System**: Windows, macOS, or Linux

## Privacy & Security

- **Local Processing**: All emotion detection runs locally on your machine
- **No Data Collection**: No personal data is stored or transmitted
- **Privacy First**: Webcam data stays on your device
- **Secure**: No external API calls or cloud dependencies

## Troubleshooting

### Camera Issues
- Ensure camera permissions are enabled for Python/Streamlit
- Close other applications using the camera
- Try different camera indices if multiple cameras are available

### Performance Issues
- Reduce detection confidence threshold
- Increase frame skip rate in the code
- Close other resource-intensive applications

### Installation Issues
- Use virtual environment to avoid package conflicts
- Update pip and setuptools: `pip install --upgrade pip setuptools`
- Install TensorFlow separately if needed: `pip install tensorflow`

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the system.

## License

This project is released under the MIT License.

## Disclaimer

This system is designed for educational and research purposes. For clinical or professional use cases, please consult with relevant experts and ensure compliance with applicable regulations and privacy laws.
