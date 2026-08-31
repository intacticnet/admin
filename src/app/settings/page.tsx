'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/PageHeader';
import { settings } from '@/lib/admin/api';
import type { SiteSetting } from '@/lib/admin/types';

interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
}

const settingFields: SettingField[] = [
  { key: 'company_name', label: 'Company Name', type: 'text', placeholder: 'e.g. Intactic' },
  { key: 'company_tagline', label: 'Company Tagline', type: 'text', placeholder: 'Your company tagline' },
  { key: 'company_email', label: 'Company Email', type: 'text', placeholder: 'contact@company.com' },
  { key: 'company_phone', label: 'Company Phone', type: 'text', placeholder: '+1 (555) 000-0000' },
  { key: 'company_address', label: 'Company Address', type: 'textarea', placeholder: 'Full company address' },
  { key: 'social_twitter', label: 'Twitter / X URL', type: 'text', placeholder: 'https://twitter.com/company' },
  { key: 'social_linkedin', label: 'LinkedIn URL', type: 'text', placeholder: 'https://linkedin.com/company/company' },
  { key: 'social_github', label: 'GitHub URL', type: 'text', placeholder: 'https://github.com/company' },
  { key: 'social_facebook', label: 'Facebook URL', type: 'text', placeholder: 'https://facebook.com/company' },
  { key: 'footer_copyright', label: 'Footer Copyright', type: 'text', placeholder: '© 2025 Company Name. All rights reserved.' },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ---- Load settings ----
  useEffect(() => {
    settings
      .getAll()
      .then((items: SiteSetting[]) => {
        const map: Record<string, string> = {};
        for (const item of items) {
          map[item.key] = item.value;
        }
        setValues(map);
        setOriginalValues(map);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      )
      .finally(() => setLoading(false));
  }, []);

  // ---- Update a single field ----
  const updateField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  // ---- Save only changed settings ----
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    const changedKeys = Object.keys(values).filter(
      (key) => values[key] !== (originalValues[key] ?? '')
    );

    try {
      await Promise.all(
        changedKeys.map((key) => settings.update(key, values[key]))
      );
      setOriginalValues({ ...values });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Site Settings" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Site Settings" />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">
          Settings saved successfully.
        </div>
      )}

      {/* ---- Company Info ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={values.company_name ?? ''}
                onChange={(e) => updateField('company_name', e.target.value)}
                placeholder={settingFields.find((f) => f.key === 'company_name')?.placeholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_tagline">Company Tagline</Label>
              <Input
                id="company_tagline"
                value={values.company_tagline ?? ''}
                onChange={(e) => updateField('company_tagline', e.target.value)}
                placeholder={settingFields.find((f) => f.key === 'company_tagline')?.placeholder}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_email">Company Email</Label>
              <Input
                id="company_email"
                type="email"
                value={values.company_email ?? ''}
                onChange={(e) => updateField('company_email', e.target.value)}
                placeholder={settingFields.find((f) => f.key === 'company_email')?.placeholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_phone">Company Phone</Label>
              <Input
                id="company_phone"
                value={values.company_phone ?? ''}
                onChange={(e) => updateField('company_phone', e.target.value)}
                placeholder={settingFields.find((f) => f.key === 'company_phone')?.placeholder}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_address">Company Address</Label>
            <Textarea
              id="company_address"
              value={values.company_address ?? ''}
              onChange={(e) => updateField('company_address', e.target.value)}
              placeholder={settingFields.find((f) => f.key === 'company_address')?.placeholder}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---- Social Media ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="social_twitter">Twitter / X</Label>
              <Input
                id="social_twitter"
                value={values.social_twitter ?? ''}
                onChange={(e) => updateField('social_twitter', e.target.value)}
                placeholder={settingFields.find((f) => f.key === 'social_twitter')?.placeholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_linkedin">LinkedIn</Label>
              <Input
                id="social_linkedin"
                value={values.social_linkedin ?? ''}
                onChange={(e) => updateField('social_linkedin', e.target.value)}
                placeholder={settingFields.find((f) => f.key === 'social_linkedin')?.placeholder}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="social_github">GitHub</Label>
              <Input
                id="social_github"
                value={values.social_github ?? ''}
                onChange={(e) => updateField('social_github', e.target.value)}
                placeholder={settingFields.find((f) => f.key === 'social_github')?.placeholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_facebook">Facebook</Label>
              <Input
                id="social_facebook"
                value={values.social_facebook ?? ''}
                onChange={(e) => updateField('social_facebook', e.target.value)}
                placeholder={settingFields.find((f) => f.key === 'social_facebook')?.placeholder}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Footer ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-lg">
            <Label htmlFor="footer_copyright">Footer Copyright Text</Label>
            <Input
              id="footer_copyright"
              value={values.footer_copyright ?? ''}
              onChange={(e) => updateField('footer_copyright', e.target.value)}
              placeholder={settingFields.find((f) => f.key === 'footer_copyright')?.placeholder}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---- Save ---- */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
