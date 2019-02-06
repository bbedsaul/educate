import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SidenavPage } from './sidenav-list';

@NgModule({
  declarations: [
    SidenavPage,
  ],
  imports: [
    IonicPageModule.forChild(SidenavPage),
  ],
})
export class SidenavPageModule {}
