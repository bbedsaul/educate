import { Action } from '@ngrx/store';
import {UserProfile} from "../../models/userprofile";

export const SET_USERPROFILE = '[UserProfile] Set User Profile';
export const SET_ALLUSERS = '[UserProfile] Set All Users List';
export const SET_TEAMUSERS = '[UserProfile] Set Team User List';

export class SetUserprofile implements Action {
  readonly type = SET_USERPROFILE;

  constructor(public payload: UserProfile) {}
}

export class SetAllUsers implements Action {
  readonly type = SET_ALLUSERS;

  constructor(public payload: UserProfile[]) {}
}

export class SetTeamUsers implements Action {
  readonly type = SET_TEAMUSERS;

  constructor(public payload: UserProfile[]) {}
}

export type UserProflieActions =
  SetUserprofile |
  SetAllUsers |
  SetTeamUsers;
