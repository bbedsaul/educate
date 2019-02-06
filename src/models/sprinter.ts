import {PublishedTraining} from "./published-training";
import {UserTraining} from "./user-training";

export interface Sprinter {
  email: string,
  displayName: string,
  usertraining?: UserTraining,
  photoUrl?: string,
  todo: PublishedTraining[],
  doing: PublishedTraining[],
  blocked: PublishedTraining[],
  completed: PublishedTraining[]
}
