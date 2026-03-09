'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecking, setAdminChecking] = useState(false);
  const [adminError, setAdminError] = useState('');

  const verifyAdmin = useCallback(async (u: User) => {
    setAdminChecking(true);
    setAdminError('');
    try {
      const token = await u.getIdToken();
      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        setAdminError('Akun Anda tidak terdaftar sebagai admin.');
        await firebaseSignOut(auth);
      }
    } catch {
      setIsAdmin(false);
      setAdminError('Gagal memverifikasi akses admin.');
      await firebaseSignOut(auth);
    } finally {
      setAdminChecking(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        verifyAdmin(u);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [verifyAdmin]);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  const signOut = () => firebaseSignOut(auth);

  return { user, loading, isAdmin, adminChecking, adminError, signInWithGoogle, signOut };
}
