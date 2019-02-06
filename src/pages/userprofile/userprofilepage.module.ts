import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {UserProfilePage} from "./userprofile";

@NgModule({
  declarations: [
    UserProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(UserProfilePage),
  ],
})
export class UserProfilePageModule {}
