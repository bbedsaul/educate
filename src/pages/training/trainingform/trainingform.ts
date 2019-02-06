import {Component, OnInit, OnDestroy, Inject} from '@angular/core';

import {Training} from "../../../models/training";
import {IonicPage} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {tap} from "rxjs/operators";
import {Subscription} from "rxjs/index";
import {ValidateVideo} from "../../../validations/videourl";
import {EmbedVideoService} from "ngx-embed-video/dist";

@IonicPage()
@Component({
  selector: 'training-form',
  templateUrl: './trainingform.html',
})
export class TrainingFormPage implements OnInit, OnDestroy {
  // Internal state
  private _state: 'loading' | 'synced' | 'created' | 'modified' | 'error';
  formDoc: Training;
  selectedNode: any;
  trainingForm: FormGroup;
  isPublished: boolean = false;
  trainingFormSub: Subscription = new Subscription();
  path: string = '';

  constructor( @Inject(MAT_DIALOG_DATA) public data:any,
              private dialogRef: MatDialogRef<TrainingFormPage>,
              private embedService: EmbedVideoService,
              private fb: FormBuilder) {}

  ngOnInit() {

    this.trainingForm = this.fb.group({
      description: ['', [
        Validators.required
      ]],
      video: ['', [
        ValidateVideo.bind(this)
      ]],
      name: ['', [
        Validators.required
      ]],
      published: {value: false},
      version: {value: 0, },
      pubdescription: ''
    });
//    <mat-slide-toggle [formControlName]="X" [checked]="X.value" (click)="X.value =!X.value" color="primary">{{X.value ? 'ON' : 'OFF'}}</mat-slide-toggle>
    this.selectedNode = this.data.payload;
    this.formDoc = this.selectedNode.data.payload;
    this.formDoc.published = false;
    this.formDoc.pubdescription = '';
    if(this.formDoc.version === undefined) this.formDoc.version = 0;
    this.trainingForm.patchValue(this.formDoc as any);
    this.trainingForm.markAsPristine();
    this.path = '/trainings/' + this.formDoc.id;

    this.trainingFormSub.add(this.trainingForm.valueChanges
      .pipe(
        tap(change => {
          this.state = 'modified';
        })
      )
      .subscribe());
  }
  // Setter for state changes
  set state(val) {
    this._state = val;
  }

  enableSubmit() {
    if( this.trainingForm.valid && this._state === 'modified')
      return false;

    return true;
  }

  onSubmit(e) {
    this.formDoc = this.trainingForm.getRawValue();
    this.selectedNode.topic = this.formDoc.name;
    this.selectedNode.data.payload = this.formDoc;
    this.dialogRef.close(this.selectedNode);
  }

  ifPublished($event) {
    if(!this.isPublished){
      this.trainingForm.controls['version'].setValue(this.formDoc.version + 1);
      this.trainingForm.controls['pubdescription'].setValue('');
      this.isPublished = true;
    } else {
      // reset form fields to those in the doc
      this.trainingForm.controls['version'].setValue(this.formDoc.version);
      this.trainingForm.controls['pubdescription'].setValue(this.formDoc.pubdescription);
      this.isPublished = false;
    }
  }

  previewTraining() {
    this.dialogRef.close('PREVIEW');
  }

  addModule() {
    this.dialogRef.close('ADDNODE');
  }

  saveTraining() {
    this.dialogRef.close('SAVE');
  }

  cancelUpdate() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.trainingFormSub.unsubscribe();
  }
}
