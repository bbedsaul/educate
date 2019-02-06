import {AbstractControl} from "@angular/forms";

export function ValidateVideo(control:AbstractControl) {
  let url = control.value;
  if(url === '') return null;
  try {
    let retString = this.embedService.embed(url);
    if (retString === undefined) {
      return {
        videoError: {
          error: 'Error Parsing Url'
        }
      }
    }
    return null;
  } catch (err) {
    console.log("Error Getting Embed String :: " + err);
    return {
      videoError: {
        error: err.message
      }
    }
  }
}
