import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, Platform, PopoverController} from 'ionic-angular';
import {Sprinter} from "../../../models/sprinter";
import {UserProfile} from "../../../models/userprofile";
import {DragulaService} from "ng2-dragula";
import {StickyPopupPage} from "../stickypopup/stickypopup";
import {Sticky} from "../../../models/sticky";
import {SprinterPage} from "../sprinterview/sprinterview";
import {Sprint} from "../../../models/sprint";
import {SprinterPopupPage} from "../sprinterpopup/sprinterpopup";
import {SprinterDetailsPage} from "../sprinterdetails/sprinterdetails";
import {StickyDetailsPage} from "../stickydetails/stickydetails";

/**
 * Generated class for the TeamviewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-teamview',
  templateUrl: 'teamview.html',
})
export class TeamPage {

  height: string;
  width: string;
  portrait: boolean = true;
  todowidth:string = "33%";
  doingwidth:string = "13%";
  blockedwidth:string = "20%";
  completedwidth:string = "33%";


  // Get the Current Users Profile.
  user: UserProfile;
  // The chosen Sprint
  sprinters: Sprinter[] = [];
  // Sprint id always starts at 0
  sprintid: string = "sprint1";
  sprint: Sprint;

  sprinterPage = SprinterPage;
  sprinterDetails = SprinterDetailsPage;
  stickyDetails = StickyDetailsPage;

  constructor(public navCtrl: NavController,
              public platform: Platform,
              public navParams: NavParams,
              private dragulaService: DragulaService,
              private popoverCtrl: PopoverController ) {

    this.sprint = null;
    this.sprinters = null;
    this.onOrientationChange();

/*    let user = this.authProvider.getCurrentUser();
    if(user !== null) {
      console.log("IN TEAMVIEW page Email is :: " + user.email);
    }
    */

  }

  openSprinterPopup(myEvent, user:Sprinter) {
    let popover = this.popoverCtrl.create(SprinterPopupPage,{"user": user }, {cssClass:'sprinterpopup'});
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss( (pageType: string, jsonObj:string) => {
      console.log("dismissing sprinter popup");
      if(jsonObj !== undefined ) {
        let json = JSON.parse(JSON.stringify(jsonObj));
        if (json !== null && json.user !== undefined) {
          if (pageType === 'details')
            this.navCtrl.setRoot(this.sprinterPage, {user: json.user});
          if (pageType === 'profile')
            this.navCtrl.setRoot(this.sprinterDetails, {user: json.user});
        }
      }
    })
  }

  openStickyPopup(myEvent, userIndex:number,  index:number, oldType:string, sticky: Sticky) {
//    if(this.sprinters[userIndex].email === this.user.email)
    let popover = this.popoverCtrl.create(StickyPopupPage,{"userindex": userIndex, "index": index, "oldtype": oldType, "sticky":sticky }, {cssClass:'stickypopup'});
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss( (newType:string, jsonObj:string) => {
      console.log("dismissing sticky popup");
      if(jsonObj !== undefined ) {
        let json = JSON.parse(JSON.stringify(jsonObj));
        if(newType === 'details')
          this.navCtrl.setRoot(this.stickyDetails, {user: json.user});
        else
          this.moveStickyItem(json.userindex, json.index, json.oldtype, newType);
      }
    })
  }

  moveStickyItem(userIndex:number, stickyIndex:number,  oldType:string, newType:string) {
    // add it to the new array
    if(userIndex !== undefined && stickyIndex !== undefined && oldType !== undefined) {
      let sticky: Sticky = this.sprinters[userIndex][oldType][stickyIndex];
      this.sprinters[userIndex][oldType].splice(stickyIndex, 1);
      this.sprinters[userIndex][newType].push(sticky);
    }
  }

  onOrientationChange() {
    this.height = ((window.screen.height - 40) / this.sprinters.length) + "px";
    this.width = window.screen.width + "px";

    this.portrait = (this.height > this.width);
    console.log("Device height == " + window.screen.height);
    console.log("Device width == " + window.screen.width);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TeamviewPage');

    let _this = this;
    window.addEventListener("orientationchange", function(data) {
      _this.onOrientationChange();
      console.log("Orientation :: " + data);
    }, false);
  }
  /*
    this.platform.ready().then(() => {
      let user = firebase.auth().currentUser;
      if(user !== null) {
        this.user = new UserProfile(user.displayName,
          user.email,
          user.photoURL);
        //this.sprinters.push(this.userProvider.getUserInfo());
        this.sprinters = this.sprintProvider.getSprintInfo(this.sprintid);
        this.onOrientationChange();
      }
    });
  Sets the stickies for the current sprint into the user.
  setCurrentStickies(user:Sprinter, sprint:number) {
    user.todo = this.sprints[0].sprinters[0].].todo;
    user.blocked = this.sprints[0].sprinters[0].modules[0].blocked;
    user.doing = this.sprints[0].sprinters[0].modules[0].doing;
    user.completed = this.sprints[0].sprinters[0].modules[0].completed;
  }

  getStickyTypes() {
    let types:string[] = [];
    for( let type in StickyTypes ) {
      console.log("type is :: " + StickyTypes[type]);
      types.push(StickyTypes[type]);
    }
    return types;
  }

  getStickies(user: Sprinter, type:StickyTypes) {
//    this.getCurrentSprint();
    console.log("Getting stickies for type :: " + type);
    console.log("getting number of sprinters :: " + this.sprinters.length);
    console.log("getting number of TODO Stickies :: " + user.mySprints[0].sprinters[0].modules[0].todo.length);
    console.log("getting number of DOING Stickies :: " + user.mySprints[0].sprinters[0].modules[0].doing.length);
    console.log("getting number of BLOCKED Stickies :: " + user.mySprints[0].sprinters[0].modules[0].blocked.length);
    console.log("getting number of COMPLETED Stickies :: " + user.mySprints[0].sprinters[0].modules[0].completed.length);
    if(type === StickyTypes.todo)
        return user.mySprints[0].sprinters[0].modules[0].todo;
    else if (type === StickyTypes.complete)
      return user.mySprints[0].sprinters[0].modules[0].completed;
    else if (type === StickyTypes.doing)
      return user.mySprints[0].sprinters[0].modules[0].doing;
    else if (type === StickyTypes.blocked)
      return user.mySprints[0].sprinters[0].modules[0].blocked;
  }

  getCurrentSprint() {
    return this.currentSprint;
  }
   */



}
