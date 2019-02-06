import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomePage } from '../pages/welcome/welcome';
import { AuthGuard } from '../providers/auth/auth.guard';
import {ComingSoonPage} from "../pages/comingsoon/comingsoon";
import { UserprofileModule } from "../pages/userprofile/userprofile.module";
import {TrainingModule} from "../pages/training/training.module";
import {SprintModule} from "../pages/sprints/sprint.module";
import {SprintsPage} from "../pages/sprints/sprints";

const routes: Routes = [
  { path: '', component: WelcomePage },
  { path: 'welcome', component: WelcomePage, canLoad: [AuthGuard] },
  { path: 'sprints',
    component: SprintsPage,
    canLoad: [AuthGuard]
  },
  { path: 'training',
    loadChildren: () => TrainingModule,
    canLoad: [AuthGuard]
  },
  { path: 'badges', component: ComingSoonPage, canLoad: [AuthGuard] },
  { path: 'reviews', component: ComingSoonPage, canLoad: [AuthGuard] },
  {
    path: 'profile',
    loadChildren: () => UserprofileModule,
    canLoad: [AuthGuard]
  },
  { path: 'settings', component: ComingSoonPage, canLoad: [AuthGuard] }
];

@NgModule({
 // imports: [RouterModule.forRoot(routes, {enableTracing: true})],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
