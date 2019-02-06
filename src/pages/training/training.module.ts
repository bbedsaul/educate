import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { TrainingRoutingModule } from './training-routing.module';
import { trainingReducer } from '../../providers/training/training.reducer';
import {TrainingPage} from "./training";
import {TrainingFormPage} from "./trainingform/trainingform";
import {TaskFormPage} from "./taskform/taskform";
import {ModuleFormPage} from "./moduleform/moduleform";
import {StickyFormPage} from "./stickyform/stickyform";
import {TrainingService} from "../../providers/training/training.service";
import {ContentPage} from "./content/content";
import {userprofileReducer} from "../../providers/userprofile/userprofile.reducer";
import {TeamlistPage} from "./team/teamlist/teamlist";
import {TeamFormPage} from "./team/teamform/teamform";
import {UserprofileService} from "../../providers/userprofile/userprofile.service";
import {SprintFormPage} from "../sprints/sprintform/sprintform";
import {SprinterPage} from "../sprints/sprinterview/sprinterview";
import {TasksPage} from "../sprints/tasks/tasks";
import {DoTaskPage} from "../sprints/tasks/dotask/dotask";

@NgModule({
  declarations: [
    TrainingFormPage,
    ModuleFormPage,
    StickyFormPage,
    TasksPage,
    TaskFormPage,
    DoTaskPage,
    TeamlistPage,
    TeamFormPage,
    SprintFormPage,
    SprinterPage,
    ContentPage,
    TrainingPage
  ],
  imports: [
    SharedModule,
    TrainingRoutingModule,
    StoreModule.forFeature('training', trainingReducer),
    StoreModule.forFeature('userprofile', userprofileReducer)
  ],
  providers: [
    TrainingService,
    UserprofileService
  ],
  entryComponents: [TrainingPage]
})
export class TrainingModule {}
