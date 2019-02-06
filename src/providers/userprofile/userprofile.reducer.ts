import {createFeatureSelector, createSelector} from '@ngrx/store';

import { UserProflieActions, SET_USERPROFILE, SET_ALLUSERS, SET_TEAMUSERS } from './userprofile.actions';
import {UserProfile} from "../../models/userprofile";
import * as fromRoot from "../../app/app.reducer";

export interface UserProfileState {
  userProfile: UserProfile;
  allUsers: UserProfile[];
  teamUsers: UserProfile[];
}

export interface State extends fromRoot.State {
  userProfile: UserProfileState;
}

const initialState: UserProfileState = {
  userProfile: null,
  allUsers: [],
  teamUsers: []
}

export function userprofileReducer(state = initialState, action: UserProflieActions) {
  switch (action.type) {
    case SET_USERPROFILE:
      return {
        ...state,
        userProfile: action.payload
      };
    case SET_ALLUSERS:
      return {
        ...state,
        allUsers: action.payload
      };
    case SET_TEAMUSERS:
      return {
        ...state,
        teamUsers: action.payload
      };
    default: {
      return state;
    }
  }
}

export const getUserProfileState = createFeatureSelector<UserProfileState>('userprofile');

export const getUserProfile = createSelector(getUserProfileState, (state: UserProfileState) => state.userProfile);
export const getAllUsers = createSelector(getUserProfileState, (state: UserProfileState) => state.allUsers);
export const getTeamUsers = createSelector(getUserProfileState, (state: UserProfileState) => state.teamUsers);
