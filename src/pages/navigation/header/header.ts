import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Location} from '@angular/common';
import {IonicPage} from 'ionic-angular';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../../app/app.reducer';
import { AuthService } from '../../../providers/auth/auth.service';

@IonicPage()
@Component({
  selector: 'page-header',
  templateUrl: './header.html',
})
export class HeaderPage implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();
  isAuth$: Observable<boolean>;

  private headerTitle = "EDUCATE";

  constructor(private store: Store<fromRoot.State>,
              private location: Location,
              private authService: AuthService) { }

  ngOnInit () {
    this.isAuth$ = this.store.select(fromRoot.getIsVerified);
  }

  onToggleSidenav() {
    this.sidenavToggle.emit();
  }

  goBack() {
    // window.history.back();
    this.location.back();

    console.log( 'goBack()...' );
  }

  onLogout() {
    this.authService.logout();
  }
}
