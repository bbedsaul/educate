import {Component, OnInit} from '@angular/core';
import {IonicPage} from 'ionic-angular';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AuthService } from '../../providers/auth/auth.service';
import { UIService } from '../../shared/ui.service';
import * as fromRoot from '../../app/app.reducer';

@IonicPage()
@Component({
  selector: 'page-password',
  templateUrl: './password.html',
})
export class PasswordPage implements OnInit {
  forgotPasswordForm: FormGroup;
  isLoading$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private uiService: UIService,
    private store: Store<fromRoot.State>
  ) {}

  ngOnInit() {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email]
      }),
    });
  }

  onSubmit() {
    this.authService.resetPassword (this.forgotPasswordForm.value.email);
  }
}
