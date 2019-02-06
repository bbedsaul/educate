import {PublishedTraining} from "./published-training";

export interface UserTraining {
  id: string;
  userid: string;
  trainingid: string;
  name: string;
  version: number;
  displayName: string;
  email: string;
  permission: string;
  todo: PublishedTraining[],
  doing: PublishedTraining[],
  blocked: PublishedTraining[],
  completed: PublishedTraining[]
  photoUrl?:string;
  updatedAt: number;
  createdAt: number;
}
