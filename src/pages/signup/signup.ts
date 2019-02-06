import { Component } from '@angular/core';
import {IonicPage} from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AuthService } from '../../providers/auth/auth.service';
import { UIService } from '../../shared/ui.service';
import * as fromRoot from '../../app/app.reducer';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: './signup.html',
})
export class SignupPage {
  maxDate;
  isLoading$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private uiService: UIService,
    private store: Store<fromRoot.State>
  ) {}

  ionViewDidLoad () {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  onSubmit(form: NgForm) {
    this.authService.registerUser({
      email: form.value.email,
      password: form.value.password,
      fname: form.value.fname,
      lname: form.value.lname,
      terms: form.value.agree
    });
  }
}
