import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {DoTaskPage} from "./dotask";

@NgModule({
  declarations: [
    DoTaskPage,
  ],
  imports: [
    IonicPageModule.forChild(DoTaskPage),
  ],
})
export class DoTaskPageModule {}
