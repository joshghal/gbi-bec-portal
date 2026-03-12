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
import { hasPermission as checkPermission } from '@/lib/permissions';

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecking, setAdminChecking] = useState(false);
  const [adminError, setAdminError] = useState('');

  const [role, setRole] = useState<string>('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const verifyAdmin = useCallback(async (u: User) => {
    setAdminChecking(true);
    setAdminError('');
    try {
      const token = await u.getIdToken();
      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(true);
        setRole(data.role || '');
        setPermissions(data.permissions || []);
        setIsSuperAdmin(data.isSuperAdmin || false);
      } else {
        setIsAdmin(false);
        setRole('');
        setPermissions([]);
        setIsSuperAdmin(false);
        setAdminError('Akun Anda tidak terdaftar sebagai admin.');
        await firebaseSignOut(auth);
      }
    } catch {
      setIsAdmin(false);
      setRole('');
      setPermissions([]);
      setIsSuperAdmin(false);
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
        setRole('');
        setPermissions([]);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [verifyAdmin]);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  const signOut = () => firebaseSignOut(auth);

  const hasPermission = useCallback(
    (required: string) => checkPermission(permissions, required),
    [permissions],
  );

  const refreshPermissions = useCallback(async () => {
    if (user) await verifyAdmin(user);
  }, [user, verifyAdmin]);

  return {
    user,
    loading,
    isAdmin,
    adminChecking,
    adminError,
    role,
    permissions,
    isSuperAdmin,
    hasPermission,
    refreshPermissions,
    signInWithGoogle,
    signOut,
  };
}
