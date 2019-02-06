import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {TeamlistPage} from "./teamlist";

@NgModule({
  declarations: [
    TeamlistPage,
  ],
  imports: [
    IonicPageModule.forChild(TeamlistPage),
  ],
})
export class TeamlistModule {}
