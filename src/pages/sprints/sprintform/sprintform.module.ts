import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {SprintFormPage} from "./sprintform";

@NgModule({
  declarations: [
    SprintFormPage,
  ],
  imports: [
    IonicPageModule.forChild(SprintFormPage),
  ],
})
export class SprintformModule {}
