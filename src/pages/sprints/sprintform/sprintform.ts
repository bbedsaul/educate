import {Component, OnDestroy, OnInit} from '@angular/core';
import { Store } from '@ngrx/store';
import  { Location } from '@angular/common';

import * as fromUserProfile from '../../../providers/userprofile/userprofile.reducer';
import {Sprint} from "../../../models/sprint";
import {IonicPage} from "ionic-angular";
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {FirestoreProvider} from "../../../providers/firestore/firestore";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material";
import {UserDialogPage} from "../user-dialog/user-dialog";
import {UserDialogInterface} from "../../../models/userdialog";
import * as UI from "../../../shared/ui.actions";
import {Subscription} from "rxjs";
import {UIService} from "../../../shared/ui.service";
import {tap} from "rxjs/operators";
import {UserTraining} from "../../../models/user-training";

@IonicPage()
@Component({
  selector: 'page-sprint-form',
  templateUrl: './sprintform.html',
})
export class SprintFormPage implements OnInit, OnDestroy {
  sprintForm: FormGroup;
  state: string;
  trainingid: string;
  usertrainingid: string;
  trainingName: string;
  sprintid: string;
  sprintDoc: Sprint;
  trainingDoc: UserTraining;
  formDoc: any;
  subs: Subscription = new Subscription();
  minDate = new Date();
  maxDate = new Date();

  constructor(private fb: FormBuilder,
              private dialog: MatDialog,
              private fsService: FirestoreProvider,
              private profileStore: Store<fromUserProfile.State>,
              private router: Router,
              private location: Location,
              private uiService: UIService,
              private route: ActivatedRoute,
              private store: Store<fromUserProfile.State>) {

    this.trainingid = this.route.snapshot.params['id'];
    this.sprintid = this.route.snapshot.params['spid'];
  }

