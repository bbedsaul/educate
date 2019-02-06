import {Component, Inject, OnInit, OnDestroy} from '@angular/core';
import {Module} from "../../../models/module";
import {IonicPage} from "ionic-angular";
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs/index";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {tap} from "rxjs/operators";
import {EmbedVideoService} from "ngx-embed-video/dist";
import { ValidateVideo } from "../../../validations/videourl";

@IonicPage()
@Component({
  selector: 'page-module-form',
  templateUrl: './moduleform.html',
})
export class ModuleFormPage implements OnInit, OnDestroy {
  moduleForm: FormGroup;
  selectedNode: any;
  // Internal state
  private _state: 'loading' | 'synced' | 'created' | 'modified' | 'error';
  formDoc: Module;
  dropdown: number[] = [];
  moduleFormSub: Subscription = new Subscription();

  constructor( @Inject(MAT_DIALOG_DATA) public data:any,
               private dialogRef: MatDialogRef<ModuleFormPage>,
               private embedService: EmbedVideoService,
               private fb: FormBuilder) {}

  ngOnInit() {

    this.moduleForm = this.fb.group({
      moduleNo: [0, [
        Validators.required
      ]],
      description: ['', [
        Validators.required
      ]],
      video: ['', [
        ValidateVideo.bind(this)
      ]],
      name: ['', [
        Validators.required
      ]]
    });

    this.selectedNode = this.data.payload;
    this.formDoc = this.selectedNode.data.payload;
    // Fix that strings are passed
    let moduleNo = Number(this.formDoc.moduleNo);
    delete this.formDoc.moduleNo;
    this.formDoc.moduleNo = moduleNo;

    this.moduleForm.patchValue(this.formDoc as any);
    this.moduleForm.markAsPristine();
    this.getDropDown(this.data.dropdown);


    this.moduleFormSub.add(this.moduleForm.valueChanges
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
    if( this.moduleForm.valid && this._state === 'modified')
      return false;

    return true;
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

  onSubmit(e) {
    this.formDoc = this.moduleForm.getRawValue();
    this.selectedNode.topic = this.formDoc.name;
    this.selectedNode.data.payload = this.formDoc;
    this.dialogRef.close(this.selectedNode);
  }

  deleteModule() {
    this.dialogRef.close('DELETE');
  }

  addSticky() {
    this.dialogRef.close('ADDNODE');
  }

  cancelUpdate() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.moduleFormSub.unsubscribe();
  }
}
