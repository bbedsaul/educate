import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {UserDialogPage} from "./user-dialog";

@NgModule({
  declarations: [
    UserDialogPage,
  ],
  imports: [
    IonicPageModule.forChild(UserDialogPage),
  ],
})
export class UserDialogPageModule {}
