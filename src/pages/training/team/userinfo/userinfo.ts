import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import {IonicPage} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Subscription} from "rxjs/index";
import {UserProfile} from "../../../../models/userprofile";

@IonicPage()
@Component({
  selector: 'userinfo',
  templateUrl: './userinfo.html',
})
export class UserinfoPage implements OnInit, OnDestroy {
  stickyForm: FormGroup;
  selectedNode: any;
  // Internal state
  private _state: 'loading' | 'synced' | 'created' | 'modified' | 'error';
  sub: Subscription = new Subscription();

  constructor( @Inject(MAT_DIALOG_DATA) public data:any,
               private dialogRef: MatDialogRef<UserinfoPage>,
               private fb: FormBuilder) {}

  ngOnInit() {

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
