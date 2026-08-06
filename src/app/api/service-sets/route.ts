import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';
import { getFixedConfig, fixedSlidesToItems } from '@/lib/service-slides/server';
import type { ServiceItem, ServiceSet } from '@/lib/service-slides/types';

// GET /api/service-sets — auth, all weekly sets (newest first)
export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('service_sets').orderBy('createdAt', 'desc').get();
    const sets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ServiceSet);
    return NextResponse.json(sets);
  } catch (error) {
    console.error('Get service sets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/service-sets — auth, create a set.
// Body: { title, serviceDate?, duplicateFrom? }
//   - duplicateFrom: copy items from an existing set (fresh item keys)
//   - otherwise: seed with the 5 fixed-slide templates
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Judul set wajib diisi' }, { status: 400 });
    }

    const db = getAdminFirestore();
    let items: ServiceItem[];

    if (body.duplicateFrom) {
      const src = await db.collection('service_sets').doc(body.duplicateFrom).get();
      const srcItems = (src.data()?.items || []) as ServiceItem[];
      // Fresh keys so dnd/react keys stay unique and independent of the source.
      items = srcItems.map((it) => ({ ...it, key: crypto.randomUUID() }));
    } else {
      const cfg = await getFixedConfig();
      items = fixedSlidesToItems(cfg.slides);
    }

    const now = new Date().toISOString();
    const doc = {
      title,
      serviceDate: (body.serviceDate || '').toString(),
      items,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection('service_sets').add(doc);
    logAdminAction(request, 'create', 'ibadah-set', { resourceId: ref.id, resourceTitle: title });
    return NextResponse.json({ id: ref.id, ...doc }, { status: 201 });
  } catch (error) {
    console.error('Create service set error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
