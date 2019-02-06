import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NodepopPage } from './nodepop';

@NgModule({
  declarations: [
    NodepopPage,
  ],
  imports: [
    IonicPageModule.forChild(NodepopPage),
  ],
  exports: [
    NodepopPage
  ]
})
export class NodepopPageModule {}
