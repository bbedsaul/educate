import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { SprintRoutingModule } from './sprint-routing.module';
import { sprintReducer } from '../../providers/sprints/sprint.reducer';
import {SprintService} from "../../providers/sprints/sprint.service";
import {userprofileReducer} from "../../providers/userprofile/userprofile.reducer";
import {SprintsPage} from "./sprints";

@NgModule({
  declarations: [
    SprintsPage
  ],
  imports: [
    SharedModule,
    SprintRoutingModule,
    StoreModule.forFeature('sprints', sprintReducer),
    StoreModule.forFeature('userprofile', userprofileReducer)
  ],
  providers: [
    SprintService
  ],
  entryComponents: [SprintsPage]
})
export class SprintModule {}
