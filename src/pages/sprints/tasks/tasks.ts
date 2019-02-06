import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Storage } from '@ionic/storage';
import { Store } from '@ngrx/store';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SprintService } from '../../../providers/sprints/sprint.service';
import * as fromSprints from '../../../providers/sprints/sprint.reducer';
import * as fromUserProfile from '../../../providers/userprofile/userprofile.reducer';
import {IonicPage} from "ionic-angular";
import {ActivatedRoute, Router} from "@angular/router";
import {UserProfile} from "../../../models/userprofile";
import {FirestoreProvider} from "../../../providers/firestore/firestore";
import {Subscription} from "rxjs";
import {Task} from '../../../models/task';
import {UserTraining} from "../../../models/user-training";
import {PublishedTraining} from "../../../models/published-training";

@IonicPage()
@Component({
  selector: 'page-tasks',
  templateUrl: './tasks.html'
})
export class TasksPage implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns = ['name', 'taskComplete'];
  dataSource = new MatTableDataSource<Task>();
  userProfile: UserProfile;
  mode: string;
  stickyid:string;
  usertrainingid: string;
  subs: Subscription = new Subscription();

  tasks: Task[];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private sprintService: SprintService,
              private profileStore: Store<fromUserProfile.State>,
              private fsService: FirestoreProvider,
              private router: Router,
              private storage: Storage,
              private route: ActivatedRoute) {

    console.log('In constructor for TasksPage');

  }

  ngOnInit() {
    this.stickyid = this.route.snapshot.params['stickyid'];
    this.usertrainingid = this.route.snapshot.params['usertrainingid'];
    this.mode = this.route.snapshot.params['mode'];
    if(this.mode === undefined) this.mode = 'live';

    this.subs.add(this.profileStore.select(fromUserProfile.getUserProfile).subscribe(
      (userprofile: UserProfile) => {
        if (userprofile === null || userprofile === undefined) return;
        this.userProfile = userprofile;

        if(this.mode === 'live') {

          this.subs.add(this.fsService.docWithId$('user-training/' + this.usertrainingid)
            .subscribe(
              (userTraining: UserTraining) => {
                // Find the sticky and load the tasks
                userTraining.doing.forEach(sticky => {

                  if (sticky.stickydata.id === this.stickyid) {
                    this.dataSource.data = sticky.tasks;
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
                this.dataSource.data = pubTrain.tasks;
              }
              });
            })
            .catch(err => {
              console.log("cannont get preview data from local storage :: " + err);
            })
        }
      },
      (error) => {
        console.log("Error getting User from Profile Store for TasksPage :: " + error );
      }));
  }

  public async get(settingName){
    return await this.storage.get(`setting:${ settingName }`);
  }

  isCompleted(task: Task) {
    if(task.taskComplete === undefined)
      return false;
    return task.taskComplete;
  }

  doTask(task: Task) {
    this.router.navigate(['/training/taskview', task.id, this.usertrainingid, this.stickyid, this.mode]);
  }

  ngOnDestroy() {
        this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
