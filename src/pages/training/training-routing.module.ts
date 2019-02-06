import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrainingPage } from './training';
import {TaskFormPage} from "./taskform/taskform";
import {StickyFormPage} from "./stickyform/stickyform";
import {ModuleFormPage} from "./moduleform/moduleform";
import {TrainingFormPage} from "./trainingform/trainingform";
import {ContentPage} from "./content/content";
import {AuthGuard} from "../../providers/auth/auth.guard";
import {TeamlistPage} from "./team/teamlist/teamlist";
import {TeamFormPage} from "./team/teamform/teamform";
import {SprintFormPage} from "../sprints/sprintform/sprintform";
import {SprinterPage} from "../sprints/sprinterview/sprinterview";
import {TasksPage} from "../sprints/tasks/tasks";
import {DoTaskPage} from "../sprints/tasks/dotask/dotask";

const routes: Routes = [
  { path: 'trainingform', component: TrainingFormPage, canLoad: [AuthGuard] },
  { path: 'moduleform', component: ModuleFormPage, canLoad: [AuthGuard] },
  { path: 'stickyform', component: StickyFormPage, canLoad: [AuthGuard] },
  { path: 'taskform', component: TaskFormPage, canLoad: [AuthGuard] },
  { path: 'tasks/:stickyid/:usertrainingid/:mode', component: TasksPage, canLoad: [AuthGuard] },
  { path: 'taskview/:taskid/:usertrainingid/:stickyid/:mode', component: DoTaskPage, canLoad: [AuthGuard] },
  { path: 'sprinterview/:mode', component: SprinterPage, canLoad: [AuthGuard] },
  { path: 'sprinterview', component: SprinterPage, canLoad: [AuthGuard] },
  { path: 'team/:id/:name', component: TeamlistPage, canLoad: [AuthGuard] },
  { path: 'team-member/:id/:type/:name', component: TeamFormPage, canLoad: [AuthGuard] },
  { path: 'sprint-form/:id/:spid', component: SprintFormPage, canLoad: [AuthGuard] },
  { path: 'content/:id', component: ContentPage, canLoad: [AuthGuard] },
  { path: 'content', component: ContentPage, canLoad: [AuthGuard] },
  { path: '', component: TrainingPage, canLoad: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainingRoutingModule {}

