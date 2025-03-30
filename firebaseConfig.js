import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

const firebaseConfig = {
    apiKey: enter_firebase_key,
    authDomain: enter_auth_domain,
    projectId: enter_projectId,
    storageBucket: enter_storageBucket,
    messagingSenderId: enter_SenderId,
    appId: enter_appId,
    measurementId: enter_measurementId
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();
export default { firebase, firestore, auth };
