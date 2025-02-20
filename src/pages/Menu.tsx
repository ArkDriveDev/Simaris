import { 
    IonButton,
    IonButtons,
      IonContent, 
      IonHeader, 
      IonIcon, 
      IonItem, 
      IonMenu, 
      IonMenuButton, 
      IonMenuToggle, 
      IonPage, 
      IonRouterOutlet, 
      IonTitle, 
      IonToolbar 
  } from '@ionic/react'
  import {homeOutline, informationOutline, logOutOutline, rocketOutline} from 'ionicons/icons';
import { Redirect, Route } from 'react-router';
import Home from './Home';
import About from './About';
import Details from './Details';
  const Menu: React.FC = () => {
    const path = [
        {name:'Home', url: '/it35-lab/app/home', icon: homeOutline},
        {name:'About', url: '/it35-lab/app/about', icon: rocketOutline},
        {name:'Details', url: '/it35-lab/app/details', icon: informationOutline}
    ]

    return (
        <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu Content</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
        {path.map((item,index) =>(
                            <IonMenuToggle key={index}>
                                <IonItem routerLink={item.url} routerDirection="forward">
                                    <IonIcon icon={item.icon} slot="start"></IonIcon>
                                    {item.name}
                                </IonItem>
                            </IonMenuToggle>
                        ))}
        <IonButton routerLink="/it35-lab" routerDirection="back" expand="full">
                            <IonIcon icon={logOutOutline} slot="start"> </IonIcon>
                        Logout
                        </IonButton>
        </IonContent>
      </IonMenu>
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
            </IonButtons>
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
        <IonRouterOutlet id="main">
        <Route exact path="/it35-lab/app/home" component={Home} />
                    <Route exact path="/it35-lab/app/details" component={Details} />
                    <Route exact path="/it35-lab/app/about" component={About} />

                    <Route exact path="/it35-lab/app">
                        <Redirect to="/it35-lab/app/home"/>
                    </Route>
                </IonRouterOutlet>
        </IonContent>
      </IonPage>
    </>
    );
  };
  
  export default Menu;