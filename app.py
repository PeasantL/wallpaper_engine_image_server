from engineio.async_drivers import threading
import sys
import os
import threading
import time
import random
import numpy as np
from flask import Flask, render_template, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import pyaudiowpatch as pyaudio
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtCore import QUrl, Qt

# Initialize Flask app
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# Initialize PyAudio
p = pyaudio.PyAudio()
default_speakers = p.get_default_wasapi_loopback()

# Adjust audio parameters
CHUNK = 1200  # Smaller chunk size for more frequent sampling
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = int(default_speakers["defaultSampleRate"])  # 48000
SAMPLE_SIZE = p.get_sample_size(FORMAT)

stream = p.open(
    format=FORMAT,
    channels=default_speakers["maxInputChannels"],
    rate=RATE,
    input=True,
    input_device_index=default_speakers["index"],
)

# Flag to control the audio streaming thread
stop_flag = threading.Event()

def audio_stream():
    while not stop_flag.is_set():
        data = np.frombuffer(stream.read(CHUNK), dtype=np.int16)
        socketio.emit('audio_data', data.tolist())
        time.sleep(0.05)  # Adjust to control data emission frequency

@app.route('/')
def index():
    return render_template('index.html')

IMAGE_FOLDER = r'C:\Users\samue\Documents\Github\ComfyUI\output\done'

@app.route('/random-image')
def random_image():
    images = [f for f in os.listdir(IMAGE_FOLDER) if f.endswith(('jpg', 'jpeg', 'png', 'gif'))]
    if not images:
        return jsonify({"error": "No images found"}), 404
    random_image = random.choice(images)
    return jsonify({"image": random_image})

@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)

# Initialize PyQt5 application
class Browser(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("HTML Viewer")
        self.setGeometry(5120, -720, 2560, 1080)

        self.browser = QWebEngineView()
        self.setCentralWidget(self.browser)

        # Use the relative path for the HTML file
        html_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.html')
        self.browser.setUrl(QUrl.fromLocalFile(html_file_path))

        # Show the window in full screen mode
        self.showFullScreen()

        # Set the window to be frameless
        self.setWindowFlag(Qt.FramelessWindowHint)

        # Set the window to stay behind other windows
        self.setWindowFlag(Qt.WindowStaysOnBottomHint)

        # Make the window transparent
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.browser.setStyleSheet("background:transparent;")

    def closeEvent(self, event):
        print("Closing PyQt Application")
        stop_flag.set()
        stream.stop_stream()
        stream.close()
        p.terminate()
        os._exit(0)

def run_flask():
    # Start the audio stream thread when the Flask app starts
    thread = threading.Thread(target=audio_stream)
    thread.start()
    socketio.run(app, host='0.0.0.0', port=5000, use_reloader=False)

def run_pyqt():
    app = QApplication(sys.argv)
    window = Browser()
    window.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    # Start the Flask server in a separate thread
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()

    # Run the PyQt application in the main thread
    run_pyqt()
