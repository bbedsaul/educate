import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {Sprinter} from "../../../models/sprinter";
import {SprinterDetailsPage} from '../sprinterdetails/sprinterdetails';

/**
 * Generated class for the SprinterpopupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sprinterpopup',
  templateUrl: 'sprinterpopup.html',
})
export class SprinterPopupPage {
  user: Sprinter;
  sprinterDetails = SprinterDetailsPage;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
    this.user = this.navParams.get("user");
  }

  close(event, option:string) {
    console.log("sprinter popup choosen action:: " + option);
    this.viewCtrl.dismiss(option, this.navParams.data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SprinterPopup Page');
  }

  openSprinterDetails(user) {
    console.log("Opening Sprinter Details");
    this.navCtrl.setRoot(this.sprinterDetails, { user: user});
  }
}
