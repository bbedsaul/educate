import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import {IonicPage} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {tap} from "rxjs/operators";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Subscription} from "rxjs/index";
import {Sticky} from "../../../models/sticky";
import {ValidateVideo} from "../../../validations/videourl";
import {EmbedVideoService} from "ngx-embed-video/dist";

@IonicPage()
@Component({
  selector: 'sticky-form',
  templateUrl: './stickyform.html',
})
export class StickyFormPage implements OnInit, OnDestroy {
  stickyForm: FormGroup;
  selectedNode: any;
  // Internal state
  private _state: 'loading' | 'synced' | 'created' | 'modified' | 'error';
  formDoc: Sticky;
  stickyFormSub: Subscription = new Subscription();
  dropdown: number[] = [];

  constructor( @Inject(MAT_DIALOG_DATA) public data:any,
               private dialogRef: MatDialogRef<StickyFormPage>,
               private embedService: EmbedVideoService,
               private fb: FormBuilder) {}

  ngOnInit() {

    this.stickyForm = this.fb.group({
      stickyNo: [0, [
        Validators.required
      ]],
      description: ['', [
        Validators.required
      ]],
      video: ['', [
        ValidateVideo.bind(this)
      ]],
      points: '',
      minutes: '',
      name: ['', [
        Validators.required
      ]]
    });

    this.selectedNode = this.data.payload;
    this.formDoc = this.selectedNode.data.payload;

    // Fix that strings are passed
    let stickyNo = Number(this.formDoc.stickyNo);
    delete this.formDoc.stickyNo;
    this.formDoc.stickyNo = stickyNo;

    this.stickyForm.patchValue(this.formDoc);
    this.stickyForm.markAsPristine();
    this.getDropDown(this.data.dropdown);

    this.stickyFormSub.add(this.stickyForm.valueChanges
      .pipe(
        tap(change => {
          this.state = 'modified';
        })
      )
      .subscribe());
  }

  getDropDown(input: any[]) {
    let cleanArr:string[] = [];
    // Make all strings
    input.forEach(item => {
      if(typeof item === 'number') cleanArr.push(item.toString());
      else cleanArr.push(item);
    });
    for( let i = 1; this.dropdown.length < 15; i++) {
      if ( cleanArr.indexOf(i.toString()) < 0 )
        this.dropdown.push(i);
    }
    return;
  }

  // Setter for state changes
  set state(val) {
    this._state = val;
  }

  enableSubmit() {
    if( this.stickyForm.valid && this._state === 'modified')
      return false;

    return true;
  }

  onSubmit(e) {
    this.formDoc = this.stickyForm.getRawValue();
    this.selectedNode.topic = this.formDoc.name;
    this.selectedNode.data.payload = this.formDoc;
    this.dialogRef.close(this.selectedNode);
  }

  deleteSticky() {
    this.dialogRef.close('DELETE');
  }

  addTask() {
    this.dialogRef.close('ADDNODE');
  }

  cancelUpdate() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.stickyFormSub.unsubscribe();
  }
}
