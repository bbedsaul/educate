import { Task } from "./task";

export interface Sticky {
  id: string,
  name: string,
  stickyNo: number,
  description: string,
  moduleNo: number,
  video?: string,
  points: string,
  minutes: string,
  stickyComplete: boolean,
  status?: string,
  tasks?: Task[],
  updatedAt?: number
}
