import { Action } from '@ngrx/store';

import {Sprint} from '../../models/sprint';
import {Sprinter} from '../../models/sprinter';

export const SET_ALL_SPRINTS = '[Sprint] Get All Sprints for a Training';
export const SET_SPRINTER_INFO = '[Sprint] Get All The Training Info for all Sprinters';

export class SetAllSprints implements Action {
  readonly type = SET_ALL_SPRINTS;

  constructor(public payload: Sprint[]) {}
}

export class SetSprinterInfo implements Action {
  readonly type = SET_SPRINTER_INFO;

  constructor(public payload: Sprinter[]) {}
}

export type SprintActions =
  | SetAllSprints
  | SetSprinterInfo;

