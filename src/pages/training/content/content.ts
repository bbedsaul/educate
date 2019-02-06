import {Component, OnDestroy, OnInit} from '@angular/core';
import {Storage} from '@ionic/storage';
import {IonicPage, Platform} from 'ionic-angular';
import {customizeUtil, MindMapMain } from "mind-map";
import {TrainingFormPage} from "../trainingform/trainingform";
import {MatDialog} from "@angular/material";
import {ActivatedRoute, Router} from "@angular/router";
import * as fromTraining from "../../../providers/training/training.reducer";
import {Store} from "@ngrx/store";
import {Training} from "../../../models/training";
import {FirestoreProvider} from "../../../providers/firestore/firestore";
import {TrainingService} from "../../../providers/training/training.service";
import {Module} from "../../../models/module";
import {Sticky} from "../../../models/sticky";
import {Task} from "../../../models/task";
import {ModuleFormPage} from "../moduleform/moduleform";
import {TaskFormPage} from "../taskform/taskform";
import {StickyFormPage} from "../stickyform/stickyform";
import {Subscription} from "rxjs/Subscription";
import {UserTraining} from "../../../models/user-training";
import {PublishedTraining} from '../../../models/published-training';

const mmBackgroundColor = '#ff0000';

const HIERARCHY_RULES = {
  ROOT: {
    name: 'ROOT',
    backgroundColor: mmBackgroundColor,
    getChildren: () => [
      HIERARCHY_RULES.M
    ]
  },
  M: {
    name: 'M',
    color: '#fff',
    backgroundColor: '#ff0000',
    getChildren: () => [
      HIERARCHY_RULES.S
    ]
  },
  S: {
    name: 'S',
    color: '#fff',
    backgroundColor: '#C6C6C6',
    getChildren: () => [
      HIERARCHY_RULES.T
    ]
  },
  T: {
    name: 'T',
    color: '#fff',
    backgroundColor: '#C6C6C6',
    getChildren: () => []
  }
};

var options = {                     // for more detail at next chapter
  container:'jsmind_container',   // [required] id of container
  editable:true,                  // [required] whether allow edit or not
  _this: null,
  enableDraggable: false,
  hierarchyRule: HIERARCHY_RULES,
  theme:'orange'                  // [required] theme
};

