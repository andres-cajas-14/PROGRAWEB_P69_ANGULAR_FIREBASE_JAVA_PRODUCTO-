import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../environments/environment';

// 1. Inicializa Firebase con los datos del proyecto
const app = initializeApp(environment.firebaseConfig);

// 2. Obtiene la instancia de Cloud Firestore y la exporta
export const db = getFirestore(app);