import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StickyDetailsPage } from './stickydetails';

@NgModule({
  declarations: [
    StickyDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(StickyDetailsPage),
  ],
})
export class StickyDetailsPageModule {}
