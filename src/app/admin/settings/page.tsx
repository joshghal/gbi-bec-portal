'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FORM_CONFIGS, FORM_TYPE_LABELS } from '@/lib/form-config';

interface FormSettings {
  disabledForms?: string[];
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<FormSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/forms/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleForm = (formType: string, enabled: boolean) => {
    setSettings(prev => {
      const disabled = new Set(prev.disabledForms || []);
      if (enabled) {
        disabled.delete(formType);
      } else {
        disabled.add(formType);
      }
      return { ...prev, disabledForms: Array.from(disabled) };
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/forms/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save');
      setDirty(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const isFormEnabled = (formType: string) => {
    return !(settings.disabledForms || []).includes(formType);
  };

  return (
    <div className="min-h-0 flex-1">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">Pengaturan Formulir</h1>
            <p className="text-xs text-muted-foreground">
              Aktifkan atau nonaktifkan formulir pendaftaran
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Save className="w-4 h-4 mr-1.5" />
            )}
            Simpan
          </Button>
        </div>
      </header>

      <main className="p-6 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Memuat pengaturan...
          </div>
        ) : (
          <div className="space-y-3">
            {FORM_CONFIGS.filter(c => !c.externalUrl).map(config => {
              const enabled = isFormEnabled(config.type);
              return (
                <Card key={config.type}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        {FORM_TYPE_LABELS[config.type] || config.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked: boolean) => toggleForm(config.type, checked)}
                    />
                  </CardContent>
                </Card>
              );
            })}
            {FORM_CONFIGS.filter(c => c.externalUrl).map(config => (
              <Card key={config.type} className="opacity-70">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {FORM_TYPE_LABELS[config.type] || config.title}
                    </Label>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Formulir eksternal
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Selalu aktif</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
