import { Directive, Input, Output, EventEmitter, HostListener, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { tap, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {FirestoreProvider} from "../../providers/firestore/firestore";

@Directive({
  selector: '[fireForm]'
})
export class FireFormDirective implements OnInit, OnDestroy {

  // Inputs
  @Input() path: string;
  @Input() autoSaveFlag: boolean = false;
  @Input() preloadFlag: boolean = true;
  @Input() formGroup: FormGroup;

  // Internal state
  private _state: 'loading' | 'synced' | 'created' | 'modified' | 'error';

  // Outputs
  @Output() stateChange = new EventEmitter<string>();
  @Output() formError = new EventEmitter<string>();

  // Firestore Document
  private docRef:any;
  private newFlag: boolean = false;
  // Subscriptions
  private formSub: Subscription;

  constructor(private fsProvider: FirestoreProvider) { }


  ngOnInit() {
    // If we dont load here, catch event
    if(this.preloadFlag) {
      this.preloadData();
    }
    this.newFlag = true;

    if(this.autoSaveFlag)
      this.autoSave();
    else
      this.noAutoSave();
  }

  // Loads initial form data from Firestore
  preloadData() {
    this.state = 'loading';
    if (this.path.split('/').length % 2) {
      this.docRef = this.fsProvider.getDocRef(this.path);
      this.path = this.docRef.ref.path;
      this.newFlag = true;
      this.state = 'synced';
    } else {
      this.fsProvider.doc$(this.path)
        .subscribe(
          (item: any) => {
            this.docRef = item;
            this.formGroup.patchValue(item);
            this.formGroup.markAsPristine();
            this.state = 'synced';
          },
          error => {
            console.log("ERROR: Cannot find path for loading fire-form directive");
            this.state = 'error';
          }
        )
    }
  }

  noAutoSave() {
    this.formSub = this.formGroup.valueChanges
      .pipe(
        tap(change => {
          this.state = 'modified';
        })
      )
      .subscribe();
  }

  // Autosaves form changes
  autoSave() {
    this.formSub = this.formGroup.valueChanges
      .pipe(
        tap(change => {
          this.state = 'modified';
        }),
        debounceTime(2000),
        tap(change => {
          if (this.formGroup.valid && this._state === 'modified') {
            this.setDoc();
          }
        })
      )
      .subscribe();
  }

  // Intercept form submissions to perform the document write
  @HostListener('ngSubmit', ['$event'])
  onSubmit(e) {
    this.setDoc();
    if(this.newFlag) {
      this.state = 'created';
      this.newFlag = false;
    }
  }

  // Writes changes to Firestore
  async setDoc() {
    try {
      this.docRef = this.formGroup.getRawValue();
      await this.fsProvider.upsert(this.path, this.docRef);
      this.state = 'synced';
    } catch (err) {
      console.log(err)
      this.formError.emit(err.message);
      this.state = 'error';
    }
  }

  // Setter for state changes
  set state(val) {
    this._state = val;
    this.stateChange.emit(val);
  }

  ngOnDestroy() {
    if(this.formSub)
        this.formSub.unsubscribe();
  }

}
