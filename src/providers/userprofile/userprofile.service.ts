import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { UserProfile } from '../../models/userprofile';
import { UIService } from '../../shared/ui.service';
import * as UI from '../../shared/ui.actions';
import * as UserProfileActions from './userprofile.actions';
import * as fromUserProfile from './userprofile.reducer';
import {FirestoreProvider} from "../firestore/firestore";
import {UserTraining} from "../../models/user-training";

@Injectable()
export class UserprofileService {
  private fbSubs: Subscription[] = [];

  constructor(
    private uiService: UIService,
    private fsService: FirestoreProvider,
    private store: Store<fromUserProfile.State>
  ) {}

  fetchUserProfile(path:string, userid: string) {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.fsService.doc$(path)
        .subscribe(
          (userProfile: UserProfile) => {
            if(!(userProfile === undefined || userProfile === null)) {
              this.store.dispatch(new UI.StopLoading());
              userProfile.id = userid;
              this.store.dispatch(new UserProfileActions.SetUserprofile(userProfile));
            }
          },
          error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching User Profile failed, please try again later',
              null,
              3000
            );
          }
        )
    );
  }

  /*
  * Fetch all UserProfile records that are in the UserTraining table
   */
  fetchTeam() {
    this.store.dispatch(new UI.StartLoading());
    return this.fsService.colWithIds$('users').subscribe(
      (users: UserProfile[]) => {

        this.store.dispatch(new UI.StopLoading());
        //     this.store.dispatch(new UserProfileActions.SetAllUsers(users));
        return users;
      },
      (error) => {
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(
          'Fetching User Profiles failed, please try again later',
          null,
          3000
        );
        console.log(error);
      });
  }

  /*
* Fetch all Users with certain types
 */
  fetchUsersByType(permission:string, data:UserProfile[]) {

    this.store.dispatch(new UI.StartLoading());
    return this.fsService.colWithIds$('users', ref =>
        ref.where(permission, '==', true)).subscribe(
      (users: UserProfile[]) => {

        this.store.dispatch(new UI.StopLoading());
        //     this.store.dispatch(new UserProfileActions.SetAllUsers(users));
        data = users;
      },
      (error) => {
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(
          'Fetching Users failed, please try again later',
          null,
          3000
        );
        console.log(error);
      });
  }

  /*
  * Find a list of Users that are facilitators, specialists etc for a training where there is not already a UserTraining doc
   */
  fetchUsersWithoutUserTraingsByPermission (trainingId:string, permission:string) {
    let subs:Subscription[] = [];
     subs.push(this.fsService.colWithIds$('user-training', ref =>
      ref.where('trainingid', '==', trainingId)
        .where('permission', '==', permission))
      .subscribe(
        ( teamList: UserTraining[]) => {
          let teamMap: string[] = teamList.map(user => {
            return user.userid;
          });
          subs.push(this.fsService.colWithIds$('users', ref =>
            ref.where(permission, '==', true)).subscribe(
            ( users: UserProfile[]) => {
              this.store.dispatch(new UI.StopLoading());
              //  Filter ones that are already on the team
              let filteredList:UserProfile[] = [];
              users.filter(user  => {
                if( teamMap.indexOf(user.id) === -1 ) filteredList.push(user);
              });
              return filteredList;
            },
            (error) => {
              this.store.dispatch(new UI.StopLoading());
              this.uiService.showSnackbar(
                'Fetching Team Users failed, please try again later',
                null,
                3000
              );
            }));
        }, (error) => {
          console.log(("Error loading team: " + error));
        }));
     return [];
  }

  fetchAllUsers() {
    this.store.dispatch(new UI.StartLoading());
    return this.fsService.colWithIds$('users').subscribe(
        (users: UserProfile[]) => {

          this.store.dispatch(new UI.StopLoading());
     //     this.store.dispatch(new UserProfileActions.SetAllUsers(users));
          return users;
        },
        (error) => {
          this.store.dispatch(new UI.StopLoading());
          this.uiService.showSnackbar(
            'Fetching User Profiles failed, please try again later',
            null,
            3000
          );
          console.log(error);
        });
  }

  fetchTeamUsers() {
    this.store.dispatch(new UI.StartLoading());
    return this.fsService.colWithIds$('users', ref =>
      ref.where('facilitator', '==', true)).subscribe(
      ( users: UserProfile[]) => {
        this.store.dispatch(new UI.StopLoading());
        //  this.store.dispatch(new UserProfileActions.SetAllUsers(users));
        return users;
      },
      (error) => {
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(
          'Fetching Team Users failed, please try again later',
          null,
          3000
        );
      });
  }

  // Writes changes to Firestore
  setDoc(doc: any, path: string) {
    try {
      this.fsService.set(path, doc);
    } catch (err) {
      console.log(err)
    }
  }

  setUserData(user:any) {
    //const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const profileRef = this.fsService.doc(`users/${user.uid}`);
    let userProfile = {
      displayName: user.displayName,
      id: user.uid,
      fname: '',
      lname: '',
      email: user.email
    };
    return profileRef.set(userProfile, { merge: true })
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

}