/**
 * Generated class for the ContentCreationTwoPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
})
export class ContentPage implements OnInit, OnDestroy {

  mindMap: MindMapMain = null;
  trainingId: string;
  training: Training;
  userTraining: UserTraining;
  sub: Subscription = new Subscription();
  selectedNode: any;

  constructor(private dialog: MatDialog,
              private trainingService: TrainingService,
              private fsService: FirestoreProvider,
              private store: Store<fromTraining.State>,
              private router: Router,
              private storage: Storage,
              private route: ActivatedRoute,
              public platform: Platform) {
  }

  ngOnInit() {


    this.sub.add(this.route.params.subscribe(params => {
      this.userTraining = params as UserTraining;
      this.trainingId = this.userTraining.trainingid;
      this.trainingService.fetchAllTraining(this.trainingId);
    }));

    this.sub.add(this.store.select(fromTraining.getTrainingAll).subscribe(
      (training: Training) => {
        if(training === null || training === undefined) return;
        if(this.userTraining.trainingid !== training.id) return;
        if(training.name === null || training.name === undefined) {
          training.name = this.userTraining.name;
          training.description = this.userTraining.name;
        }
        this.training = training;
        // Initialize MindMap here.
        if(this.mindMap === null && training !== null) {
          let mind = this.initMindMapData();
          options._this = this;
          this.mindMap = MindMapMain.show(options, mind);

          this.mindMap.view.addEvent(this.mindMap, 'click', function (event) {
            console.log("can pass this");
//      this.options.test.doAddNode(event, this.view);
            this.options._this.openNodePopup(event);
          });
        }
      },
      (e) => {
        console.log(e);
      }
    ));

    /*
    this.mindMap.toggleNode = function() {
      console.log("Hello World");
    }
    */
    console.log('ngOnInit ContentPage');
  }

  private initMindMapData(): {} {
    var data:any = this.initMMHeader();

    let newTraining:Training = JSON.parse(JSON.stringify(this.training));
    if(newTraining.modules) delete newTraining.modules;

    const path:string = 'trainings/' + this.training.id;

    data.data = {
      id: 'root',
      path: path,
      topic: "NEW TRAINING",
      payload: newTraining,
      nodeType : 'ROOT',
      selectedType: 'ROOT',
      children: []
    };

    data.data.topic = this.training.name;

    if(this.training.modules !== undefined){
      this.training.modules.forEach((module:Module) => {
        let moduleData = this.createModuleObject(module, path);
        if(module.stickies !== undefined) {
          let modPath = path + '/modules/' + module.id;
          module.stickies.forEach((sticky:Sticky) => {
            let stickyData = this.createStickyObject(sticky, modPath);
            if(sticky.tasks !== undefined) {
              let stickyPath = modPath + '/stickies/' + sticky.id;
              sticky.tasks.forEach( (task:Task) => {
                stickyData.children.push(this.createTaskObject(task, stickyPath));
              })
            }
            moduleData.children.push(stickyData);
          });
        }
        data.data.children.push(moduleData)
      });
    }
    return JSON.parse(JSON.stringify(data));
  }

  private initMMHeader() {
    return {
      meta: {
      name: "jsMind remote",
      author: "hizzgdev@163.com",
      },
      format: "nodeTree"}
  }

  private createModuleObject(module: Module, path: string) {
    let newModule:Module = JSON.parse(JSON.stringify(module));
    if(newModule.stickies) delete newModule.stickies;
    return {
      "id" : newModule.id,
      "path" : path + '/modules/' + newModule.id,
      "topic" : newModule.name,
      "payload" : newModule,
      "direction" : "right",
      "nodeType": 'M',
      "selectedType" : 'M',
      "children" : []
    }
  }

  private createStickyObject(sticky: Sticky, path: string) {
    let newSticky:Sticky = JSON.parse(JSON.stringify(sticky));
    if(newSticky.tasks) delete newSticky.tasks;
    return {
      "id" : newSticky.id,
      "path" : path + '/stickies/' + newSticky.id,
      "topic" : newSticky.name,
      "payload": newSticky,
      "direction" : "right",
      "nodeType": 'S',
      "selectedType" : 'S',
      "children" : []
    }
  }

  private createTaskObject(task: Task, path: string) {
    return {
      "id" : task.id,
      "path" : path + '/tasks/' + task.id,
      "topic" : task.name,
      "payload": task,
      "direction" : "right",
      "nodeType" : 'T',
      "selectedType" : 'T',
      "children" : []
    }
  }

  openNodePopup($event) {
    var element = event.target || event.srcElement;
    var isexpander = this.mindMap.view.isExpander(element);
    if (isexpander) {
      return;
    }

    this.selectedNode = this.mindMap.getSelectedNode();
    this.mindMap.shortcut.disableShortcut();
    if(this.selectedNode === null) return;
    //this.mindMap.view.editingNode = selectedNode;
    let page:any = TrainingFormPage;
    let dropDownList:number[] = [];
    if(this.selectedNode.data.nodeType === 'M') {
      page = ModuleFormPage;
      dropDownList = this.getModuleDropDown(this.selectedNode.data.payload);
    } else if(this.selectedNode.data.nodeType === 'S') {
      page = StickyFormPage;
      dropDownList = this.getStickyDropDown(this.selectedNode.data.payload);
    } else if(this.selectedNode.data.nodeType === 'T') {
      page = TaskFormPage;
      dropDownList = this.getTaskDropDown(this.selectedNode.data.payload);
    }

    const dialogRef = this.dialog.open(page, {
      height: '90%',
      width: '90%',
      data: {
        payload: this.selectedNode,
        dropdown: dropDownList
      }
    });

    this.sub.add(dialogRef.afterClosed().subscribe(result => {
      this.mindMap.shortcut.enableShortcut();
      if (result) {

        if(result === 'ADDNODE') this.doAddNode();
        else if(result === 'DELETE') this.doDeleteNode();
        else if (result === 'PREVIEW') {
          // Get/Make PublishedItems list
          let previewList: PublishedTraining[] = this.trainingService.previewPublishTrainingList(this.training);

          this.set('previewdata', previewList)
            .then( () => {
              let newUserTraining:UserTraining = JSON.parse(JSON.stringify(this.userTraining));
              newUserTraining.permission = 'student';
              let userTrainingArr:UserTraining[] = [ newUserTraining ];
              this.set('sprinterdata', userTrainingArr)
                .then( () => {
                  // navigate to sprinterview in preview mode.
                  this.router.navigate(['/training/sprinterview', 'preview']);
                })
                .catch(err => {
                  console.log("error writing sprinterdata to local storage :: " + err);
                });
            })
            .catch( err => {
              console.log("error writing previewdata to local storage :: " + err);
            })

          // return to editing.
        } else {
          // Add selected node to dirty - no dups
          this.doSave(result);
          this.mindMap.updateNode(result.id, result.topic, result.selectedType);
          this.mindMap.setNodeColor(result.id, '#f1c40f','#ffffff');
        }
      } else {
        console.log(result);
      }
    }));
  }

  getModuleDropDown(selectedModule: Module): number[] {
    let arr = [];
    this.training.modules.forEach(module => {
      if(selectedModule.id !== module.id)
          arr.push(module.moduleNo);
    });
    return arr;
  }

  getStickyDropDown(sticky:Sticky): number[] {
    let arr = [];
    let newArr = [];
    let retNow:boolean = false;
    this.training.modules.forEach(module => {
      if(retNow) {
        arr = newArr.slice(0);
        retNow = false;  // We only want to get the array once
      }
      if(module.stickies !== undefined) {
        newArr = [];
        module.stickies.forEach(modSticky => {
          if(modSticky.id === sticky.id)
            retNow = true;
          else newArr.push(modSticky.stickyNo);
        });
      }
    });
    return arr;
  }

  getTaskDropDown(task:Task): number[] {
    let arr = [];
    let newArr = [];
    let retNow:boolean = false;
    this.training.modules.forEach(module => {
      if(module.stickies !== undefined) {
        module.stickies.forEach(sticky => {
          if(retNow) {
            arr = newArr.slice(0);
            retNow = false; // only do this once
          }
          if(sticky.tasks !== undefined) {
            newArr = [];
            sticky.tasks.forEach(stickyTask => {
              if(stickyTask.id === task.id)
                retNow = true;
              else newArr.push(stickyTask.taskNo);
            })
          }
        });
      }
    });
    return arr;
  }

  async set(settingName,value){
    await this.storage.set(`setting:${ settingName }`,value);
  }

  doSave(result: any) {
    let publishTraining = false;
    let newUserTraining:UserTraining = JSON.parse(JSON.stringify(this.userTraining));
    let saveArray = [];

    saveArray.push( {
      id: '' + result.data.path,
      data: result.data.payload
    });
    if (result.data.path.split('/').length === 2) {
      // It is a training and we need an associated UserTraining
      if(result.data.payload.published === true) publishTraining = true;
      newUserTraining.name = result.data.payload.name;
      newUserTraining.version = result.data.payload.version;
      saveArray.push( {
        id: 'user-training/' + newUserTraining.id,
        data: newUserTraining
      });
     }
    if(saveArray.length !== 0)
      // Put this in a try/catch with snackbar
      this.fsService.atomicSave(saveArray);

    if(publishTraining) {
      let pubTraining: PublishedTraining = <PublishedTraining>{
        id: null,
        pubdescription: result.data.payload.pubdescription,
        trainingid: this.trainingId,
        version: result.data.payload.version,
        trainingname: null,
        description: null,
        module: null,
        sticky: null,
        moduledata: null,
        stickydata: null,
        tasks: null
      };
      this.trainingService.publishTraining(pubTraining, this.training);
    }
  }

  doDeleteNode() {
    console.log("Deleting Node");
  }

  doAddNode() {
    console.log("Adding Node");

    let selectedData = this.selectedNode.data;
    let data: any;
    if(this.selectedNode.data.nodeType === 'ROOT')
      data = this.createNewModule(selectedData.path, selectedData.payload);
    if(this.selectedNode.data.nodeType === 'M')
      data = this.createNewSticky(selectedData.path, selectedData.payload);
    if(this.selectedNode.data.nodeType === 'S')
      data = this.createNewTask(selectedData.path, selectedData.payload);

    const nodeId = customizeUtil.uuid.newid();
    let theNode:any = this.mindMap.addNode(this.selectedNode, nodeId, data.payload.name, data);
    this.mindMap.setNodeColor(nodeId, '#f1c40f','#ffffff');
//    this.mindMap.updateNode(nodeId, theNode.topic, "");
  }

  createNewModule(path: string, training:Training) {
    let moduleRefId = this.fsService.getDocRef(path + '/modules');
    let newModule: Module = <Module>{
      name: 'New Module',
      id: moduleRefId.ref.id,
      description: 'New Module Description',
      moduleNo: 0,
      video: ''
    };

   this.setDoc(newModule, path + '/modules/' + moduleRefId.ref.id);
   return this.createModuleObject(newModule, path);
  }

  createNewSticky(path: string, module:Module) {
    let stickyRefId = this.fsService.getDocRef(path + '/stickies');
    let newSticky: Sticky = <Sticky>{
      name: 'New Sticky',
      id: stickyRefId.ref.id,
      description: 'New Sticky Description',
      moduleNo: 1,
      stickyNo: 0,
      video: ''
    };

    this.setDoc(newSticky, path + '/stickies/' + stickyRefId.ref.id);
    return this.createStickyObject(newSticky, path);
  }
  createNewTask(path: string, sticky:Sticky) {
    let taskRefId = this.fsService.getDocRef(path + '/tasks');
    let newTask: Task = <Task>{
      name: 'New Task',
      description: 'New Task Description',
      taskNo: 0,
      id: taskRefId.ref.id,
      video: '',
      descriptionComplete: false,
      videoComplete: false,
      taskComplete: false
    };
    this.setDoc(newTask, path + '/tasks/' + taskRefId.ref.id);
    return this.createTaskObject(newTask, path);
  }

  getMindMapData() {
    const data = this.mindMap.getData().data;
    console.log('data: ', data);
  }

  // When Creating new docs
  // Writes changes to Firestore
  async setDoc(doc: any, path: string) {
    try {
      await this.fsService.upsert(path, doc);
    } catch (err) {
      console.log(err)
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
