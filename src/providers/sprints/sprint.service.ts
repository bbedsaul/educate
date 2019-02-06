import { Injectable } from '@angular/core';
import {combineLatest, Subscription} from 'rxjs';
import { Store } from '@ngrx/store';

import { Sprint } from '../../models/sprint';
import { UIService } from '../../shared/ui.service';
import * as UI from '../../shared/ui.actions';
import * as fromSprint from './sprint.reducer';
import {FirestoreProvider} from "../firestore/firestore";
import {map} from "rxjs/operators";

@Injectable()
export class SprintService {
  private fbSubs: Subscription[] = [];

  constructor(
    private fsService: FirestoreProvider,
    private uiService: UIService,
    private store: Store<fromSprint.State>
  ) {}

  fetchSprints(userid: string, callback: (sprints) => void) : Subscription {
    this.store.dispatch(new UI.StartLoading());

    const aquery = this.fsService.colWithIds$('sprints', ref =>
      ref.where('sprinterids', 'array-contains', userid));
    const squery = this.fsService.colWithIds$('sprints', ref =>
      ref.where('sponsorid', '==', userid));
    const fquery = this.fsService.colWithIds$('sprints', ref =>
      ref.where('facilitatorid', '==', userid));
    const oquery = this.fsService.colWithIds$('sprints', ref =>
      ref.where('ownerid', '==', userid));


    return combineLatest<Sprint[]>(aquery, squery, fquery, oquery).pipe(
      map(arr => arr.reduce((acc, cur) => acc.concat(cur) ) ),
    ).subscribe(
      (sprints: Sprint[]) => {
        this.store.dispatch(new UI.StopLoading());
        callback(sprints);
      },
      error => {
        console.log(error);
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(
          'Fetching Sprints failed, please try again later',
          null,
          3000
        );
      });
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

}
