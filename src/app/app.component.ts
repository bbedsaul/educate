import {Component, OnInit} from '@angular/core';
import {Platform, MenuController} from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { LoginPage } from "../pages/login/login";
import {AuthService} from "../providers/auth/auth.service";


@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  rootPage: any = LoginPage;

  constructor(platform: Platform,
              private authService: AuthService,
              private statusbar: StatusBar,
              private splashscreen: SplashScreen) {

    this.statusbar.styleDefault();
    this.splashscreen.hide();
  }

  ngOnInit() {
    this.authService.initAuthListener();
  }
}
