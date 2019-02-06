import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { userprofileReducer } from './userprofile.reducer';
import {UserProfilePage} from "../../pages/userprofile/userprofile";

@NgModule({
  declarations: [
    UserProfilePage
  ],
  imports: [
    SharedModule,
    StoreModule.forFeature('userprofile', userprofileReducer)
  ],
  entryComponents: [UserProfilePage]
})
export class UserprofileModule {}
