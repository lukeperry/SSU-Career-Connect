const admin = require('firebase-admin');
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

let db; // Will hold Firestore instance

// Initialize Firebase Admin
async function initializeFirebaseAdmin() {
  try {
    const keyVaultName = process.env.KEY_VAULT_NAME;
    const secretName = process.env.FIREBASE_SERVICE_ACCOUNT_SECRET_NAME;
    const url = `https://${keyVaultName}.vault.azure.net/`;
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(url, credential);

    const secret = await client.getSecret(secretName);
    const serviceAccount = JSON.parse(secret.value);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://ssu-career-connect.firebaseio.com",
    });

    db = admin.firestore(); // Initialize Firestore instance
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    process.exit(1); // Exit process on failure
  }
}

module.exports = { admin, initializeFirebaseAdmin, getDb: () => db };
