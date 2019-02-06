import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerifyPage } from './verify';
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  declarations: [
    VerifyPage,
  ],
  imports: [
    SharedModule,
    IonicPageModule.forChild(VerifyPage),
  ],
})
export class VerifyPageModule {}
