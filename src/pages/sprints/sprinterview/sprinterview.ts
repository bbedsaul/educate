import {Component, OnDestroy, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Storage} from '@ionic/storage';
import { IonicPage, Platform } from 'ionic-angular';
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {Sprinter} from "../../../models/sprinter";
import {StickyPopupPage} from "../stickypopup/stickypopup";
import {DragulaService} from "ng2-dragula";
import {Subscription} from "rxjs";
import {Store} from "@ngrx/store";
import * as fromUserProfile from "../../../providers/userprofile/userprofile.reducer";
import {FirestoreProvider} from "../../../providers/firestore/firestore";
import {ActivatedRoute, Router} from "@angular/router";
import * as fromTraining from "../../../providers/training/training.reducer";
import {PublishedTraining} from "../../../models/published-training";
import {MatDialog} from "@angular/material";
import {StickyPopInterface} from "../../../models/stickypop";
import {UserTraining} from "../../../models/user-training";
import * as UI from "../../../shared/ui.actions";
import {Sprint} from "../../../models/sprint";
import {UIService} from "../../../shared/ui.service";
import {UserProfile} from "../../../models/userprofile";
import {SprinterPopupPage} from "../sprinterpopup/sprinterpopup";

/**
 * Generated class for the SprinterviewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sprinterview',
  templateUrl: 'sprinterview.html',
})
export class SprinterPage implements OnInit, OnDestroy {
  height: string = "100px";
  width: string;
  avitarHeight: string = "60px";
  avitarWidth: string = "70px";
  sprinterCount: number = 0;
  portrait: boolean = true;
  todowidth:string = "33%";
  doingwidth:string = "13%";
  blockedwidth:string = "20%";
  completedwidth:string = "33%";
  cardHeight:string = '40px';
  cardWidth:string = '50px';
  mode: string;
  sprintDoc: Sprint;
  user: UserProfile;
  sprinters:Sprinter[] = [];
  subs: Subscription = new Subscription();
  publishedTraining: PublishedTraining[] = [];

  constructor( public platform: Platform,
               private dialog: MatDialog,
               private profileStore: Store<fromUserProfile.State>,
               private location: Location,
               private fsService: FirestoreProvider,
               private router: Router,
               private uiService: UIService,
               private storage: Storage,
               private route: ActivatedRoute,
               private store: Store<fromTraining.State>,
              private dragula: DragulaService ) {

    this.subs.add(dragula.drop.subscribe((args: any) => {
      let stickyNo:Element = args[1];
      let stickyArr = stickyNo.id.split(',');
      let to:Element = args[2];
      let toArr = to.id.split(',');
      let newstickyData:Element = args[4];
      let newStickyArr = to.id.split(',');

      let sticky: PublishedTraining = this.getSticky(parseInt(newStickyArr[0]), toArr[1], parseInt(toArr[0]))
      this.moveDraggedStickyItem(sticky, toArr[1], parseInt(toArr[0]));
      console.log("Drop Sticky :: " + stickyArr[0] + " from " + stickyArr[1] + " to " + toArr[1] + " for User index :: " + toArr[0]);
    }));
  }

  getSticky(index: number, type: string,  userIndex: number) {
    if(index >= this.sprinters[userIndex][type].length) index = this.sprinters[userIndex][type].length - 1;
    return this.sprinters[userIndex][type][index];

  }

  moveDraggedStickyItem(sticky:PublishedTraining, newStatus:string, userIndex:number) {
    // add it to the new array
    if(sticky !== undefined) {
      sticky.status = newStatus;

      // Need to do database update
      this.sprinters[userIndex].usertraining.doing = this.sprinters[userIndex].doing;
      this.sprinters[userIndex].usertraining.blocked = this.sprinters[userIndex].blocked;
      this.sprinters[userIndex].usertraining.completed = this.sprinters[userIndex].completed;

      if (this.mode !== 'preview')
        this.setDoc(this.sprinters[userIndex].usertraining, 'user-training/' + this.sprinters[userIndex].usertraining.id);
      else {
        // update the local storage
        this.publishedTraining.forEach((pubTrain: PublishedTraining) => {
          if (pubTrain.stickydata.id === sticky.stickydata.id) {
            pubTrain.status = newStatus;
            this.set('previewdata', this.publishedTraining)
              .then(() => {
                console.log('Preview data updated to local storage ');
              })
              .catch(err => {
                console.log('Error writing to local storage ::' + err);
              })
          }
        });
      }
    }
  }

  canDrag(userIndex:number) {
    return  (this.user.id === this.sprinters[userIndex].usertraining.userid);
  }

  moveSticky(myEvent, userIndex:number,  index:number, oldType:string, sticky: PublishedTraining) {

    sticky.status = oldType;
    let stickyPopData:StickyPopInterface = <StickyPopInterface>{
      "userindex": userIndex,
      "index": index,
      "width": window.screen.width,
    "owner": (this.user.id === this.sprinters[userIndex].usertraining.userid),
      "sticky":sticky
      };
//    if(this.sprinters[userIndex].email === this.user.email)
    const dialogRef = this.dialog.open(StickyPopupPage,
      { data: {
          payload: stickyPopData
        }
      });

    this.subs.add(dialogRef.afterClosed().subscribe(result => {
      console.log("dismissing sticky popup");
      if( result !== undefined ) {
        let newSticky = result.sticky as PublishedTraining;
        if(result.newstatus === 'tasks') {
          // Goto the tasks page.
          this.router.navigate(['/training/tasks', newSticky.stickydata.id, this.sprinters[userIndex].usertraining.id, this.mode]);
        } else {
          this.moveStickyItem(result.index, newSticky.status, result.newstatus, userIndex);
        }
      }
    }));
  }

  moveStickyItem(stickyIndex:number, oldStatus:string,  newStatus:string, userIndex:number) {
    // add it to the new array
    if(stickyIndex !== undefined && oldStatus !== undefined) {
      let sticky: PublishedTraining = this.sprinters[userIndex][oldStatus][stickyIndex];
      if(sticky !== undefined) {

        this.sprinters[userIndex][oldStatus].splice(stickyIndex, 1);
        this.sprinters[userIndex][newStatus].push(sticky);
        sticky.status = newStatus;

        // Need to do database update
        this.sprinters[userIndex].usertraining.doing = this.sprinters[userIndex].doing;
        this.sprinters[userIndex].usertraining.blocked = this.sprinters[userIndex].blocked;
        this.sprinters[userIndex].usertraining.completed = this.sprinters[userIndex].completed;

        if (this.mode !== 'preview')
          this.setDoc(this.sprinters[userIndex].usertraining, 'user-training/' + this.sprinters[userIndex].usertraining.id);
        else {
          // update the local storage
          this.publishedTraining.forEach((pubTrain: PublishedTraining) => {
            if (pubTrain.stickydata.id === sticky.stickydata.id) {
              pubTrain.status = newStatus;
              this.set('previewdata', this.publishedTraining)
                .then(() => {
                  console.log('Preview data updated to local storage ');
                })
                .catch(err => {
                  console.log('Error writing to local storage ::' + err);
                })
            }
          });
        }
      }
    }
  }

  async setDoc(doc: any, path: string) {
    try {
      await this.fsService.upsert(path, doc);
    } catch (err) {
      console.log(err)
    }
  }

  isPortrait() {
    return this.portrait;
  }

  onOrientationChange() {
    let height:number = (window.screen.height - 70) / this.sprinters.length;
    this.height = height + "px";
    this.width = window.screen.width + "px";

    if(height < 70) {
      this.cardHeight = "18px";
      this.cardWidth = "45px";
      this.avitarHeight = '30px';
      this.avitarWidth = '30px';
    } else {
      this.avitarHeight = '60px';
      this.avitarWidth = '70px';
      this.cardHeight = "40px";
      this.cardWidth = "50px";
    }

    this.portrait = (this.height > this.width);
    if(window.screen.width > 600) this.portrait = false;

    if(this.portrait)
        console.log("Orientation mode == Portrait");
    else
        console.log("Orientation mode == Landscape");
    console.log("Calculated height == " + this.height);
    console.log("Device height == " + window.screen.height);
    console.log("Device width == " + window.screen.width);
  }

  ngOnInit() {

    this.sprintDoc = <Sprint> {
      id: '',
      trainingid: '',
      name: '',
      displayname: '',
      description: '',
      ownerid: '',
      ownerName: '',
      ownerEmail: '',
      facilitatorid: '',
      facilitatorName: '',
      facilitatorEmail: '',
      sponsorid: '',
      sponsorName: '',
      sponsorEmail: '',
      meetingLink: '',
      startTime: 0,
      startDate: 0,
      endDate: 0,
      frequency: [],
      sprinters: [],
      sprintercount: 7
    };

    let publishedDataFetched = false;

    this.subs.add(this.store.select(fromUserProfile.getUserProfile).subscribe(
      (userprofile: UserProfile) => {
        if (userprofile === null || userprofile === undefined) return;
        this.user = userprofile;
      },
      (error) => {
        console.log(error);
      }
    ));

    this.mode = this.route.snapshot.params['mode'];
    if(this.mode === undefined) this.mode = 'live';

    this.store.dispatch(new UI.StartLoading());
    this.get("sprinterdata")
      .then((userArr:UserTraining[]) => {

        this.getSprinterCount(userArr);
        this.onOrientationChange();

        userArr.forEach( (usertraining, index) => {

          if (usertraining.permission === 'facilitator') {
            this.sprintDoc.facilitatorid = usertraining.userid;
            this.sprintDoc.facilitatorEmail = usertraining.email;
            this.sprintDoc.facilitatorName = usertraining.displayName;
          } else if (usertraining.permission === 'sponsor') {
            this.sprintDoc.sponsorid = usertraining.userid;
            this.sprintDoc.sponsorEmail = usertraining.email;
            this.sprintDoc.sponsorName = usertraining.displayName;
          } else if (usertraining.permission === 'owner') {
            this.sprintDoc.ownerid = usertraining.userid;
            this.sprintDoc.ownerEmail = usertraining.email;
            this.sprintDoc.ownerName = usertraining.displayName;
          } else {
            // Get UserTraining record with doinog[], blocked[] and completed[]
            // Omit those from the backlog above.
            this.subs.add(this.fsService.doc$('user-training/' + usertraining.id)
              .subscribe(
                (userTraining: UserTraining) => {

                  let sprinter = <Sprinter> {
                    email: userTraining.email,
                    displayName: userTraining.displayName,
                    usertraining: userTraining,
                    todo: [],
                    doing: [],
                    blocked: [],
                    completed: []
                  };

                  if (this.mode === 'live') {

                    if (userTraining.doing !== undefined)
                      sprinter.doing = userTraining.doing;
                    if (userTraining.blocked !== undefined)
                      sprinter.blocked = userTraining.blocked;
                    if (userTraining.completed !== undefined)
                      sprinter.completed = userTraining.completed;

                    // Get list of published-trainings for this trainingid/version
                    // Sets the TeamList for a type
                    if(!publishedDataFetched) {
                      publishedDataFetched = true;
                      this.subs.add(this.fsService.colWithIds$('published-trainings', ref =>
                        ref.where('version', '==', userTraining.version)
                          .where('trainingid', '==', userTraining.trainingid))
                        .subscribe(
                          (pubTrainingList: PublishedTraining[]) => {
                            this.publishedTraining = pubTrainingList;
                            // WHen I get this the one time, I am going to update all the sprinters.
                            this.sprinters.forEach(sprinter => {
                              sprinter.todo = pubTrainingList;
                              this.checkLists(sprinter);
                            });
                          }, (error) => {
                            console.log(("Error loading Published Trainings: " + error));
                          }));
                    } else {
                      sprinter.todo = JSON.parse(JSON.stringify(this.publishedTraining));
                      this.checkLists(sprinter);
                    }
                  } else {
                    // Get the publishedTraining list from local storage.
                    if(!publishedDataFetched) {
                      publishedDataFetched = true;
                      this.get("previewdata")
                        .then((data: PublishedTraining[]) => {
                          this.publishedTraining = data;
                          data.forEach((pubTrain: PublishedTraining) => {
                            if (pubTrain.status === 'todo')
                              sprinter.todo.push(pubTrain);
                            if (pubTrain.status === 'doing')
                              sprinter.doing.push(pubTrain);
                            if (pubTrain.status === 'blocked')
                              sprinter.blocked.push(pubTrain);
                            if (pubTrain.status === 'completed')
                              sprinter.completed.push(pubTrain);
                          });
                          this.checkLists(sprinter);
                        })
                        .catch(err => {
                          console.log("cannot get preview data from local storage :: " + err);
                        })
                    } else {
                      this.publishedTraining.forEach((pubTrain: PublishedTraining) => {
                        if (pubTrain.status === 'todo')
                          sprinter.todo.push(pubTrain);
                        if (pubTrain.status === 'doing')
                          sprinter.doing.push(pubTrain);
                        if (pubTrain.status === 'blocked')
                          sprinter.blocked.push(pubTrain);
                        if (pubTrain.status === 'completed')
                          sprinter.completed.push(pubTrain);
                      });
                      this.checkLists(sprinter);
                    }
                  }
                  let isNewSprinter = true;
                  for (var i = 0; i < this.sprinters.length; i++) {
                    if (this.sprinters[i].email === sprinter.email) {
                      // replce the array item
                      this.sprinters[i] = sprinter;
                      isNewSprinter = false;
                    }
                  }
                  if (isNewSprinter)
                    this.sprinters.push(sprinter);
                }, (error) => {
                  console.log(("Error loading User Trainings: " + error));
                }));
          }
        });
     //   this.remove('sprintdata');
      })
      .catch(err => {
        console.log("cannot get sprinter data from local storage :: " + err);
      })

    let __this = this;
    window.addEventListener("orientationchange", function(data) {
      __this.onOrientationChange();
      console.log("Orientation :: " + data);
    }, false);
  }

  private getSprinterCount(userArr: UserTraining[] ) {
    this.sprinterCount = 0;
    for(let i = 0; i < userArr.length; i++) {
      let user:UserTraining = userArr[i];
      if(user.permission === 'student')
        this.sprinterCount++;
    }
  }

  async set(settingName,value){
    await this.storage.set(`setting:${ settingName }`,value);
  }

  public async get(settingName){
    return await this.storage.get(`setting:${ settingName }`);
  }

  public async remove(settingName){
    return await this.storage.remove(`setting:${ settingName }`);
  }

  private checkLists(sprinter: Sprinter) {
    let filteredArr:PublishedTraining[] = sprinter.todo;
    if(filteredArr.length != this.publishedTraining.length)
      filteredArr = this.publishedTraining;

    filteredArr = filteredArr.filter(val => {
      return !sprinter.doing.find( doingVal => {
        return ((doingVal.moduledata.id === val.moduledata.id) && (doingVal.stickydata.id === val.stickydata.id));
      });
    });
    filteredArr = filteredArr.filter(val => {
      return !sprinter.blocked.find( blockedVal => {
        return ((blockedVal.moduledata.id === val.moduledata.id) && (blockedVal.stickydata.id === val.stickydata.id));
      });
    });
    filteredArr = filteredArr.filter(val => {
      return !sprinter.completed.find( completedVal => {
        return ((completedVal.moduledata.id === val.moduledata.id) && (completedVal.stickydata.id === val.stickydata.id));
      });
    });
    sprinter.todo = filteredArr;
  }

  openSprinterPopup(myEvent, user:Sprinter) {

    return;
    /*
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
    */
  }

  isPreview() {
    return (this.mode === 'preview' ? true : false);
  }

  goBack() {
    // window.history.back();
    this.location.back();

    console.log( 'goBack()...' );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
