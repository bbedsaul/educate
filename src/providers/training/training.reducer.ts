import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
  TrainingActions,
  SET_USER_TRAININGS, SET_NEW_TRAINING, SET_TRAINING_TEAM,
  SET_USER_TRAINING, SET_TRAINING_ALL, SET_MODULES, SET_STICKIES, SET_TASKS, SET_TASK
} from './training.actions';
import { Training } from '../../models/training';
import * as fromRoot from '../../app/app.reducer';
import {UserTraining} from "../../models/user-training";
import {Sticky} from "../../models/sticky";
import {Task} from "../../models/task";
import {Module} from "../../models/module";

export interface TrainingState {
  userTrainings: UserTraining[];
  userTraining: UserTraining;
  trainingTeam: UserTraining[];
  modules: Module[];
  stickies: Sticky[];
  tasks: Task[];
  training: Training;
  trainingLookup: Training;
  module: Module;
  sticky: Sticky;
  task: Task;
}

export interface State extends fromRoot.State {
  training: TrainingState;
}

const initialState: TrainingState = {
  userTrainings: [],
  userTraining: null,
  trainingTeam: [],
  modules: [],
  stickies: [],
  tasks: [],
  training: null,
  trainingLookup: null,
  module: null,
  sticky: null,
  task: null
};

export function trainingReducer(state = initialState, action: TrainingActions) {
  switch (action.type) {
    case SET_USER_TRAININGS:
      return {
        ...state,
        userTrainings: action.payload
      };
    case SET_TRAINING_TEAM:
      return {
        ...state,
        trainingTeam: action.payload
      };
    case SET_MODULES:
      return {
        ...state,
        modules: action.payload
      };
    case SET_STICKIES:
      return {
        ...state,
        stickies: action.payload
      };
    case SET_TASKS:
      return {
        ...state,
        tasks: action.payload
      };
    case SET_TASK:
      return {
        ...state,
        task: action.payload
      };
    case SET_NEW_TRAINING:
      return {
        ...state,
        trainingLookup: action.payload
      };
    case SET_USER_TRAINING:
      return {
        ...state,
        userTraining: { ...state.userTrainings.find(userTrainings => userTrainings.id === action.payload.id) }
      };
    case SET_TRAINING_ALL:
      return {
        ...state,
        training: action.payload
      };
    default: {
      return state;
    }
  }
}

export const getTrainingState = createFeatureSelector<TrainingState>('training');

export const getUserTrainings = createSelector(getTrainingState, (state: TrainingState) => state.userTrainings);
export const getTrainingTeam = createSelector(getTrainingState, (state: TrainingState) => state.trainingTeam);
export const getUserTraining = createSelector(getTrainingState, (state: TrainingState) => state.userTraining);
export const getModules = createSelector(getTrainingState, (state: TrainingState) => state.modules);
export const getStickies = createSelector(getTrainingState, (state: TrainingState) => state.stickies);
export const getTasks = createSelector(getTrainingState, (state: TrainingState) => state.tasks);
export const getTask = createSelector(getTrainingState, (state: TrainingState) => state.task);
export const getTraining = createSelector(getTrainingState, (state: TrainingState) => state.training);
export const getLookupTraining = createSelector(getTrainingState, (state: TrainingState) => state.trainingLookup);
export const getTrainingAll = createSelector(getTrainingState, (state: TrainingState) => state.training);
