import {Component, OnInit, OnDestroy, Inject, ViewChild} from '@angular/core';
import {IonicPage} from "ionic-angular";
import {MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
import {Subscription} from "rxjs/index";
import {UserProfile} from "../../../models/userprofile";
import {UserTraining} from "../../../models/user-training";
import * as UI from "../../../shared/ui.actions";
import {UIService} from "../../../shared/ui.service";
import {UserprofileService} from "../../../providers/userprofile/userprofile.service";
import {Store} from "@ngrx/store";
import * as fromUserProfile from "../../../providers/userprofile/userprofile.reducer";
import {FirestoreProvider} from "../../../providers/firestore/firestore";
import {ActivatedRoute, Router} from "@angular/router";
import {UserDialogInterface} from "../../../models/userdialog";

@IonicPage()
@Component({
  selector: 'user-dialog',
  templateUrl: './user-dialog.html',
})
export class UserDialogPage implements OnInit, OnDestroy {
  displayedColumns = ['displayName', 'email'];
  dataSource = new MatTableDataSource<UserProfile>();
  subs: Subscription = new Subscription();
  plData:UserDialogInterface;
  teamList: string[] = [];
  title: string = 'Add Facilitators';
  // Internal state
  private _state: 'loading' | 'synced' | 'created' | 'modified' | 'error';

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor( @Inject(MAT_DIALOG_DATA) public data:any,
               private dialogRef: MatDialogRef<UserDialogPage>,
               private uiService:UIService,
               private userService: UserprofileService,
               private store: Store<fromUserProfile.State>,
               private fsService: FirestoreProvider) {}

  ngOnInit() {

    this.plData = this.data.payload;

    if (this.plData.type === 'facilitator') this.title = 'Add Facilitators';
    else if (this.plData.type === 'sprinter') this.title = 'Add Sprinters';
    else if (this.plData.type === 'specialist') this.title = 'Add Specialists';

    this.dataSource.filterPredicate = (data: UserProfile, filter: string) => {
//      if(filter !== '####No Filtering####')
      const dataStr:string = Object.keys(data).map(key=>data[key])
        .map(x => {
          if(typeof x === 'string')
            return x.substr(0, x.length - 1)
        }).join('');

      if(this.plData.lookuptype === 'team') {
        if(this.teamList.indexOf(data.id) === -1) return true;
          return false;
      } else {
        if(this.teamList.indexOf(data.id) === -1) return false;
        return true;
      }
    }

    // Sets the TeamList for a type
    this.subs.add(this.fsService.colWithIds$('user-training', ref =>
      ref.where('trainingid', '==', this.plData.trainingid)
        .where('permission', '==', this.plData.type))
      .subscribe(
        ( teamList: UserTraining[]) => {
          this.teamList = teamList.map(user => {
            return user.userid;
          });
          // If type is sprint then remap all teamList into dataSource
          if(this.plData.lookuptype === 'sprint') {
            let userProfileList:UserProfile[] = teamList.map( user => {
              let userProfile = <UserProfile>{
                id: user.userid,
                usertrainingid: user.id,
                displayName: user.displayName,
                email: user.email
              };
              return userProfile;
            });
            this.dataSource.data = userProfileList;
          }
          this.dataSource.filter = '####No Filtering####';
        }, (error) => {
          console.log(("Error loading team: " + error));
        }));

    if(this.plData.lookuptype === 'team') {
      // Get the users with type
      this.subs.add(this.fsService.colWithIds$('users', ref =>
        ref.where(this.plData.type, '==', true)).subscribe(
        (users: UserProfile[]) => {
          this.store.dispatch(new UI.StopLoading());
          this.dataSource.data = users;
          this.dataSource.filter = '####No Filtering####';
        },
        (error) => {
          this.store.dispatch(new UI.StopLoading());
          this.uiService.showSnackbar(
            'Fetching Team Users failed, please try again later',
            null,
            3000
          );
        }));
    }

    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // Setter for state changes
  set state(val) {
    this._state = val;
  }

  addUser(user:any) {

    this.plData.userid = user.id;
    this.plData.displayName = user.displayName;
    this.plData.email = user.email;
    if(user.usertrainingid !== undefined)
      this.plData.usertrainingid = user.usertrainingid;
    this.dialogRef.close(this.plData);
  }

  cancelUpdate() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
