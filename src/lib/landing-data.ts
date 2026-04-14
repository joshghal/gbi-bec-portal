import { getAdminFirestore } from '@/lib/firebase-admin';

export interface LandingData {
  updates: any[];
  updateSettings: { sectionEnabled: boolean };
  activities: any[];
  activitySettings: { sectionEnabled: boolean };
  announcement: any | null;
  formSettings: { disabledForms: string[] };
  coolGroups: any[];
  coolKabid: any | null;
}

const DEFAULTS: LandingData = {
  updates: [],
  updateSettings: { sectionEnabled: true },
  activities: [],
  activitySettings: { sectionEnabled: true },
  announcement: null,
  formSettings: { disabledForms: [] },
  coolGroups: [],
  coolKabid: null,
};

export async function getLandingData(): Promise<LandingData> {
  try {
    const db = getAdminFirestore();

    const [
      updatesSnap,
      updateSettingsDoc,
      activitiesSnap,
      activitySettingsDoc,
      announcementDoc,
      formSettingsDoc,
      coolGroupsSnap,
      coolKabidDoc,
    ] = await Promise.all([
      db.collection('updates').where('published', '==', true).orderBy('date', 'desc').limit(10).get(),
      db.doc('settings/kabar').get(),
      db.collection('activities').orderBy('order', 'asc').get(),
      db.doc('settings/kegiatan').get(),
      db.doc('settings/announcement').get(),
      db.collection('settings').doc('forms').get(),
      db.collection('cool_groups').orderBy('order', 'asc').get(),
      db.doc('settings/cool').get(),
    ]);

    const updates = updatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const updateSettings = {
      sectionEnabled: updateSettingsDoc.exists ? (updateSettingsDoc.data()?.sectionEnabled ?? true) : true,
    };
    const activities = activitiesSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((a: any) => a.enabled !== false);
    const activitySettings = {
      sectionEnabled: activitySettingsDoc.exists ? (activitySettingsDoc.data()?.sectionEnabled ?? true) : true,
    };
    const announcement = announcementDoc.exists ? announcementDoc.data() ?? null : null;
    const formSettings = formSettingsDoc.exists ? (formSettingsDoc.data() as { disabledForms: string[] }) : { disabledForms: [] };
    const coolGroups = coolGroupsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const coolKabid = coolKabidDoc.exists ? (coolKabidDoc.data()?.kabid ?? null) : null;

    return {
      updates,
      updateSettings,
      activities,
      activitySettings,
      announcement,
      formSettings,
      coolGroups,
      coolKabid,
    };
  } catch (error) {
    console.error('Failed to fetch landing data:', error);
    return DEFAULTS;
  }
}
