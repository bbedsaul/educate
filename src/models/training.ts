import {Task} from "./task";
import {Module} from "./module";
import {Sprint} from "./sprint";

export interface Training {
  id: string;
  name: string;
  description: string;
  version?: number;
  published: boolean;
  pubdescription?: string;
  modules?: Module[]
  sprints?: Sprint[]
  updatedAt?: number;
}
