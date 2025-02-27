import React, { useState, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonAlert } from '@ionic/react';

const Cctv: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [motionDetected, setMotionDetected] = useState<boolean>(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const alertCooldownRef = useRef<boolean>(false); // Prevents spamming alerts

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

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let previousFrame: ImageData | null = null;

    const processFrame = () => {
      if (!video || !canvas || !ctx) return;

      // Draw the current video frame onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the current frame's pixel data
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (previousFrame) {
        // Compare the current frame with the previous frame
        const motion = compareFrames(previousFrame, currentFrame);

        if (motion && !alertCooldownRef.current) {
          alertCooldownRef.current = true;
          setMotionDetected(false); // Reset first
          setTimeout(() => {
            setMotionDetected(true);
            alertCooldownRef.current = false; // Allow alert after cooldown
          }, 2000); // 2-second cooldown
        }
      }

      // Save the current frame for the next comparison
      previousFrame = currentFrame;

      // Continue processing frames, but reduce frequency
      setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }, 200); // Process every 200ms instead of every frame
    };

    // Start processing frames
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const compareFrames = (frame1: ImageData, frame2: ImageData): boolean => {
    const len = frame1.data.length;
    let diff = 0;

    // Compare pixel data between frames
    for (let i = 0; i < len; i += 4) {
      const r1 = frame1.data[i];
      const g1 = frame1.data[i + 1];
      const b1 = frame1.data[i + 2];

      const r2 = frame2.data[i];
      const g2 = frame2.data[i + 1];
      const b2 = frame2.data[i + 2];

      // Calculate the difference between RGB values
      diff += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    }

    // Normalize the difference
    const avgDiff = diff / (len / 4);

    // Trigger motion detection if the difference exceeds a threshold
    const threshold = 50; // Adjust this value based on sensitivity
    return avgDiff > threshold;
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

        {/* Motion detection alert */}
        <IonAlert
          isOpen={motionDetected}
          onDidDismiss={() => setMotionDetected(false)}
          header="Intrusion Detected!"
          message="Motion has been detected in the video feed."
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Cctv;
