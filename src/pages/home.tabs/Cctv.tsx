import React, { useState, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';

const Cctv: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [motionDetected, setMotionDetected] = useState<boolean>(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      mediaRecorder.current = new MediaRecorder(stream);
      recordedChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const videoBlob = new Blob(recordedChunks.current, { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoUrl);

        // Stop all tracks in the stream to release the camera
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setRecording(true);

      // Start motion detection
      detectMotion();
    } catch (error) {
      console.error('Error starting video recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }

    // Stop motion detection
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const detectMotion = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });

    if (!video || !canvas || !ctx) return;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      let previousFrame: ImageData | null = null;

      const processFrame = () => {
        if (!video || !canvas || !ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (previousFrame) {
          const motion = compareFrames(previousFrame, currentFrame);
          if (motion) {
            console.log("🔴 Motion detected!");
            setMotionDetected(true); // ✅ Show intrusion alert
          }
        }

        previousFrame = currentFrame;
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(processFrame);
        }, 200);
      };

      requestAnimationFrame(processFrame);
    };
  };

  const compareFrames = (frame1: ImageData, frame2: ImageData): boolean => {
    const len = frame1.data.length;
    let diff = 0;
    const threshold = 20; // More sensitive

    for (let i = 0; i < len; i += 4) {
      const r1 = frame1.data[i], g1 = frame1.data[i + 1], b1 = frame1.data[i + 2];
      const r2 = frame2.data[i], g2 = frame2.data[i + 1], b2 = frame2.data[i + 2];

      const colorDiff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      diff += colorDiff;
    }

    return diff / (len / 4) > threshold;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>CCTV</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!recording ? (
          <IonButton expand="block" onClick={startRecording}>
            Start Recording
          </IonButton>
        ) : (
          <IonButton expand="block" color="danger" onClick={stopRecording}>
            Stop Recording
          </IonButton>
        )}

        {/* Live video feed */}
        <video
          ref={videoRef}
          style={{ width: '100%', marginTop: '20px', display: recording ? 'block' : 'none' }}
          muted
        />

        {/* Hidden canvas for motion detection */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Recorded video playback */}
        {videoUrl && (
          <video controls style={{ width: '100%', marginTop: '20px' }}>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* ✅ Custom Intrusion Alert */}
        {motionDetected && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h2 style={{ color: 'red', fontWeight: 'bold' }}>🚨 Intrusion Detected! 🚨</h2>
              <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                Motion detected in the camera feed!
              </p>
              <IonButton color="danger" onClick={() => setMotionDetected(false)}>
                Dismiss
              </IonButton>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

/* ✅ Styled Intrusion Alert */
const styles = {
  overlay: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '10px',
    border: '4px solid red',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
    textAlign: 'center' as 'center',
    maxWidth: '350px',
    width: '90%',
  },
};

export default Cctv;
