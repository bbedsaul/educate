import {PublishedTraining} from "./published-training";

export interface StickyPopInterface {
    userid: string;
    userindex: number;
    index: number;
    newstatus: string;
    owner: boolean;
    width: number;
    sticky:PublishedTraining;
    cssClass?: string;
}
