import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { MatSnackBar } from '@angular/material';
import { Store } from '@ngrx/store';

import { AuthData } from './auth-data.model';
import { UIService } from '../../shared/ui.service';
import * as fromRoot from '../../app/app.reducer';
import * as UI from '../../shared/ui.actions';
import * as Auth from './auth.actions';
import {UserprofileService} from "../userprofile/userprofile.service";
import {FirestoreProvider} from "../firestore/firestore";
import {UserProfile} from "../../models/userprofile";
import * as firebase from "firebase";

@Injectable()
export class AuthService {
  user;
  isVerify: boolean = false;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private fsProvider: FirestoreProvider,
    private uiService: UIService,
    private userProfileService: UserprofileService,
    private store: Store<fromRoot.State>
  ) {}

  initAuthListener() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.user = user;
        this.userProfileService.fetchUserProfile('users/' + user.uid, user.uid);
        if (user.emailVerified) {
          this.store.dispatch(new Auth.SetAuthenticated());
          this.store.dispatch(new Auth.SetEmailVerified());
          this.router.navigate(['/welcome']);
        } else {
          this.store.dispatch(new Auth.SetUnauthenticated());
          this.store.dispatch(new Auth.SetEmailUnVerified());
          this.isVerify = true;
          this.logout();
//          this.router.navigate(['/verify']);
          this.resendVerificationEmail(user.email);
        }
      } else {
        this.store.dispatch(new Auth.SetUnauthenticated());
        this.store.dispatch(new Auth.SetEmailUnVerified());
        if(!this.isVerify)
            this.router.navigate(['/login']);
        this.isVerify = false;
      }
    });
  }

  registerUser(authData: AuthData) {
    // this.uiService.loadingStateChanged.next(true);
    this.store.dispatch(new UI.StartLoading());
    this.afAuth.auth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        this.userProfileService.setUserData(result.user);

        this.addUserRecord(result.user, authData);
        result.user.sendEmailVerification()
          .then((success) => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar("Click the verification link in your Email", null, 3000);
          })
          .catch((err) => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(err.message, null, 3000);
          });
        this.store.dispatch(new UI.StopLoading());
      })
      .catch(error => {
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(error.message, null, 3000);
      });
  }

  private addUserRecord(user:firebase.User, authData: AuthData) {

    let docRef = this.fsProvider.getDocRef('users');
    let userRecord:UserProfile = <UserProfile> {
      id: docRef.ref.id,
      displayName: authData.fname,
      fname: authData.fname,
      lname: authData.lname,
      email: user.email,
      terms: authData.terms
    };
    this.setDoc(userRecord, 'users/' + userRecord.id );
  }

  // When Creating new docs
  // Writes changes to Firestore
private  async setDoc(doc: any, path: string) {
    try {
      await this.fsProvider.upsert(path, doc);
    } catch (err) {
      console.log(err)
    }
  }

  resetPassword( email: string) {
    this.afAuth.auth.sendPasswordResetEmail(email)
      .then((success) => {
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar("Check your email for password reset link.", null, 3000);
        this.router.navigate(['/login']);
      })
      .catch((err) => {
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(err.message, null, 3000);
      });
  }

  login(authData: AuthData) {
    // this.uiService.loadingStateChanged.next(true);
    this.store.dispatch(new UI.StartLoading());
    this.afAuth.auth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch(new UI.StopLoading());
      })
      .catch(error => {
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(error.message, null, 3000);
      });
  }

  resendVerificationEmail(email: string) {
    this.user.sendEmailVerification()
      .then((success) => {
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar("Verification Email Sent :: Click the verification link in your Email and then Login", null, 5000);
        this.router.navigate(['/login']);
      })
      .catch((err) => {
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(err.message, null, 3000);
      });
  }

  logout() {
    this.afAuth.auth.signOut();
    this.store.dispatch(new UI.StopLoading());
  }
}
