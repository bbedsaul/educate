import {Component, Inject, OnInit} from '@angular/core';
import {IonicPage} from 'ionic-angular';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {StickyPopInterface} from "../../../models/stickypop";
import {PublishedTraining} from "../../../models/published-training";
import {EmbedVideoService} from "ngx-embed-video/dist";
import {DomSanitizer} from "@angular/platform-browser";
import {InAppBrowser, InAppBrowserOptions} from '@ionic-native/in-app-browser';

/**
 * Generated class for the MovestickypopupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stickypopup',
  templateUrl: 'stickypopup.html',
})
export class StickyPopupPage implements OnInit {
  sticky: PublishedTraining;
  plData:StickyPopInterface;
  width: number = 325;
  height: number = 200;
  innerHtml: string = "";
  youtube:boolean = false;
  vimeo:boolean = false;
  videoId: string = "";
  imgUrl: string = "";

  constructor(@Inject(MAT_DIALOG_DATA) public data:any,
              private embedService:EmbedVideoService,
              private domSanitizer: DomSanitizer,
              private iab: InAppBrowser,
              private dialogRef: MatDialogRef<StickyPopupPage>,) {
  }

  ngOnInit() {
    this.plData = this.data.payload as StickyPopInterface;
    this.sticky = this.plData.sticky;
    if(this.plData.width > 500) {
      this.width = 640;
      this.height = 300;
    }
    this.doVideoWork(this.sticky.stickydata.video);
  }

  close(event, option: string) {
    console.log("stickypopup choosen action:: " + option);
    this.plData.newstatus = option;
    this.dialogRef.close(this.plData);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StickyPopupPage');
  }

  openStickyDetails() {
    console.log("Opening Sticky Details");
  }

  doVideoWork(url:string) {
    // Find the Youbute or Vimeo number
    this.getVideoSpecs(url);
    try {
      let imageSize:string = 'sddefault';
//      width="640" height="360" controls webditallowfullscreen mozallowfullscreen allowfullscreen>
      const retValue = this.embedService.embed_image(this.imgUrl, { image: imageSize})
        .then(data => {
          this.innerHtml = data.html;
        });
      console.log("Embed String :: " + retValue);
      console.log("Video Url String :: " + this.sticky.stickydata.video);
    } catch (err) {
      console.log("Error Getting Embed String :: " + err);
    }
  }

  private getVideoSpecs(url:string) {
    if(url.includes('you')) {
      this.youtube = true;

      var youtubeRegExp = /(?:[?&]vi?=|\/embed\/|\/\d\d?\/|\/vi?\/|https?:\/\/(?:www\.)?youtu\.be\/)([^&\n?#]+)/;
      var match = url.match( youtubeRegExp );

      if( match && match[ 1 ].length == 11 ) {
        this.videoId = match[ 1 ];
        this.imgUrl = 'https://www.youtube.com/watch?v=' + this.videoId;
      } else {
        // error
        this.youtube = false;
      }
    }
    if(url.includes('vimeo')) {
      this.vimeo = true;
      var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
      var match = url.match(regExp);

      if (match){
        this.videoId = match[5];
        this.imgUrl = 'https://vimeo.com/' + this.videoId;
      }else{
        this.vimeo = false;
      }
    }

  }

  playVideo() {
    const options: InAppBrowserOptions = {
      zoom: 'no'
    };

    // Opening a URL and returning an InAppBrowserObject
    //const browser = this.iab.create('https://www.youtube.com/embed/09eutU4uXQc?autoplay=1', '_blank', options);
    let videoUrl:string = '';
    if(this.youtube) {

      videoUrl = 'https://www.youtube.com/embed/' + this.videoId + '?autoplay=1';
    } else if (this.vimeo) {
      videoUrl = 'https://player.vimeo.com/video/' + this.videoId + '?autoplay=1';
    }
    const browser = this.iab.create(videoUrl, '_blank', options);
    browser.insertCSS({ code: "body{ position: absolute; width: 100%; height: 100%; top: 0; left: 0; bottom: 0; right: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; }" });

    // Inject scripts, css and more with browser.X
  }

  getDescription() {
    return this.sticky.stickydata.description.replace(/(?:\r\n|\r|\n)/g, '<br>');
  }

  isVideo() {
    return (this.sticky.stickydata.video === undefined || this.sticky.stickydata.video === '') ? false : true;
  }

  isDoing() {
    if(!this.plData.owner) return false;

    if (this.sticky.status === 'doing') return true;

    return false;
  }

  showItem(status:string) {
    if (this.sticky.status === status)
      return false;

    // If you don't own this item.
    if(!this.plData.owner) return false;

    if(this.sticky.status === 'todo' && status === 'completed')
      return false;

    if(this.sticky.status === 'blocked' && status === 'completed')
      return false;

    if(this.sticky.status === 'completed' && (status === 'doing' || status === 'blocked'))
      return false;

    return true;
  }

  cancelUpdate() {
    this.dialogRef.close();
  }
}
