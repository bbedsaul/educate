import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Storage} from '@ionic/storage';
import { Store } from '@ngrx/store';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { TrainingService } from '../../providers/training/training.service';
import * as fromTraining from '../../providers/training/training.reducer';
import * as fromUserProfile from '../../providers/userprofile/userprofile.reducer';
import {IonicPage} from "ionic-angular";
import {Training} from "../../models/training";
import {UserTraining} from "../../models/user-training";
import {Router} from "@angular/router";
import {UserProfile} from "../../models/userprofile";
import {FirestoreProvider} from "../../providers/firestore/firestore";
import {Sprint} from "../../models/sprint";

@IonicPage()
@Component({
  selector: 'page-training',
  templateUrl: './training.html',
})
export class TrainingPage implements OnInit, AfterViewInit {
  displayedColumns = ['sprinter', 'name', 'permission', 'edit', 'team'];
  dataSource = new MatTableDataSource<UserTraining>();
  userProfile: UserProfile;

  training: Training;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private trainingService: TrainingService,
              private profileStore: Store<fromUserProfile.State>,
              private fsService: FirestoreProvider,
              private storage: Storage,
              private router: Router,
              private store: Store<fromTraining.State>) {}

  ngOnInit() {
    this.profileStore.select(fromUserProfile.getUserProfile).subscribe(
      (userprofile: UserProfile) => {
        if(userprofile === null || userprofile === undefined) return;
        this.userProfile = userprofile;
        this.store.select(fromTraining.getUserTrainings).subscribe(
          (trainings: UserTraining[]) => {
            let set = new Set(trainings.map(training => training.id));
            let data:UserTraining[] = [];
            trainings.map ( training => {
              if (set.has(training.id)) {
                set.delete(training.id);
                data.push(training);
              }
            });
            this.dataSource.data = data;
          },
          (e) => {
            console.log(e);
          }
        );
        this.trainingService.fetchUserTrainings(this.userProfile.id);
      },
      (e) => {
        console.log(e);
      }
    )
  }

  newTraining() {
    let userTrainingId = this.fsService.getDocRef('user-training');
    let trainingId = this.fsService.getDocRef('trainings');
    let userTraining = {
      name: 'New Training',
      id: userTrainingId.ref.id,
      permission: 'owner',
      userid: this.userProfile.id,
      displayName: this.userProfile.displayName,
      email: this.userProfile.email,
      trainingid: trainingId.ref.id
    };
    let training = {
      name: 'New Training',
      description: 'New Training',
      version: 1
    };
    this.setDoc(userTraining, 'user-training/' + userTrainingId.ref.id);
    this.setDoc(training, 'trainings/' + trainingId.ref.id);
    this.router.navigate(['/training/content', userTraining]);
  }

  getPermission(usertraining: UserTraining) {
    let retVal: string = '';
    if(usertraining.permission === 'student') {
      retVal += 'Sprinter';
    }
    if(usertraining.permission === 'facilitator') {
      if(retVal.length > 0) retVal += ', ';
      retVal += 'Facilitator';
    }
    if(usertraining.permission === 'sponsor') {
      if(retVal.length > 0) retVal += ', ';
      retVal += 'Coach';
    }
    if(usertraining.permission === 'specialist') {
      if(retVal.length > 0) retVal += ', ';
      retVal += 'Specialist';
    }
    if(usertraining.permission === 'owner') {
      if(retVal.length > 0) retVal += ', ';
      retVal += 'Educator';
    }
    return retVal;
  }

  canSprint(usertraining: UserTraining) {

    return false;
  }

  canTeam(usertraining: UserTraining) {

    return false;
  }

  canEdit(usertraining: UserTraining) {

    return false;
  }

  doTraining(userTraining: UserTraining) {
    // `this.store.dispatch(new TrainingAction.SetUserTraining(userTraining.trainingid));
    let userTrainingArr:UserTraining[] = [ userTraining ];
    this.set('sprinterdata', userTrainingArr)
      .then( () => {
        this.router.navigate(['/training/sprinterview']);
      })
      .catch(err => {
        console.log('Error writing to local storage :: ' + err);
      })
  }

  editTraining(userTraining: UserTraining) {
    // `this.store.dispatch(new TrainingAction.SetUserTraining(userTraining.trainingid));
    this.router.navigate(['/training/content', userTraining]);
  }

  addSprint(userTraining: UserTraining) {
    this.router.navigate(['/training/sprint-form', userTraining.trainingid, 'add']);
  }

  editTeam(userTraining: UserTraining) {
    this.router.navigate(['/training/team', userTraining.trainingid, userTraining.name]);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  deleteTraining(userTraining: UserTraining) {
    console.log("doing deleteTraining");
  }

  showSprints (userTraining: UserTraining) {
    this.router.navigate(['/sprints']);
  }

  // Writes changes to Firestore
  setDoc(doc: any, path: string) {
    try {
      this.fsService.set(path, doc);
    } catch (err) {
      console.log(err)
    }
  }

  async set(settingName,value){
    await this.storage.set(`setting:${ settingName }`,value);
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
