import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {StickyFormPage} from "./stickyform";

@NgModule({
  declarations: [
    StickyFormPage,
  ],
  imports: [
    IonicPageModule.forChild(StickyFormPage),
  ],
})
export class StickyFormPageModule {}
