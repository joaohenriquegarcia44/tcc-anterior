const fs = require('fs');
const path = require('path');

const envVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'EXPO_PUBLIC_API_URL',
];

let envContent = '';

for (const key of envVars) {
  const value = process.env[key];
  if (value) {
    envContent += `${key}=${value}\n`;
  }
}

if (envContent) {
  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);
  console.log('.env file generated successfully with:', Object.keys(process.env).filter(k => envVars.includes(k)).join(', '));
} else {
  console.log('No env vars found, skipping .env generation');
}
