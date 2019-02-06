import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AuthService } from '../../../providers/auth/auth.service';
import * as fromRoot from '../../../app/app.reducer';
import {IonicPage} from "ionic-angular";

@IonicPage()
@Component({
  selector: 'page-sidenav-list',
  templateUrl: './sidenav-list.html',
})
export class SidenavPage implements OnInit {
  @Output() closeSidenav = new EventEmitter<void>();
  isAuth$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private store: Store<fromRoot.State>
  ) {}

  ngOnInit() {
    this.isAuth$ = this.store.select(fromRoot.getIsVerified);
  }

  onClose() {
    this.closeSidenav.emit();
  }

  onLogout() {
    this.onClose();
    this.authService.logout();
  }
}
