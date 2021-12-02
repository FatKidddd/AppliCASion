const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.createUser = functions.auth.user().onCreate(async (user) => {
    const userCollection = admin.firestore().collection('users');
    const url = user.photoURL ? user.photoURL: null;
    userCollection.doc(user.uid).set({
        displayName: user.displayName,
        profilePicture: url,
        dateCreated: Date.now()
    });
});