import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const aboutCssPath = path.resolve('src/pages/About/About.css');
const announcementBarCssPath = path.resolve('src/components/layout/AnnouncementBar.css');
const announcementModalCssPath = path.resolve('src/components/layout/AnnouncementModal.css');
const indexCssPath = path.resolve('src/index.css');

test('Dark Mode Contrast: About.css does not use inverted gray tokens as card backgrounds', () => {
  const css = fs.readFileSync(aboutCssPath, 'utf8');

  // Must not set dark background to --color-gray-800 which resolves to #f1f5f9 (white)
  assert.strictEqual(
    css.includes('background: var(--color-gray-800);'),
    false,
    'About.css must not use var(--color-gray-800) as background in dark mode'
  );

  // Must not set dark mode descriptions to var(--color-gray-300) which resolves to #2c4068 (dark navy on dark bg)
  assert.strictEqual(
    css.includes('color: var(--color-gray-300);'),
    false,
    'About.css must not use var(--color-gray-300) for descriptions in dark mode'
  );
});

test('Dark Mode Contrast: About.css defines high-contrast dark surfaces and readable typography', () => {
  const css = fs.readFileSync(aboutCssPath, 'utf8');

  // Verify dark cards use dark surface (#0f1c34)
  assert.ok(
    css.includes('[data-theme="dark"] .about-section-card') && css.includes('#0f1c34'),
    'About section cards must use dark navy (#0f1c34) in dark mode'
  );

  // Verify dark headings use crisp off-white (#f8fafc)
  assert.ok(
    css.includes('[data-theme="dark"] .about-hero-title') && css.includes('#f8fafc'),
    'Headings must be high-contrast #f8fafc in dark mode'
  );

  // Verify body text uses readable light slate (#cbd5e1)
  assert.ok(
    css.includes('[data-theme="dark"] .about-hero-subtitle') && css.includes('#cbd5e1'),
    'Hero subtitle and body text must be high-contrast #cbd5e1 in dark mode'
  );

  // Verify team card has dark surface and high-contrast accents
  assert.ok(
    css.includes('[data-theme="dark"] .about-team-card') &&
    css.includes('[data-theme="dark"] .about-team-subtitle') &&
    css.includes('[data-theme="dark"] .about-team-event'),
    'Team card must define dark surface and distinct readable subtitle/event colors'
  );

  // Verify disclaimer card has proper dark theme styling
  assert.ok(
    css.includes('[data-theme="dark"] .about-disclaimer-card') &&
    css.includes('[data-theme="dark"] .about-disclaimer-title') &&
    css.includes('[data-theme="dark"] .about-disclaimer-desc'),
    'Disclaimer card must define dedicated dark mode styling'
  );
});

test('Dark Mode Contrast: Announcement ticker and modal have dark mode support', () => {
  const barCss = fs.readFileSync(announcementBarCssPath, 'utf8');
  assert.ok(
    barCss.includes('[data-theme="dark"] .ann-ticker-empty'),
    'AnnouncementBar must provide dark mode style for empty ticker'
  );

  const modalCss = fs.readFileSync(announcementModalCssPath, 'utf8');
  assert.ok(
    modalCss.includes('[data-theme="dark"] .ann-scheme-name-tag') &&
    modalCss.includes('[data-theme="dark"] .ann-metric-label'),
    'AnnouncementModal must provide dark mode styles for tags and labels'
  );
});

test('Dark Mode Contrast: index.css includes about cards in global dark card styling', () => {
  const indexCss = fs.readFileSync(indexCssPath, 'utf8');
  assert.ok(
    indexCss.includes('.about-section-card') &&
    indexCss.includes('.about-feature-card') &&
    indexCss.includes('.about-team-card'),
    'Global dark card rules in index.css should include about cards'
  );
});

