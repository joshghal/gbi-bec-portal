import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFileSync } from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyDJdbrKdYgJDN01mrSwmcEFvZe1vSD0GLE",
  authDomain: "baranangsiang-evening-chur.firebaseapp.com",
  projectId: "baranangsiang-evening-chur",
  storageBucket: "baranangsiang-evening-chur.firebasestorage.app",
  messagingSenderId: "100937908314",
  appId: "1:100937908314:web:2e40cde32baf5537e6d863",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function upload() {
  const filePath = '/Users/joshuagalilea/Downloads/KOM-200-Pelayan-Tuhan.pdf';
  const fileBuffer = readFileSync(filePath);

  const storageRef = ref(storage, 'kom/KOM-200-Pelayan-Tuhan.pdf');

  console.log('Uploading KOM-200-Pelayan-Tuhan.pdf to Firebase Storage...');
  const snapshot = await uploadBytes(storageRef, fileBuffer, {
    contentType: 'application/pdf',
    customMetadata: {
      title: 'KOM 200 Pelayan Tuhan',
      source: 'gbi-rayon-7',
      pages: '212',
    },
  });

  const downloadURL = await getDownloadURL(snapshot.ref);
  console.log('Upload complete!');
  console.log('Path:', snapshot.ref.fullPath);
  console.log('Download URL:', downloadURL);
}

upload().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