  ngOnInit() {

    this.subs.add(this.fsService.colWithIds$('user-training',ref =>
      ref.where('trainingid', '==', this.trainingid)
      .where('permission', '==', 'owner'))
      .subscribe(
        (trainings: UserTraining[]) => {
          this.trainingDoc = trainings[0];
        },
        error => {
          console.log("Error Getting UserTraining for owner:: " + error);
        }
      ));

    if(this.sprintid !== 'add') {
      // Look up the sprint record
      this.store.dispatch(new UI.StartLoading());
      this.subs.add(
        this.fsService.docWithId$('sprints/' + this.sprintid)
          .subscribe(
            (doc: Sprint) => {
              this.store.dispatch(new UI.StopLoading());
              this.sprintDoc = doc;

             this.patchSprinters(this.sprintDoc);
             this.sprintForm.patchValue(this.sprintDoc as any);
             this.sprintForm.markAsPristine();
            },
            error => {
              this.store.dispatch(new UI.StopLoading());
              this.uiService.showSnackbar(
                'Fetching Task failed, please try again later',
                null,
                3000
              );
            }
          )
      );
    }
    this.sprintForm = this.fb.group({
      name: ['', Validators.required],
      displayName: ['', Validators.required],
      description: '',
      meetinglink: ['', Validators.required],
      starttime: ['', Validators.required],
      enddate: '',
      startdate: '',
      frequency: this.createFrequency(),
      facilitatorid: '',
      facilitatorName: '',
      facilitatorEmail: '',
      sponsorid: '',
      sponsorName: '',
      sponsorEmail: '',
      sprinterids: this.fb.array ( [this.createSprinterIds] ),
      sprinters: this.fb.array(  [this.createSprinter]),
      maxsprinters: ['7', Validators.required]
    });

    this.subs.add( this.sprintForm.valueChanges
      .pipe(
        tap(change => {
          this.state = 'modified';
        })
      )
      .subscribe());

    this.sprintDoc = this.sprintForm.getRawValue() as Sprint;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  get formArray(): AbstractControl | null {
    return this.sprintForm.controls['steps']; }

  onSubmit(e) {
    this.sprintDoc = this.sprintForm.getRawValue();
    this.sprintDoc.trainingid = this.trainingid;
    this.sprintDoc.ownerid = this.trainingDoc.userid;
    this.sprintDoc.ownerEmail = this.trainingDoc.email;
    this.sprintDoc.ownerName = this.trainingDoc.displayName;
    let sprintRefId = this.fsService.getDocRef('sprints');
    if(this.sprintid === 'add') this.sprintid = sprintRefId.ref.id;

    this.setDoc(this.sprintDoc, 'sprints/' + this.sprintid);
    console.log("FormDoc :: " + this.formDoc);
  }

  async setDoc(doc: any, path: string) {
    try {
      await this.fsService.upsert(path, doc);
    } catch (err) {
      console.log(err)
    }
  }

  getLabel(freq:FormGroup) {
    return freq.controls['label'].value;
  }

  // Form Specific expand or contract of the form so that it has the values that patchValue can fill
  patchSprinters(sprint: Sprint) {
    if(sprint.sprinters === undefined || sprint.sprinters === null) return;
    // for our form we have questions and then answers nested
    let sprinterArr:FormArray = this.sprintForm.controls['sprinters'] as FormArray;
    let sprinterIdsArr:FormArray = this.sprintForm.controls['sprinterids'] as FormArray;

    sprint.sprinters.forEach((sprinter, sIndex) => {
      if(sprinterArr.length <= sIndex ) {
        let newSprinter:FormGroup = this.createSprinter;
        sprinterArr.push(newSprinter);
        sprinterIdsArr.push(this.createSprinterIds);
      }
    });
  }

  get createSprinter(): FormGroup {
    return this.fb.group({
      id: new FormControl(''),
      name: new FormControl(''),
      email: new FormControl(''),
      picture: new FormControl('')
    });
  }

  get createSprinterIds(): FormControl {
      return new FormControl('')
  }

  createFrequency() {
    const freqArr = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const arr = freqArr.map( tag => {
      return this.fb.group({
        name: new FormControl(tag, Validators.required),
        label: new FormControl(tag[0], Validators.required),
        checked: new FormControl(false, Validators.required)
      })
    });
    return this.fb.array(arr);
  }

  get freqForms() {
    return this.sprintForm.get('frequency') as FormArray
  }

  get sprinters() {
    return this.sprintForm.get('sprinters') as FormArray
  }

  get sprinterids() {
    return this.sprintForm.get('sprinterids') as FormArray
  }

  addSprinter() {
    // Create the sprinter record in the Doc
    let newSprinter = {
      id: '',
      name: '',
      email: '',
      picture: ''
    };
    this.sprintDoc.sprinters.push(newSprinter);
    this.sprintDoc.sprinterids.push('');

    this.sprinters.push(this.createSprinter);
    this.sprinterids.push(this.createSprinterIds);
  }

  deleteSprinter(i: number) {
    this.sprinters.removeAt(i);
    this.sprintDoc.sprinters.splice(i, 1);
    this.sprintDoc.sprinterids.splice(i, 1);
  }

  addUser(type: string, index?:number) {
    let page: any = UserDialogPage;

    let userDialogInt: UserDialogInterface = <UserDialogInterface>{
      trainingid: this.trainingid,
      trainingname: this.trainingName,
      type: type,
      lookuptype: 'sprint'
    };

    const dialogRef = this.dialog.open(page, {
      data: {
        payload: userDialogInt
      }
    });

    let returnedData:UserDialogInterface;
    this.subs.add(dialogRef.afterClosed().subscribe(result => {
      if (result) {
        returnedData = result;

        if (returnedData.type === 'facilitator') {
          this.sprintDoc.facilitatorid = returnedData.userid;
          this.sprintDoc.facilitatorName = returnedData.displayName;
          this.sprintDoc.facilitatorEmail = returnedData.email;
        } else if (returnedData.type === 'sponsor') {
          this.sprintDoc = <Sprint>{
            sponsorid: returnedData.userid,
            sponsorName: returnedData.displayName,
            sponsorEmail: returnedData.email
          };
        } else {
          this.sprintDoc.sprinterids[index] = returnedData.email;
          // Must be a sprinter
          this.sprintDoc.sprinters[index].id = returnedData.usertrainingid;
          this.sprintDoc.sprinters[index].email = returnedData.email;
          this.sprintDoc.sprinters[index].name = returnedData.displayName;
        }
        this.sprintForm.patchValue(this.sprintDoc as any);
        this.sprintForm.markAsPristine();

      } else {
        console.log("UserDialog No Result Returned:: " + result);
      }
    }));
  }

  cancelUpdate() {
    // window.history.back();
    this.location.back();
  }

  changeHandler(e) {
    // console.log(e)
    this.state = e;
  }
}
