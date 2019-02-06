import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import {environment} from "../environments/environment";
import {AngularFireModule} from "angularfire2";
import {AngularFireAuthModule} from 'angularfire2/auth';
import { AngularFirestoreModule } from "angularfire2/firestore";
import {HttpClientModule} from "@angular/common/http";
import {WelcomePage} from "../pages/welcome/welcome";
import {AuthService} from "../providers/auth/auth.service";
import {MaterialModule} from "./material.module";
import {StoreModule} from "@ngrx/store";
import {reducers} from "./app.reducer";
import {AppRoutingModule} from "./app-routing.module";
import {SidenavPage} from "../pages/navigation/sidenav-list/sidenav-list";
import {HeaderPage} from "../pages/navigation/header/header";
import {UIService} from "../shared/ui.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FlexLayoutModule} from "@angular/flex-layout";
import {AuthModule} from "../providers/auth/auth.module";
import {ComingSoonPage} from "../pages/comingsoon/comingsoon";
import {UserprofileService} from "../providers/userprofile/userprofile.service";
import {userprofileReducer} from "../providers/userprofile/userprofile.reducer";
import {SprintService} from "../providers/sprints/sprint.service";
import {SprintsPage} from "../pages/sprints/sprints";
import {UserDialogPage} from "../pages/sprints/user-dialog/user-dialog";
import {StickyPopupPage} from "../pages/sprints/stickypopup/stickypopup";
import {DragulaModule} from "ng2-dragula";
import {EmbedVideo} from "ngx-embed-video/dist";
import {HttpModule} from '@angular/http';
import {IonicStorageModule} from "@ionic/storage";
import { InAppBrowser } from "@ionic-native/in-app-browser";


@NgModule({
  declarations: [
    MyApp,
    WelcomePage,
    SprintsPage,
    ComingSoonPage,
    HeaderPage,
    UserDialogPage,
    StickyPopupPage,
    SidenavPage
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    AppRoutingModule,
    FlexLayoutModule,
    AngularFireModule.initializeApp( environment.firebase ),
    AngularFireAuthModule,
    AuthModule,
    DragulaModule,
    AngularFirestoreModule,
    StoreModule.forRoot(reducers),
    HttpModule,
    EmbedVideo.forRoot(),
    StoreModule.forFeature('userprofile', userprofileReducer),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    WelcomePage,
    SprintsPage,
    ComingSoonPage,
    HeaderPage,
    UserDialogPage,
    StickyPopupPage,
    SidenavPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthService,
    UserprofileService,
    SprintService,
    InAppBrowser,
    UIService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {
  constructor() {
    console.log("ENVIRONMENT :: " + JSON.stringify(environment.firebase));
  }
}
