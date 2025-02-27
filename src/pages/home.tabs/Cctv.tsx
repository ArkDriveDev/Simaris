import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

const Cctv: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const recordVideo = async () => {
    try {
      const video = await Camera.getVideo({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      setVideoUrl(video.webPath || null);

      // Save the video to the device's file system
      if (video.path) {
        const savedFile = await Filesystem.writeFile({
          path: `videos/${new Date().getTime()}.mp4`,
          data: await fetch(video.webPath!).then((res) => res.blob()),
          directory: Directory.Data,
        });

        console.log('Video saved:', savedFile.uri);
      }
    } catch (error) {
      console.error('Error recording video:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>CCTV</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={recordVideo}>
          Record Video
        </IonButton>
        {videoUrl && (
          <video controls style={{ width: '100%', marginTop: '20px' }}>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Cctv;