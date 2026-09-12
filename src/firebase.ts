import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Values below are pre-filled from the tourneyboss-bd Firebase project where
// known. apiKey is reused from the Android app's config as a starting point —
// if Google Sign-In fails with an API-key-not-valid-for-this-app error, go to
// Firebase Console → Project settings → General → Your apps → add a Web app
// (</>) and replace apiKey/appId below with the values shown there.
const firebaseConfig = {
  apiKey: 'AIzaSyCKsuoyoqDoG3jtmgdXICqW93dSaCfx76Y',
  authDomain: 'tourneyboss-bd.firebaseapp.com',
  projectId: 'tourneyboss-bd',
  storageBucket: 'tourneyboss-bd.firebasestorage.app',
  messagingSenderId: '1037919540500',
  appId: 'REPLACE_WITH_WEB_APP_ID', // e.g. 1:1037919540500:web:xxxxxxxxxxxx
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
