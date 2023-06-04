import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceKeyPath = path.resolve(__dirname, 'keys/serviceKey.json');
const serviceAccount = require(serviceKeyPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Your Firebase configuration
  });
}

const firestore = admin.firestore();

export { firestore };
export default admin;
