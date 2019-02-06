 // Start writing Firebase Functions
 // https://firebase.google.com/docs/functions/typescript

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require("cors");
const express = require("express");
var bodyParser = require('body-parser');
admin.initializeApp(functions.config().firebase);

 /*
 * Fires when an update to Training
 * Updates all training names in the user-training records
  */
 exports.updateWhenTrainingData = functions.firestore
   .document('trainings/{id}')
   .onUpdate((change, context) => {

     // var commentId = event.data.data();
     const newTrainingData = change.after.data();
     const previousTrainingData = change.before.data();
     const trainingId = context.params.id;

     console.log("TrainingId :: " + trainingId);
     if(newTrainingData.name === previousTrainingData.name && newTrainingData.version === previousTrainingData.version) {
       console.log("Training Name and Version did not change.");
       return null;
     }

     let updateData = {
     };

     if (newTrainingData.name !== undefined && newTrainingData.name !== null )
       updateData['name'] = newTrainingData.name;
       updateData['version'] = newTrainingData.version;
     const promises = [];
     // get all comments and aggregate
     return admin.firestore().collection('user-training').where('trainingid', '==',  trainingId)
       .get()
       .then(querySnapshot => {
         // add data from the 5 most recent comments to the array
         querySnapshot.forEach(doc => {
           const p = doc.ref.update(updateData);
           promises.push(p);
         });
         return Promise.all(promises);
       })
       .catch(err => console.log("Error updating user-training Training name :::" + err))
   });
 /*
 * Fires when an update to User Profile happens
 * Updates all display names and email addresses in
 * user-training
 * user-badges
 * user-sprints
 * user-
  */
exports.updateUserTrainingData = functions.firestore
  .document('users/{id}')
  .onUpdate((change, context) => {

    // var commentId = event.data.data();
    const newUserData = change.after.data();
    const previousUserData = change.before.data();
    const userId = context.params.id;

    console.log("UserID :: " + userId);
    if(newUserData.displayName === previousUserData.displayName && newUserData.email === previousUserData.email) {
      console.log("Display Name and Email fields did not change.");
      return null;
    }

    let updateData = {
    };

    if (newUserData.displayName !== undefined && newUserData.displayName !== null )
      updateData['displayName'] = newUserData.displayName;
    if (newUserData.email !== undefined && newUserData.email !== null )
      updateData['email'] = newUserData.email;

    console.log("UpdateData Object :: " + JSON.stringify(updateData));
    const promises = [];
    // get all comments and aggregate
    return admin.firestore().collection('user-training').where('userid', '==',  userId)
      .get()
      .then(querySnapshot => {

        // add data from the 5 most recent comments to the array
        querySnapshot.forEach(doc => {
          const p = doc.ref.update(updateData);
          promises.push(p);
        });
        return Promise.all(promises);
      })
      .catch(err => console.log("Error in updateUserTrainingData :::" + err))
  });

 /* Express */
 const app = express();
 app.use(cors({ origin: true }));
 app.use( bodyParser.json() );       // to support JSON-encoded bodies
 app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
   extended: true
 }));
 app.post("*", (request, response) => {
   response.send(
     "Hello from Express on Firebase with CORS! NEW trailing '/' required!"
   )
 });

 // not as clean, but a better endpoint to consume
 const api3 = functions.https.onRequest((request, response) => {
   if (!request.path) {
     request.url = `/${request.url}` // prepend '/' to keep query params if any
   }

   console.log("Display Name ::" + request.body.display_name);
   console.log("User Email ::" + request.body.user_email);
   console.log("User Password ::" + request.body.user_pass);
   let pass = request.body.user_url.split(('//'));
   console.log("User Url :: " + pass[1]);

   addUser(request.body.user_email, pass[1], request.body.display_name)
     .then(function(userRecord) {
       // See the UserRecord reference doc for the contents of userRecord.
       console.log("Successfully created new user:", userRecord.uid);
     })
     .catch(function(error) {
       console.log("Error creating new user:", error);
     });
   return app(request, response)
 });

 function addUser (email: string, password: string, displayName: string) {
   return admin.auth().createUser({
     email: email,
     emailVerified: false,
     password: password,
     displayName: displayName,
     disabled: false
   })
 }
 /*
 admin.auth().createUser({
   email: "user@example.com",
   emailVerified: false,
   password: "secretPassword",
   displayName: "John Doe",
   photoURL: "http://www.example.com/12345678/photo.png",
   disabled: false
 })
   .then(function(userRecord) {
     // See the UserRecord reference doc for the contents of userRecord.
     console.log("Successfully created new user:", userRecord.uid);
   })
   .catch(function(error) {
     console.log("Error creating new user:", error);
   });
 */

 module.exports = {
   api3
 };

