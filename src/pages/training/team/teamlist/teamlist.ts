import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Store } from '@ngrx/store';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { TrainingService } from '../../../../providers/training/training.service';
import * as fromTraining from '../../../../providers/training/training.reducer';
import * as fromUserProfile from '../../../../providers/userprofile/userprofile.reducer';
import {IonicPage} from "ionic-angular";
import {UserTraining} from "../../../../models/user-training";
import {ActivatedRoute, Router} from "@angular/router";
import {UserProfile} from "../../../../models/userprofile";
import {FirestoreProvider} from "../../../../providers/firestore/firestore";
import {Subscription} from "rxjs/Subscription";

@IonicPage()
@Component({
  selector: 'page-teamlist',
  templateUrl: './teamlist.html',
})
export class TeamlistPage implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns = ['delete', 'name', 'email', 'permission'];
  dataSource = new MatTableDataSource<UserTraining>();
  trainingId: string;
  trainingName: string;
  sub: Subscription = new Subscription();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private trainingService: TrainingService,
              private profileStore: Store<fromUserProfile.State>,
              private fsService: FirestoreProvider,
              private router: Router,
              private route: ActivatedRoute,
              private store: Store<fromTraining.State>) {

    this.trainingId = this.route.snapshot.params['id'];
    this.trainingName = this.route.snapshot.params['name'];
  }

  ngOnInit() {

    this.trainingService.fetchAllUserTrainingsByTrainingId(this.trainingId);

    this.sub.add(this.store.select(fromTraining.getTrainingTeam).subscribe(
      (usertrainings: UserTraining[]) => {
        this.dataSource.data = usertrainings;
      },
      (e) => {
        console.log(e);
      }
    ));
  }

  addMember(memberType:string) {
    // `this.store.dispatch(new TrainingAction.SetUserTraining(userTraining.trainingid));
    this.router.navigate(['/training/team-member', this.trainingId, memberType, this.trainingName]);
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

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
