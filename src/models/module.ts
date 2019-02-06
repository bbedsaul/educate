import { Sticky } from "./sticky";

export interface Module {
  id: string,
  name: string,
  description: string,
  moduleNo: number,
  status?: string,
  stickies?: Sticky[],
  updatedAt?: number
}
