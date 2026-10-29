import test from 'node:test';
import assert from 'node:assert/strict';
import { schemeAnnouncements } from '../src/data/announcements.js';
import { translations } from '../src/i18n/translations.js';

test('Notifications: Announcements dataset has required fields and active alerts', () => {
  assert.ok(Array.isArray(schemeAnnouncements), 'schemeAnnouncements should be an array');
  assert.ok(schemeAnnouncements.length >= 2, 'Should contain active scheme announcements');

  for (const ann of schemeAnnouncements) {
    assert.ok(ann.id, 'Announcement must have an id');
    assert.ok(ann.title, 'Announcement must have a title');
    assert.ok(ann.date, 'Announcement must have a date');
    assert.ok(ann.shortText, 'Announcement must have shortText');
    assert.ok(ann.badge, 'Announcement must have a badge');
  }
});

test('Translations: Announcements and notifications strings are complete across languages', () => {
  const langs = ['en', 'hi', 'mr'];
  for (const lang of langs) {
    const t = translations[lang]?.announcements;
    assert.ok(t, `Translations for announcements must exist in ${lang}`);
    assert.ok(t.notificationsTitle, `notificationsTitle must be present in ${lang}`);
    assert.ok(t.markAllRead, `markAllRead must be present in ${lang}`);
    assert.ok(t.newNotifications, `newNotifications must be present in ${lang}`);
    assert.ok(t.allUpdates, `allUpdates must be present in ${lang}`);
  }
});

