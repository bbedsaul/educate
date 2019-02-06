import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IonicPage} from "ionic-angular";
import { Store } from '@ngrx/store';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import * as fromUserProfile from '../../../../providers/userprofile/userprofile.reducer';
import {UserTraining} from "../../../../models/user-training";
import {ActivatedRoute, Router} from "@angular/router";
import {UserProfile} from "../../../../models/userprofile";
import {FirestoreProvider} from "../../../../providers/firestore/firestore";
import {Training} from "../../../../models/training";
import {Subscription} from "rxjs/Subscription";
import * as UI from "../../../../shared/ui.actions";
import {UIService} from "../../../../shared/ui.service";
import {UserprofileService} from "../../../../providers/userprofile/userprofile.service";

@IonicPage()
@Component({
  selector: 'page-teamform',
  templateUrl: './teamform.html',
})
export class TeamFormPage implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns = ['displayName', 'email'];
  dataSource = new MatTableDataSource<UserProfile>();
  trainingId: string;
  training: Training;
  sub: Subscription = new Subscription();
  type: string;
  trainingName: string;
  teamList: string[] = [];
  title: string = 'Add Facilitators';

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor( private uiService: UIService,
              private userService: UserprofileService,
              private store: Store<fromUserProfile.State>,
              private fsService: FirestoreProvider,
              private router: Router,
              private route: ActivatedRoute) {

      this.sub.add(this.route.params.subscribe( params => {
        this.trainingName = params['name'];
        this.type = params['type'];
        if(this.type === 'facilitator') this.title = 'Add Facilitators';
        else if (this.type === 'specialist') this.title = 'Add Content Specialists';
        else if (this.type === 'sponsor') this.title = 'Add Content Coach';
        else if (this.type === 'emailVerified') {
          this.title = 'Add Sprinters';
          this.type = 'student';
        }
      }));

      this.trainingId = this.route.snapshot.params['id'];
  }

  addTeamMember(user: UserProfile) {
    let userTrainingId = this.fsService.getDocRef('user-training');
    let userTraining = {
      name: this.trainingName,
      id: userTrainingId.ref.id,
      permission: this.type,
      userid: user.id,
      displayName: user.displayName,
      email: user.email,
      trainingid: this.trainingId
    };
    this.setDoc(userTraining, 'user-training/' + userTrainingId.ref.id);
  }

  showUser(userProfile: UserProfile) {
    // `this.store.dispatch(new TrainingAction.SetUserTraining(userTraining.trainingid));
    this.router.navigate(['/training/content', userProfile]);
  }

  ngOnInit() {

    let filterType:string = (this.type === 'student') ? 'emailVerified' : this.type;

    this.dataSource.filterPredicate = (data: UserProfile, filter: string) => {
//      if(filter !== '####No Filtering####')
      const dataStr:string = Object.keys(data).map(key=>data[key])
        .map(x => {
          if(typeof x === 'string')
              return x.substr(0, x.length - 1)
        }).join('');

      if( filter === '####No Filtering####') {
        if(this.teamList.indexOf(data.id) === -1 ) return true;
      } else if (dataStr.includes(filter) && this.teamList.indexOf(data.id) === -1 ) return true;

      return false;
    }

    // Sets the TeamList for a type
    this.sub.add(this.fsService.colWithIds$('user-training', ref =>
      ref.where('trainingid', '==', this.trainingId)
        .where('permission', '==', this.type))
      .subscribe(
        ( teamList: UserTraining[]) => {
          this.teamList = teamList.map(user => {
            return user.userid;
          });
          this.dataSource.filter = '####No Filtering####';
        }, (error) => {
          console.log(("Error loading team: " + error));
        }));

    // Get the users with type
    this.sub.add(this.fsService.colWithIds$('users', ref =>
      ref.where(filterType, '==', true)).subscribe(
      ( users: UserProfile[]) => {
        this.store.dispatch(new UI.StopLoading());
        this.dataSource.data = users;
        this.dataSource.filter = '####No Filtering####';
      },
      (error) => {
        console.log("Error Getting Users with filterType == " + filterType + " Error :: " + error);
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(
          'Fetching Team Users failed, please try again later',
          null,
          3000
        );
      }));

    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // Writes changes to Firestore
  setDoc(doc: any, path: string) {
    try {
      this.fsService.set(path, doc);
    } catch (err) {
      console.log(err)
    }
  }

  doFilter(filterValue: string) {

    filterValue = filterValue.trim().toLowerCase();

    if(filterValue === '') filterValue = '####No Filtering####';
    this.dataSource.filter = filterValue;
  }
}
