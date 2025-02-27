import { 
  IonButton,
    IonButtons,
      IonContent, 
      IonHeader, 
      IonIcon, 
      IonLabel, 
      IonMenuButton, 
      IonPage, 
      IonRouterOutlet, 
      IonTabBar, 
      IonTabButton, 
      IonTabs, 
      IonTitle, 
      IonToolbar 
  } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { cameraOutline, search, bookOutline } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';

import Favorites from './home.tabs/Favorites';
import Cctv from './home.tabs/Cctv';
import Search from './home.tabs/Search';
  
  const Home: React.FC = () => {

    const tabs = [
      {name:'Cctv', tab:'cctv',url: '/simaris/app/home/cctv', icon: cameraOutline},
      {name:'Search', tab:'search', url: '/simaris/app/home/search', icon: search},
      {name:'Favorites',tab:'favorites', url: '/simaris/app/home/favorites', icon: bookOutline},
    ]
    
    return (
      <IonReactRouter>
        <IonTabs>
          <IonTabBar slot="bottom">

            {tabs.map((item, index) => (
              <IonTabButton key={index} tab={item.tab} href={item.url}>
                <IonIcon icon={item.icon} />
                <IonLabel>{item.name}</IonLabel>
              </IonTabButton>
            ))}
            
          </IonTabBar>
        <IonRouterOutlet>

          <Route exact path="/simaris/app/home/cctv" component={Cctv} />
          <Route exact path="/simaris/app/home/search" render={Search} />
          <Route exact path="/simaris/app/home/favorites" render={Favorites} />

          <Route exact path="/simaris/app/home">
            <Redirect to="/simaris/app/home/search" />
          </Route>

        </IonRouterOutlet>
        </IonTabs>
      </IonReactRouter>
    );
  };
  
  export default Home;