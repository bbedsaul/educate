import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';

/**
 * Generated class for the NodepopPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-nodepop',
  templateUrl: 'nodepop.html',
})
export class NodepopPage {

  constructor(public viewCtrl: ViewController ) {
    //this.user = this.navParams.get("user");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NodepopPage');
  }
  addNode(event) {
    console.log("Adding New Node");
    this.viewCtrl.dismiss();
  }

  deleteNode(event) {
    console.log("Delete Node");
//    this.navCtrl.setRoot(this.sprinterDetails, { user: user});
  }
}
