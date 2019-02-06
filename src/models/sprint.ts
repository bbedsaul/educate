import {Sprinter} from "./sprinter";

export interface Sprint {
  id: string,
  trainingid: string,
  name: string,
  displayname: string,
  description: string,
  ownerid: string,
  ownerName: string,
  ownerEmail: string,
  facilitatorid: string,
  facilitatorName: string,
  facilitatorEmail: string,
  sponsorid: string,
  sponsorName: string,
  sponsorEmail: string,
  meetingLink: string,
  startTime: number,
  startDate: number,
  endDate: number,
  frequency: [{
    name: string,
    label: string,
    checked: boolean
  }],
  sprintercount: number,
  sprinterids: string [],
  sprinters: [{
    id: string,
    name: string,
    email: string,
    picture: string
  }]
}
