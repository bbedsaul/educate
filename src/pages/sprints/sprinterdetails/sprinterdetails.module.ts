import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SprinterDetailsPage } from './sprinterdetails';

@NgModule({
  declarations: [
    SprinterDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(SprinterDetailsPage),
  ],
})
export class SprinterDetailsPageModule {}
