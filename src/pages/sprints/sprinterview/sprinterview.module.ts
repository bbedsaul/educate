import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SprinterPage } from './sprinterview';

@NgModule({
  declarations: [
    SprinterPage,
  ],
  imports: [
    IonicPageModule.forChild(SprinterPage),
  ],
})
export class SprinterPageModule {}
