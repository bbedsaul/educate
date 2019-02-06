import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromUserProfile from '../../providers/userprofile/userprofile.reducer';
import {UserProfile} from "../../models/userprofile";
import {IonicPage} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FirestoreProvider} from "../../providers/firestore/firestore";

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: './userprofile.html',
})
export class UserProfilePage implements OnInit {
  userProfileForm: FormGroup;
  state: string;
  formDoc: UserProfile;
  path: string;

  constructor( private fb: FormBuilder,
              private fsProvider:FirestoreProvider,
              private store: Store<fromUserProfile.State>) {}

  ngOnInit() {
    this.userProfileForm = this.fb.group({
      email: ['', Validators.required ],
      displayName: '',
      fname: '',
      lname: '',
      phone: '',
      photoUrl: ''
    });

    this.state = 'loading';
    this.store.select(fromUserProfile.getUserProfile).subscribe(
      (userprofile: UserProfile) => {
        if (userprofile === null || userprofile === undefined) return;
        this.formDoc = userprofile;
        this.path = '/users/' + userprofile.id;

        this.userProfileForm.patchValue(userprofile);
        this.userProfileForm.markAsPristine();
        this.state = 'synced';
      },
      (error) => {
        console.log(error);
      }
    );
  }
  changeHandler(e) {
    // console.log(e)
    this.state = e;
  }
}
