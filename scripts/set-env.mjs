// Genera src/environments/environment.ts a partir de variables de entorno.
// Se usa en Vercel, porque environment.ts no se sube a GitHub.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const destino = 'src/environments/environment.ts';

// En la computadora local se usa el environment.ts que ya existe
if (!process.env.VERCEL && existsSync(destino)) {
  console.log('Usando src/environments/environment.ts local.');
  process.exit(0);
}

const variables = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
];

const faltantes = variables.filter((nombre) => !process.env[nombre]);
if (faltantes.length > 0) {
  console.error('Faltan variables de entorno: ' + faltantes.join(', '));
  process.exit(1);
}

const contenido = `export const environment = {
  firebaseConfig: {
    apiKey: '${process.env.FIREBASE_API_KEY}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
    projectId: '${process.env.FIREBASE_PROJECT_ID}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
    appId: '${process.env.FIREBASE_APP_ID}',
  },
};
`;

mkdirSync('src/environments', { recursive: true });
writeFileSync(destino, contenido);
console.log('environment.ts generado desde las variables de entorno.');