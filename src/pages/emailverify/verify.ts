import {Component, OnInit} from '@angular/core';
import {IonicPage} from 'ionic-angular';
import { Store } from '@ngrx/store';

import { AuthService } from '../../providers/auth/auth.service';
import { UIService } from '../../shared/ui.service';
import * as fromRoot from '../../app/app.reducer';
import {Router} from "@angular/router";

@IonicPage()
@Component({
  selector: 'page-verify',
  templateUrl: './verify.html',
})
export class VerifyPage implements OnInit {

  constructor(
    private authService: AuthService,
    private uiService: UIService,
    private router: Router,
    private store: Store<fromRoot.State>
  ) {}

  ngOnInit() {
  }

  gotoLogin() {
    this.router.navigate(['/login']);
  }
}
