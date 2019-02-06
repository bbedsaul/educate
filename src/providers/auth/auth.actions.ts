import { Action } from '@ngrx/store';

export const SET_AUTHENTICATED = '[Auth] Set Authenticated';
export const SET_UNAUTHENTICATED = '[Auth] Set Unauthenticated';
export const SET_EMAILVERIFIED = '[Auth] Set Email Verified';
export const SET_EMAILUNVERIFIED = '[Auth] Set Email UnVerified';

export class SetAuthenticated implements Action {
  readonly type = SET_AUTHENTICATED;
}

export class SetUnauthenticated implements Action {
  readonly type = SET_UNAUTHENTICATED;
}

export class SetEmailVerified implements Action {
  readonly type = SET_EMAILVERIFIED;
}

export class SetEmailUnVerified implements Action {
  readonly type = SET_EMAILUNVERIFIED;
}

export type AuthActions = SetAuthenticated | SetEmailVerified | SetEmailUnVerified | SetUnauthenticated;
