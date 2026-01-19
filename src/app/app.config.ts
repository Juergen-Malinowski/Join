import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

/**
 * Angular Application Configuration
 *
 * Central configuration for the entire Angular application. Initializes Firebase backend,
 * configures routing, and sets up change detection strategy. This config is passed to the
 * bootstrapApplication() function during application startup.
 *
 * Configuration Includes:
 * - Firebase initialization with project credentials
 * - Authentication (Auth) provider
 * - Firestore database provider
 * - Application routing with lazy-loaded routes
 * - Global error listening for unhandled errors
 * - Zoneless change detection for optimal performance
 *
 * Firebase Project: join-db-ee5a8
 *
 * @constant
 * @type {ApplicationConfig}
 *
 * @example
 * // Used in main.ts
 * bootstrapApplication(App, appConfig)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'join-65e6f',
        appId: '1:755605838267:web:1e018d7f06b05fa6cd0c9e',
        storageBucket: 'join-65e6f.firebasestorage.app',
        apiKey: 'AIzaSyDbEI1gthJrQhF-Dtn-4mTXpTVp-3NHnxY',
        authDomain: 'join-65e6f.firebaseapp.com',
        messagingSenderId: '755605838267',
      }),
    ),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
};
