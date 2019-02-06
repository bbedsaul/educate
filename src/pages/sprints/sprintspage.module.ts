import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {SprintsPage} from './sprints';

@NgModule({
  declarations: [
    SprintsPage,
  ],
  imports: [
    IonicPageModule.forChild(SprintsPage),
  ],
})
export class SprintsPageModule {}
