import {Component, OnDestroy, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import { Storage } from '@ionic/storage';
import { Store } from '@ngrx/store';

import * as fromUserProfile from '../../../../providers/userprofile/userprofile.reducer';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {FirestoreProvider} from "../../../../providers/firestore/firestore";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {UIService} from "../../../../shared/ui.service";
import {UserTraining} from "../../../../models/user-training";
import {tap} from "rxjs/operators";
import {IonicPage} from "ionic-angular";
import {Sticky} from "../../../../models/sticky";
import {Task} from '../../../../models/task';
import {EmbedVideoService} from "ngx-embed-video/dist";
import {PublishedTraining} from "../../../../models/published-training";
import {InAppBrowser, InAppBrowserOptions} from "@ionic-native/in-app-browser";

@IonicPage()
@Component({
  selector: 'page-dotask',
  templateUrl: './dotask.html',
})
export class DoTaskPage implements OnInit, OnDestroy {
  taskForms: FormGroup[] = [];
  state: string;
  stickyid: string;
  sticky: Sticky;
  taskid: string;
  usertrainingid: string;
  mode: string;
  task: Task;
  origTask: Task;
  trainingDoc: UserTraining;
  subs: Subscription = new Subscription();
  videoId:string = '';
  vimeo:boolean = false;
  youtube:boolean = false;
  innerHtml:string = '';
  imgUrl:string = '';

  constructor(private fb: FormBuilder,
              private fsService: FirestoreProvider,
              private profileStore: Store<fromUserProfile.State>,
              private router: Router,
              private location: Location,
              private storage: Storage,
              private embedService:EmbedVideoService,
              private iab: InAppBrowser,
              private uiService: UIService,
              private route: ActivatedRoute) {

    this.origTask = this.task = <Task>{
      description: '',
      name:'',
      id: '',
      taskNo: 0,
      questions: [],
      video: '',
      descriptionComplete: false,
      videoComplete:false,
      taskComplete:false,
    }
  }

  ngOnInit() {
    this.usertrainingid = this.route.snapshot.params['usertrainingid'];
    this.stickyid = this.route.snapshot.params['stickyid'];
    this.taskid = this.route.snapshot.params['taskid'];
    this.mode = this.route.snapshot.params['mode'];
    if(this.mode === undefined) this.mode = 'live';

    if(this.mode === 'live') {
      this.subs.add(this.fsService.docWithId$('user-training/' + this.usertrainingid)
        .subscribe(
          (userTraining: UserTraining) => {
            // Find the sticky and load the tasks
            this.trainingDoc = userTraining;
            userTraining.doing.forEach(sticky => {

              if (sticky.stickydata.id === this.stickyid) {
                this.sticky = sticky.stickydata;
                sticky.tasks.forEach(task => {
                  if (task.id === this.taskid) {
                    this.task = task;
                    this.origTask = JSON.parse(JSON.stringify(this.task)) as Task;
                    this.doVideoWork(this.origTask.video);
                  }
                })
              }
            })
          },
          (error) => {
            console.log(error);
          }
        )
      );
    } else {
      // Preview mode
      this.get("previewdata")
        .then((data:PublishedTraining[]) => {
          data.forEach((pubTrain:PublishedTraining) => {
            if (pubTrain.stickydata.id === this.stickyid) {
              this.sticky = pubTrain.stickydata;
              pubTrain.tasks.forEach(task => {
                if (task.id === this.taskid) {
                  this.task = task;
                  this.origTask = JSON.parse(JSON.stringify(this.task)) as Task;
                  this.doVideoWork(this.origTask.video);
                }
              })
            }
          });
        })
        .catch(err => {
          console.log("cannot get preview data from local storage :: " + err);
        })
    }
  }

  public async get(settingName){
    return await this.storage.get(`setting:${ settingName }`);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  doVideoWork(url:string) {
    // Find the Youbute or Vimeo number
    this.getVideoSpecs(url);
    try {
      let imageSize:string = 'sddefault';
//      width="640" height="360" controls webditallowfullscreen mozallowfullscreen allowfullscreen>
      const retValue = this.embedService.embed_image(this.imgUrl, { image: imageSize})
        .then(data => {
          this.innerHtml = data.html;
        });
      console.log("Embed String :: " + retValue);
      console.log("Video Url String :: " + url);
    } catch (err) {
      console.log("Error Getting Embed String :: " + err);
    }
  }

  private getVideoSpecs(url:string) {
    if(url.includes('you')) {
      this.youtube = true;

      var youtubeRegExp = /(?:[?&]vi?=|\/embed\/|\/\d\d?\/|\/vi?\/|https?:\/\/(?:www\.)?youtu\.be\/)([^&\n?#]+)/;
      var match = url.match( youtubeRegExp );

      if( match && match[ 1 ].length == 11 ) {
        this.videoId = match[ 1 ];
        this.imgUrl = 'https://www.youtube.com/watch?v=' + this.videoId;
      } else {
        // error
        this.youtube = false;
      }
    }
    if(url.includes('vimeo')) {
      this.vimeo = true;
      var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
      var match = url.match(regExp);

      if (match){
        this.videoId = match[5];
        this.imgUrl = 'https://vimeo.com/' + this.videoId;
      }else{
        this.vimeo = false;
      }
    }

  }

  playVideo() {
    const options: InAppBrowserOptions = {
      zoom: 'no'
    };

    // Opening a URL and returning an InAppBrowserObject
    //const browser = this.iab.create('https://www.youtube.com/embed/09eutU4uXQc?autoplay=1', '_blank', options);
    let videoUrl:string = '';
    if(this.youtube) {

      videoUrl = 'https://www.youtube.com/embed/' + this.videoId + '?autoplay=1';
    } else if (this.vimeo) {
      videoUrl = 'https://player.vimeo.com/video/' + this.videoId + '?autoplay=1';
    }
    const browser = this.iab.create(videoUrl, '_blank', options);
    browser.insertCSS({ code: "body{ position: absolute; width: 100%; height: 100%; top: 0; left: 0; bottom: 0; right: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; }" });

    // Inject scripts, css and more with browser.X
  }
  getVideoUrl() {
    try {
      const retValue = this.embedService.embed(this.task.video);
      console.log("Embed String :: " + retValue);
      return retValue;
    } catch (err) {
      console.log("Error Getting Embed String :: " + err);
      return ("Could Not Get Video");
    }
  }

  isVideo() {
    return (this.origTask.video === undefined || this.origTask.video === '') ? false : true;
  }
  getDescription() {
    return this.origTask.description.replace(/(?:\r\n|\r|\n)/g, '<br>');
  }

  async setDoc(doc: any, path: string) {
    try {
      await this.fsService.upsert(path, doc);
    } catch (err) {
      console.log(err)
    }
  }

  completeStep(index: number) {

    if(this.mode === 'preview') return;
    // Find the sticky and load the tasks
    for(let trainingIndex = 0; this.trainingDoc.doing.length > trainingIndex; trainingIndex++) {
      let updateDoc = false;

      if(this.trainingDoc.doing[trainingIndex].stickydata.id === this.stickyid) {
        for(let taskIndex=0; this.trainingDoc.doing[trainingIndex].tasks.length > taskIndex; taskIndex++) {

          if (this.trainingDoc.doing[trainingIndex].tasks[taskIndex].id === this.taskid) {
            if(index === -2 && !this.origTask.descriptionComplete) {
              this.trainingDoc.doing[trainingIndex].tasks[taskIndex].descriptionComplete = true;
              updateDoc = true;
            } else if(index === -1 && !this.origTask.videoComplete) {
              this.trainingDoc.doing[trainingIndex].tasks[taskIndex].videoComplete = true;
              updateDoc = true;
            } else if(index >= 0) {
              // It is a question that is complete
              let answerIndex:number = this.getStudentAnswerIndex(index);
              if(answerIndex >= 0) {
                this.trainingDoc.doing[trainingIndex].tasks[taskIndex].questions[index].answers[answerIndex].studentAnswer = true;
                this.trainingDoc.doing[trainingIndex].tasks[taskIndex].questions[index].questionComplete = true;
                updateDoc = true;
              }
            }
            // Fix trainingDoc
            if(updateDoc) {
              if(this.isTaskComplete(this.trainingDoc.doing[trainingIndex].tasks[taskIndex])) {
                if(this.isStickyComplete(this.trainingDoc.doing[trainingIndex])) {
                  this.trainingDoc.doing[trainingIndex].stickydata.stickyComplete = true;
                }
                this.trainingDoc.doing[trainingIndex].tasks[taskIndex].taskComplete = true;
              }
              this.setDoc(this.trainingDoc, 'user-training/' + this.usertrainingid);
            }
          }
        };
      };
  };
}

isStickyComplete(pubTrain:PublishedTraining):boolean {
  // check if all tasks are done.
  for(let i=0; pubTrain.tasks.length > i; i++) {
    if(pubTrain.tasks[i].taskComplete === undefined || !pubTrain.tasks[i].taskComplete)
      return false;
  }
  return false;
}

isTaskComplete(task:Task):boolean {
  // are descriptionComplete, videoComplete and all tasks
  for(let i=0; task.questions.length > i; i++) {
    if(!task.questions[i].questionComplete)
      return false;
  }
  if(!task.videoComplete)
    return false;
  if(!task.descriptionComplete)
    return false;

  return true;
}
  getStudentAnswerIndex(index:number): number {
    let retValue: number = -1;

    this.task.questions[index].answers.forEach((answer, answerIndex) => {
      // if we match one then return '', we didn't change the answer.
      if(answer.studentAnswer &&
        (this.origTask.questions[index].answers[answerIndex].studentAnswer === undefined
          || !this.origTask.questions[index].answers[answerIndex].studentAnswer))
        retValue = answerIndex;
    });
    return retValue;
  }

  cancelUpdate() {
    this.location.back();
  }

  changeHandler(e) {
    // console.log(e)
    this.state = e;
  }
}
