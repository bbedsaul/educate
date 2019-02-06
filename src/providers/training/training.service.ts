import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { Training } from '../../models/training';
import { UIService } from '../../shared/ui.service';
import * as UI from '../../shared/ui.actions';
import * as TrainingAction from './training.actions';
import * as fromTraining from './training.reducer';
import {UserTraining} from "../../models/user-training";
import {FirestoreProvider} from "../firestore/firestore";
import {Module} from "../../models/module";
import {Sticky} from "../../models/sticky";
import {Task} from "../../models/task";
import {PublishedTraining} from "../../models/published-training";

@Injectable()
export class TrainingService {
  private fbSubs: Subscription[] = [];
  private noSt: number = 0;

  constructor(
    private fsService: FirestoreProvider,
    private uiService: UIService,
    private store: Store<fromTraining.State>
  ) {}

  fetchUserTrainings(userid: string) {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.fsService.colWithIds$('user-training', ref =>
          ref.where('userid', '==', userid)
      )
        .subscribe(
          (usertrainings: UserTraining[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new TrainingAction.SetUserTrainings(usertrainings));
          },
          error => {
            console.log(error);
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching Trainings failed, please try again later',
              null,
              3000
            );
          }
        )
    );
  }

  previewPublishTrainingList(training:Training) {
    let retVal:PublishedTraining[] = [];

    if(training.modules === undefined) {
      // Need a snackbar to say that the training is unpublished
      console.log("Cannot publish training without Modules defined ");
      return;
    }
    // Step through Modules
    training.modules.forEach((module:Module) => {

      if(module.stickies === undefined) {
        // Need a snackbar to say that the training is unpublished
        console.log("Found Module without any Stickies:: Will skip and continue");
        return;
      }
      module.stickies.forEach((sticky:Sticky) => {
        // Got a sticky, now create a Published Module/Sticky
        let newModule:Module = { ...module};
        delete newModule.stickies;
        let newSticky:Sticky = { ...sticky};
        delete newSticky.tasks;

        // TODO: THIS IS A PATCH TILL WE GET A FIX
        if(newModule.moduleNo === undefined) newModule.moduleNo = 1;
        if(newSticky.stickyNo === undefined) newSticky.stickyNo = 1;

        let pubDoc: PublishedTraining = <PublishedTraining>{
          id: '',
          type: '',
          version: 0,
          pubdescription: '',
          description: training.description,
          module: newModule.moduleNo,
          sticky: newSticky.stickyNo,
          trainingid: training.id,
          trainingname: training.name,
          moduledata: newModule,
          stickydata: newSticky,
          status: 'todo',
          tasks: sticky.tasks,
        };

        retVal.push(pubDoc);
      });
    });
    return retVal;
  }

  publishTraining(pubTrain: PublishedTraining, training:Training) {
    if(training.modules === undefined) {
      // Need a snackbar to say that the training is unpublished
      console.log("Cannot publish training without Modules defined ");
      return;
    }
    // Step through Modules
    training.modules.forEach((module:Module) => {

      if(module.stickies === undefined) {
        // Need a snackbar to say that the training is unpublished
        console.log("Found Module without any Stickies:: Will skip and continue");
        return;
      }
      module.stickies.forEach((sticky:Sticky) => {
        let pubDocRef = this.fsService.getDocRef('published-trainings');
        // Got a sticky, now create a Published Module/Sticky
        let newModule:Module = { ...module};
        delete newModule.stickies;
        let newSticky:Sticky = { ...sticky};
        delete newSticky.tasks;

        // TODO: THIS IS A PATCH TILL WE GET A FIX
        if(newModule.moduleNo === undefined) newModule.moduleNo = 1;
        if(newSticky.stickyNo === undefined) newSticky.stickyNo = 1;

        let pubDoc: PublishedTraining = {...pubTrain};
        pubDoc.id = pubDocRef.ref.id;
        pubDoc.description = training.description;
        pubDoc.module = newModule.moduleNo;
        pubDoc.sticky = newSticky.stickyNo;
        pubDoc.trainingid = training.id;
        pubDoc.trainingname = training.name;
        pubDoc.moduledata = newModule;
        pubDoc.stickydata = newSticky;
        pubDoc.status = 'todo';
        pubDoc.tasks = sticky.tasks;
        return this.fsService.upsert('published-trainings/' + pubDocRef.ref.id, pubDoc );
      })
    });
  }

  async getTrainingModules(id:string) {
    await this.fsService.colWithIds$('trainings/' + id + '/modules').subscribe(
      (modules: Module[]) => {
        return modules;
      },
      error => {
        console.log(error);
      });
  }

  async getAllModules(training:Training) {
    await this.fsService.colWithIds$('trainings/' + training.id + '/modules').subscribe(
      (modules: Module[]) => {
        training.modules = modules;

        if(modules === undefined || modules.length === 0) {
          this.store.dispatch(new UI.StopLoading());
          this.store.dispatch(new TrainingAction.SetTrainingAll(training));
        }
        let lastModule = false;
        modules.forEach((module:Module, index:number, moduleArr:Module[]) => {
          this.getModuleStickies(module, training);
          if(moduleArr.length === (index + 1)) lastModule = true;
        });
        return modules as Module[];
      },
      (error) => {
        console.log(error);
      });
  }

  getAllTasks(stickies:Sticky[], training:Training, moduleid:string) {
    stickies.forEach((sticky:Sticky) => {
      this.noSt++;
      this.fbSubs.push(
        this.fsService.colWithIds$('trainings/' + training.id + '/modules/' + moduleid + '/stickies/' + sticky.id + '/tasks').subscribe(
          (tasks: Task[]) => {
            sticky.tasks = tasks;
            this.noSt--;
            if(this.noSt === 0) {
              this.store.dispatch(new UI.StopLoading());
              this.store.dispatch(new TrainingAction.SetTrainingAll(training));
            }
          },
          error => {
            console.log("ERROR: Getting Tasks in fetchTrainingAll");
          }
        )
      );
    });
  }

  async getModuleStickies(module:Module, training:Training) {
      this.noSt++;
      this.fbSubs.push(
        await this.fsService.colWithIds$('trainings/' + training.id + '/modules/' + module.id + '/stickies').subscribe(
          async (stickies: Sticky[]) => {
            this.noSt--;
            module.stickies = stickies;
            await this.getAllTasks(stickies, training, module.id);
            console.log("got all tasks for a sticky");
            if(this.noSt === 0) {
              this.store.dispatch(new UI.StopLoading());
              this.store.dispatch(new TrainingAction.SetTrainingAll(training));
            }
          },
          (error)=> {
            console.log(error);
          }
        ));
  }

  fetchAllTraining(trainingid: string) {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.fsService.docWithId$('trainings/' + trainingid)
        .subscribe(
          (training: Training) => {
            try {
              this.getAllModules(training);
              this.getTrainingModules(training.id).then(

              );
              console.log("Now");
            }
            catch(error) {
              console.log(error);
            }
            finally {
              console.log('in the finally');
            }
          },
          (error) => {
            console.log(error);
          }
        )
    );
  }

  async fetchTrainingAll(trainingid: string) {
    this.store.dispatch(new UI.StartLoading());
    await this.fbSubs.push(
      this.fsService.docWithId$('trainings/' + trainingid)
        .subscribe(
          async (training: Training) => {
            // Fetch Modules
           await this.fsService.colWithIds$('trainings/' + trainingid + '/modules').subscribe(
              async (modules: Module[]) => {
                training.modules = modules;
                /*
                if(modules === undefined || modules.length === 0) {
                  this.store.dispatch(new UI.StopLoading());
                  this.store.dispatch(new TrainingAction.SetTrainingAll(training));
                }
                */
                let lastModule = false;
                await modules.forEach((module:Module, moduleIndex: number, modules: Module[]) => {
                  if(modules.length === (moduleIndex + 1)) lastModule = true;
                  this.fbSubs.push(
                    this.fsService.colWithIds$('trainings/' + trainingid + '/modules/' + module.id + '/stickies').subscribe(
                      async (stickies: Sticky[]) => {
                        module.stickies = stickies;
                        if(lastModule && (stickies === undefined || stickies.length === 0)) {
                    //      this.store.dispatch(new UI.StopLoading());
                    //      this.store.dispatch(new TrainingAction.SetTrainingAll(training));
                        }
                        let lastSticky = false;
                        await stickies.forEach((sticky:Sticky, stickyIndex:number, stickies: Sticky[]) => {
                          if(stickies.length === (stickyIndex + 1)) lastSticky = true;
                          this.fbSubs.push(
                            this.fsService.colWithIds$('trainings/' + trainingid + '/modules/' + module.id + '/stickies/' + sticky.id + '/tasks').subscribe(
                              (tasks: Task[]) => {
                                sticky.tasks = tasks;
                                if(lastSticky && lastModule) {
                                  this.store.dispatch(new UI.StopLoading());
                                  this.store.dispatch(new TrainingAction.SetTrainingAll(training));
                                }
                              },
                              error => {
                                console.log("ERROR: Getting Tasks in fetchTrainingAll");
                              }
                            )
                          );
                        });
                      },
                      error => {
                        console.log("ERROR: Getting Stickies in fetchTrainingAll");
                      }
                    )
                  );
                });
              },
              error => {
                console.log("ERROR: Getting Modules in fetchTrainingAll");
              });
            //this.store.dispatch(new UI.StopLoading());
            //this.store.dispatch(new TrainingAction.SetTrainingAll(training));
          },
          error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching Training failed, please try again later',
              null,
              3000
            );
          }
        )
    );
  }

  fetchTasks(trainingid: string, moduleid: string, stickyid: string) {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.fsService.colWithIds$('trainings/' + trainingid + '/modules/' + moduleid + '/stickies/' + stickyid + '/tasks')
        .subscribe(
          (tasks: Task[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new TrainingAction.SetTasks(tasks));
          },
          error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching Tasks failed, please try again later',
              null,
              3000
            );
          }
        )
    );
  }

  fetchModules(trainingid: string) {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.fsService.colWithIds$('trainings/' + trainingid + '/modules')
        .subscribe(
          (modules: Module[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new TrainingAction.SetModules(modules));
          },
          error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching Modules failed, please try again later',
              null,
              3000
            );
          }
        )
    );
  }

  fetchStickies(trainingid: string, moduleid: string) {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.fsService.colWithIds$('trainings/' + trainingid + '/modules/' + moduleid + '/stickies')
        .subscribe(
          (stickies: Sticky[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new TrainingAction.SetStickies(stickies));
          },
          error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching Stickies failed, please try again later',
              null,
              3000
            );
          }
        )
    );
  }

  fetchUserTrainingsByTrainingIdType(trainingId: string, type: string) {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.fsService.colWithIds$('user-training', ref =>
        ref.where('trainingid', '==', trainingId)
          .where('permission', '==', type)
      )
        .subscribe(
          (usertrainings: UserTraining[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new TrainingAction.SetTrainingTeam(usertrainings));
          },
          error => {
            console.log(error);
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching Trainings failed, please try again later',
              null,
              3000
            );
          }
        )
    );
  }

  fetchAllUserTrainingsByTrainingId(trainingId: string) {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.fsService.colWithIds$('user-training', ref =>
        ref.where('trainingid', '==', trainingId))
        .subscribe(
          (usertrainings: UserTraining[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new TrainingAction.SetTrainingTeam(usertrainings));
          },
          error => {
            console.log(error);
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching Trainings failed, please try again later',
              null,
              3000
            );
          }
        )
    );
  }

  fetchTask(taskId: string) {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.fsService.docWithId$(taskId)
        .subscribe(
          (task: Task) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new TrainingAction.SetTask(task));
          },
          error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching Task failed, please try again later',
              null,
              3000
            );
          }
        )
    );
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

}
