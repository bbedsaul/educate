import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PasswordPage } from './password';
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  declarations: [
    PasswordPage,
  ],
  imports: [
    SharedModule,
    IonicPageModule.forChild(PasswordPage),
  ],
})
export class LoginPageModule {}
