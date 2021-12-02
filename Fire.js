global.addEventListener = x => x; // This one line caused me 10 hours worth of pain.

import firebase from 'firebase';
import 'firebase/firestore';
import { decode, encode } from 'base-64'

if (!global.btoa) { global.btoa = encode }
if (!global.atob) { global.atob = decode }

const firebaseConfig = {
    apiKey: "AIzaSyAGGXoHghkAjMeHY-oRub-hXHmnO0KlOpw",
    authDomain: "amazingapp-8e3b3.firebaseapp.com",
    databaseURL: "https://amazingapp-8e3b3.firebaseio.com",
    projectId: "amazingapp-8e3b3",
    storageBucket: "amazingapp-8e3b3.appspot.com",
    messagingSenderId: "651709745555",
    appId: "1:651709745555:web:754b036fa8c227bdc3c066"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export default db;