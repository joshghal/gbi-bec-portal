import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFileSync } from 'fs';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
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
