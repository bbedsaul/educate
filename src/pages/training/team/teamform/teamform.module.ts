import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {TeamFormPage} from "./teamform";

@NgModule({
  declarations: [
    TeamFormPage,
  ],
  imports: [
    IonicPageModule.forChild(TeamFormPage),
  ],
})
export class TaskFormPageModule {}
