import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { SignupPage } from '../../pages/signup/signup';
import { LoginPage } from '../../pages/login/login';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import {PasswordPage} from "../../pages/password/password";
import {VerifyPage} from "../../pages/emailverify/verify";

@NgModule({
  declarations: [SignupPage, LoginPage, VerifyPage, PasswordPage],
  imports: [
    ReactiveFormsModule,
    AngularFireAuthModule,
    SharedModule,
    AuthRoutingModule
  ]
})
export class AuthModule {}
