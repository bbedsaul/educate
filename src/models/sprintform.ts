import {Sprinter} from "./sprinter";

export interface SprintForm {
  steps: [{
    name: string,
    displayname: string,
    description: string
    },
    {
      meetingLink: string,
      startTime: number,
      startDate: number,
      endDate: number,
      frequency: number,
    },
    {
      facilitatorid: string,
      facilitatorName: string,
      facilitatorEmail: string,
      sponsorid: string,
      sponsorName: string,
      sponsorEmail: string,
    },
    {
      sprintercount: number,
      sprinters: [{
        name: string,
        email: string,
        picture: string
      }]
    }
  ]
}
