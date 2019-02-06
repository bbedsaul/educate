import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupPage } from '../../pages/signup/signup';
import { LoginPage } from '../../pages/login/login';
import {PasswordPage} from "../../pages/password/password";
import {VerifyPage} from "../../pages/emailverify/verify";


const routes: Routes = [
  { path: 'signup', component: SignupPage },
  { path: 'password', component: PasswordPage },
  { path: 'verify', component: VerifyPage },
  { path: 'login', component: LoginPage },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
