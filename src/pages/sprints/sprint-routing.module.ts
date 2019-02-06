import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {SprintsPage} from "./sprints";
import {SprinterPage} from "./sprinterview/sprinterview";
import {AuthGuard} from "../../providers/auth/auth.guard";
import {SprintFormPage} from "./sprintform/sprintform";

const routes: Routes = [
  { path: 'sprints', component: SprintsPage, canLoad: [AuthGuard] },
  { path: 'sprinterview/:id', component: SprinterPage, canLoad: [AuthGuard] },
  { path: 'sprint-form/:id/:spid', component: SprintFormPage, canLoad: [AuthGuard] },
  { path: 'sprinterteamview/:spid', component: SprinterPage, canLoad: [AuthGuard] },
  { path: '', component: SprintsPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SprintRoutingModule {}

