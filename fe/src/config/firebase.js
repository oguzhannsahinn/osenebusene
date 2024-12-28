import { initializeApp } from 'firebase/app';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBw5Vc0iMXfzvmNaTjv-aw4lQLSGVGddRg",
  authDomain: "buseneosene-a57d8.firebaseapp.com",
  projectId: "buseneosene-a57d8",
  storageBucket: "buseneosene-a57d8.appspot.com",
  messagingSenderId: "195438545",
  appId: "1:195438545:web:8ed7b6615dabc8ecbee2f0",
  measurementId: "G-YYD0PXVZ1B"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Development ortamında CORS hatalarını önlemek için
if (process.env.NODE_ENV === 'development') {
  connectStorageEmulator(storage, 'localhost', 9199);
}

export { storage }; 