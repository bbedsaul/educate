import { Action } from '@ngrx/store';

import {Training} from '../../models/training';
import {UserTraining} from "../../models/user-training";
import {Module} from "../../models/module";
import {Sticky} from "../../models/sticky";
import {Task} from "../../models/task";

export const SET_USER_TRAININGS = '[Training] Get Available Trainings';
export const SET_USER_TRAINING = '[Training] Get Specific Training';
export const SET_TRAINING_TEAM = '[Training] Get The Team for a Training';
export const SET_MODULES = '[Training] Get Modules Collection';
export const SET_STICKIES = '[Training] Get Stickies Collection';
export const SET_TASKS = '[Training] Get Tasks Collection';
export const SET_TASK = '[Training] Get Single Task';
export const SET_NEW_TRAINING = '[Training] Get Lookup Training';
export const SET_TRAINING_ALL = '[Training] Get Specific Training and all children';

export class SetUserTrainings implements Action {
  readonly type = SET_USER_TRAININGS;

  constructor(public payload: UserTraining[]) {}
}

export class SetTrainingTeam implements Action {
  readonly type = SET_TRAINING_TEAM;

  constructor(public payload: UserTraining[]) {}
}

export class SetModules implements Action {
  readonly type = SET_MODULES;

  constructor(public payload: Module[]) {}
}

export class SetStickies implements Action {
  readonly type = SET_STICKIES;

  constructor(public payload: Sticky[]) {}
}

export class SetTasks implements Action {
  readonly type = SET_TASKS;

  constructor(public payload: Task[]) {}
}

export class SetTask implements Action {
  readonly type = SET_TASK;

  constructor(public payload: Task) {}
}

export class SetUserTraining implements Action {
  readonly type = SET_USER_TRAINING;

  constructor(public payload: Training) {}
}

export class SetNewTraining implements Action {
  readonly type = SET_NEW_TRAINING;

  constructor(public payload: Training) {}
}

export class SetTrainingAll implements Action {
  readonly type = SET_TRAINING_ALL;

  constructor(public payload: Training) {}
}

export type TrainingActions =
  | SetUserTrainings
  | SetTrainingTeam
  | SetModules
  | SetStickies
  | SetTasks
  | SetTask
  | SetUserTraining
  | SetNewTraining
  | SetTrainingAll;

