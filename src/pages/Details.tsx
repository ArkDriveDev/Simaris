import { 
  IonButtons,
    IonContent, 
    IonHeader,  
    IonPage, 
    IonTitle, 
    IonToolbar,
    IonCard, 
    IonCardContent, 
    IonCardHeader, 
    IonCardSubtitle, 
    IonCardTitle,
    IonButton
} from '@ionic/react';

const Details: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
          </IonButtons>
          <IonTitle>Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <IonCard>
      <IonCardHeader>
        <IonCardTitle>Card Title</IonCardTitle>
        <IonCardSubtitle>Card Subtitle</IonCardSubtitle>
      </IonCardHeader>

      <IonCardContent>
      <h1>Hey there I love you</h1>
      <IonButton>click me</IonButton>
      <IonButton disabled={true}>Disabled</IonButton>
      </IonCardContent>
    </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Details;