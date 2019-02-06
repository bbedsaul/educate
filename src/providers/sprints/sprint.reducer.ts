import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
  SprintActions,
  SET_SPRINTER_INFO, SET_ALL_SPRINTS
} from './sprint.actions';
import * as fromRoot from '../../app/app.reducer';
import {Sprinter} from '../../models/sprinter';
import {Sprint} from '../../models/sprint';

export interface SprintState {
  sprints: Sprint[];
  sprinters: Sprinter[];
}

export interface State extends fromRoot.State {
  sprints: SprintState;
}

const initialState: SprintState = {
  sprints: [],
  sprinters: []
};

export function sprintReducer(state = initialState, action: SprintActions) {
  switch (action.type) {
    case SET_ALL_SPRINTS:
      return {
        ...state,
        sprints: action.payload
      };
    case SET_SPRINTER_INFO:
      return {
        ...state,
        sprinters: action.payload
      };
    default: {
      return state;
    }
  }
}
export const getSprintState = createFeatureSelector<SprintState>('sprints');

export const getSprints = createSelector(getSprintState, (state: SprintState) => state);
export const getSprinters = createSelector(getSprintState, (state: SprintState) => state.sprinters);
