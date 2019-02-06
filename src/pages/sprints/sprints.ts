import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Storage } from '@ionic/storage';
import { Store } from '@ngrx/store';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SprintService } from '../../providers/sprints/sprint.service';
import * as fromUserProfile from '../../providers/userprofile/userprofile.reducer';
import {Sprint} from "../../models/sprint";
import {Router} from "@angular/router";
import {UserProfile} from "../../models/userprofile";
import {FirestoreProvider} from "../../providers/firestore/firestore";
import {Subscription} from "rxjs";
import {UserTraining} from "../../models/user-training";

@Component({
  selector: 'page-sprints',
  templateUrl: './sprints.html'
})
export class SprintsPage implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns = ['name', 'permission'];
  dataSource = new MatTableDataSource<Sprint>();
  userProfile: UserProfile;
  subs: Subscription = new Subscription();

  sprints: Sprint[];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private sprintService: SprintService,
              private profileStore: Store<fromUserProfile.State>,
              private fsService: FirestoreProvider,
              private router: Router,
              private storage: Storage) {

    console.log('In constructor for SprintsPage');
  }

  ngOnInit() {
    console.log('In ngOnInit for SprintsPage');
    this.subs.add(this.profileStore.select(fromUserProfile.getUserProfile).subscribe(
      (userprofile: UserProfile) => {
        if (userprofile === null || userprofile === undefined) return;
        this.userProfile = userprofile;
        this.subs.add(this.sprintService.fetchSprints(this.userProfile.id, (sprints) => {
          let set = new Set(sprints.map(sprint => sprint.id));
          let data:Sprint[] = [];
          sprints.map ( sprint => {
            if (set.has(sprint.id)) {
              set.delete(sprint.id);
              data.push(sprint);
            }
          });
          this.dataSource.data = data;
        }));
      },
      (e) => {
        console.log(e);
      }
    ));
  }

  ngOnDestroy() {
        this.subs.unsubscribe();
  }

  getSprintPermissions(sprint: Sprint) {
    let retVal: string = '';

    // loop through sprinter
    sprint.sprinters.forEach( sprinter => {
      if(sprinter.email === this.userProfile.email)
        retVal += 'Sprinter';
    });
    if(this.userProfile.email === sprint.facilitatorEmail ) {
      if(retVal.length > 0) retVal += ', ';
      retVal += 'Facilitator';
    }
    if(this.userProfile.email === sprint.sponsorEmail) {
      if(retVal.length > 0) retVal += ', ';
      retVal += 'Coach';
    }
    if(this.userProfile.email === sprint.ownerEmail) {
      if(retVal.length > 0) retVal += ', ';
      retVal += 'Educator';
    }
    return retVal;
  }

  newSprint() {
    /*
    let userTrainingId = this.fsService.getDocRef('user-training');
    let trainingId = this.fsService.getDocRef('trainings');
    let userTraining = {
      name: 'New Training',
      id: userTrainingId.ref.id,
      permission: 'owner',
      userid: this.userProfile.id,
      trainingid: trainingId.ref.id
    };
    let training = {
      name: 'New Sprint',
      description: 'New Sprint',
      video: ''
    };
    */
//    this.setDoc(sprints, 'sprints/' + userTrainingId.ref.id);
 //   this.setDoc(training, 'trainings/' + trainingId.ref.id);
  //  this.router.navigate(['/training/content', userTraining]);
  }

  async set(settingName,value){
    await this.storage.set(`setting:${ settingName }`,value);
  }

  getUserTraining():UserTraining  {
    return <UserTraining> {
      id: '',
      userid: '',
      trainingid: '',
      name: '',
      version: 0,
      displayName: '',
      email: '',
      permission: '',
      todo: [],
      doing: [],
      blocked: [],
      completed: []
    };
  }
  doSprint(sprint: Sprint) {
    // DO sponsor and facilitator
    let userTrainingArr:UserTraining[] = [];
    let userTraining = this.getUserTraining();
    userTraining.userid = sprint.facilitatorid;
    userTraining.displayName = sprint.facilitatorName;
    userTraining.email = sprint.facilitatorEmail;
    userTraining.permission = 'facilitator';
    userTrainingArr.push(userTraining);

    userTraining = this.getUserTraining();
    userTraining.userid = sprint.sponsorid;
    userTraining.displayName = sprint.sponsorName;
    userTraining.email = sprint.sponsorEmail;
    userTraining.permission = 'sponsor';
    userTrainingArr.push(userTraining);

    userTraining = this.getUserTraining();
    userTraining.userid = sprint.ownerid;
    userTraining.displayName = sprint.ownerName;
    userTraining.email = sprint.ownerEmail;
    userTraining.permission = 'owner';
    userTrainingArr.push(userTraining);

    sprint.sprinters.forEach(sprinter => {
      userTraining = this.getUserTraining();
      userTraining.id = sprinter.id;
      userTraining.displayName = sprinter.name;
      userTraining.email = sprinter.email;
      userTraining.permission = 'student';
      userTrainingArr.push(userTraining);
    });
    this.set('sprinterdata', userTrainingArr)
      .then( () => {
        this.router.navigate(['/training/sprinterview']);
      })
      .catch(err => {
        console.log('Error writing to local storeage ::' + err);
      })
  }

  editSprint(sprint: Sprint) {
    this.router.navigate(['/training/sprint-form', sprint.trainingid, sprint.id]);
    // `this.store.dispatch(new TrainingAction.SetUserTraining(userTraining.trainingid));
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  deleteSprint(sprint: Sprint) {
    console.log('doing deleteSprint');
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
