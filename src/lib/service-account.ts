import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Storage } from '@google-cloud/storage';

export interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

let _cached: ServiceAccountCredentials | null = null;

export function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  if (_cached) return _cached;

  // Vercel: base64-encoded service account
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    try {
      _cached = JSON.parse(Buffer.from(base64, 'base64').toString());
      return _cached;
    } catch (e) {
      console.error('[service-account] Failed to parse GOOGLE_SERVICE_ACCOUNT_BASE64:', e);
    }
  }

  // Local: file-based service account
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    try {
      const fullPath = resolve(credPath);
      _cached = JSON.parse(readFileSync(fullPath, 'utf8'));
      return _cached;
    } catch (e) {
      console.error('[service-account] Failed to read credentials file:', e);
    }
  }

  return null;
}

let _storage: Storage | null = null;

// Bare `new Storage()` relies on Application Default Credentials — which on
// Vercel finds nothing (no metadata server, no GOOGLE_APPLICATION_CREDENTIALS
// file) and throws the moment a call is actually made. firebase-admin already
// avoids this via getServiceAccountCredentials(); GCS calls need the same.
export function getStorageClient(): Storage {
  if (_storage) return _storage;
  const creds = getServiceAccountCredentials();
  _storage = creds
    ? new Storage({ projectId: creds.project_id, credentials: creds })
    : new Storage();
  return _storage;
}
