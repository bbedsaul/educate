import {Module} from "./module";
import {Sticky} from "./sticky";
import {Task} from "./task";

export interface PublishedTraining {
  id: string;
  description: string;
  module: number;
  sticky: number;
  version: number;
  status: string;
  pubdescription:string;
  trainingid: string;
  trainingname: string;
  moduledata:Module;
  stickydata: Sticky;
  tasks: Task[];
  createdAt?: number;
  updatedAt?: number;
}
