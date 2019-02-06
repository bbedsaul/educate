import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '../app/material.module';
import {FirestoreProvider} from "../providers/firestore/firestore";
import {DirectivesModule} from "../directives/directives.module";
import {IonicModule} from "ionic-angular";
import {DragulaModule} from "ng2-dragula";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule,
    MaterialModule,
    DragulaModule,
    FlexLayoutModule,
    IonicModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule,
    MaterialModule,
    DragulaModule,
    FlexLayoutModule,
    IonicModule
  ],
  providers: [
    FirestoreProvider
  ]
})
export class SharedModule {}
