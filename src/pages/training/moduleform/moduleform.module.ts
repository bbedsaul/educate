import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {ModuleFormPage} from "./moduleform";

@NgModule({
  declarations: [
    ModuleFormPage,
  ],
  imports: [
    IonicPageModule.forChild(ModuleFormPage),
  ],
})
export class ModuleFormPageModule {}
