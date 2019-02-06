import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { userprofileReducer } from '../../providers/userprofile/userprofile.reducer';
import {UserProfilePage} from "./userprofile";
import {UserprofileRoutingModule} from "./userprofile-routing.module";
import {UserprofileService} from "../../providers/userprofile/userprofile.service";

@NgModule({
  declarations: [
    UserProfilePage
  ],
  imports: [
    SharedModule,
    UserprofileRoutingModule,
  ],
  providers: [
  ],
  entryComponents: [UserProfilePage]
})
export class UserprofileModule {}
