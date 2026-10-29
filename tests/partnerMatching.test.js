// tests/partnerMatching.test.js — Stage 3 Geo-Spatial Matching & Routing Automated Unit Tests
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateHaversineDistance,
  matchAndRankPartners,
  generatePartnerChecklist,
} from '../src/services/partnerMatchingService.js';
import { initialPartners } from '../src/data/partners.js';

test('Haversine Distance Calculator', async (t) => {
  await t.test('calculates correct distance between known coordinates', () => {
    // Pune (18.5204, 73.8567) to Mumbai (18.9220, 72.8347) is approx 120 km
    const dist = calculateHaversineDistance(18.5204, 73.8567, 18.922, 72.8347);
    assert.ok(dist >= 115 && dist <= 130, `Distance ${dist}km was outside expected range (115-130km)`);
  });

  await t.test('returns 0 when coordinates are identical', () => {
    const dist = calculateHaversineDistance(28.6139, 77.209, 28.6139, 77.209);
    assert.strictEqual(dist, 0);
  });

  await t.test('returns null when any coordinate is missing', () => {
    assert.strictEqual(calculateHaversineDistance(null, 77.209, 28.6139, 77.209), null);
    assert.strictEqual(calculateHaversineDistance(28.6139, undefined, 28.6139, 77.209), null);
  });
});

test('Eligibility-Aware Partner Matching', async (t) => {
  await t.test('filters partners strictly by supported loan category', () => {
    const matched = matchAndRankPartners(initialPartners, {
      category: 'education-loan',
    });

    assert.ok(matched.length > 0, 'Expected to find partners supporting education loan');
    for (const p of matched) {
      const supports = p.categories.some((c) =>
        c.toLowerCase().includes('education') || 'education-loan'.includes(c.toLowerCase())
      );
      assert.ok(
        supports,
        `Partner ${p.name} should support education loan but has: ${p.categories.join(', ')}`
      );
    }
  });

  await t.test('matches partner by state and district', () => {
    const matched = matchAndRankPartners(initialPartners, {
      state: 'Maharashtra',
      district: 'Pune',
    });

    assert.ok(matched.length > 0, 'Expected to find Maharashtra Pune partners');
    const hasPuneBranch = matched.some((p) => p.district.toLowerCase() === 'pune');
    assert.ok(hasPuneBranch, 'Expected at least one partner directly in Pune');
  });

  await t.test('filters by partner type (SCA, PSB, RRB, MFI)', () => {
    const scas = matchAndRankPartners(initialPartners, { partnerType: 'SCA' });
    assert.ok(scas.length > 0, 'Expected to find SCAs');
    assert.ok(scas.every((p) => p.type === 'SCA'), 'All results should be SCA type');

    const psbs = matchAndRankPartners(initialPartners, { partnerType: 'PSB' });
    assert.ok(psbs.length > 0, 'Expected to find PSBs');
    assert.ok(psbs.every((p) => p.type === 'PSB'), 'All results should be PSB type');
  });
});

test('Multi-Tier Ranking and Reasons', async (t) => {
  await t.test('ranks State Channelizing Agencies as apex priority for SC welfare credit', () => {
    const ranked = matchAndRankPartners(initialPartners, {
      state: 'Maharashtra',
    });

    const topRanked = ranked[0];
    assert.strictEqual(
      topRanked.type,
      'SCA',
      `Expected top ranked partner in Maharashtra to be an SCA, got: ${topRanked.type}`
    );
    assert.ok(
      topRanked.rankingReasons.some((r) => r.toLowerCase().includes('apex state channelizing')),
      'Expected ranking reason explaining Apex SCA mandate'
    );
  });

  await t.test('rewards proximity when user GPS coordinates are provided', () => {
    // User located near New Delhi Connaught Place
    const userLat = 28.6315;
    const userLng = 77.2167;

    const ranked = matchAndRankPartners(initialPartners, {
      userLat,
      userLng,
    });

    assert.ok(ranked[0].distanceKm !== null, 'Distance should be computed');
    // Closest partner should have lowest distance
    assert.ok(
      ranked[0].distanceKm < 30,
      `Closest partner should be within 30km, got ${ranked[0].distanceKm}km`
    );
  });

  await t.test('generates valid OpenStreetMap directions URLs for partners', () => {
    const matched = matchAndRankPartners(initialPartners, {});
    for (const p of matched) {
      assert.ok(p.navigationUrl, 'Partner must have a navigation URL');
      assert.ok(
        p.navigationUrl.startsWith('https://www.openstreetmap.org/'),
        `Navigation URL ${p.navigationUrl} must use legitimate OpenStreetMap link`
      );
    }
  });

  await t.test('unverified funding availability disclaimer is strictly maintained', () => {
    // Confirm sample partners do not claim fabricated funding
    const samplePartners = initialPartners.filter((p) => p.isSample);
    assert.ok(samplePartners.length > 0, 'Expected sample partners in registry');

    for (const sp of samplePartners) {
      assert.ok(
        sp.verificationStatus === 'sample' || sp.verificationStatus === 'unverified',
        'Sample partner must have sample/unverified status'
      );
      assert.ok(
        sp.isSample === true,
        'Sample partner must have isSample: true flag'
      );
    }
  });
});

test('Partner Document Preparation Checklist Generator', async (t) => {
  const mockPartner = initialPartners[0];

  await t.test('generates mandatory core certificates for micro-finance', () => {
    const checklist = generatePartnerChecklist(mockPartner, 'micro-finance');
    const docIds = checklist.map((d) => d.id);

    assert.ok(docIds.includes('caste'), 'Must include Caste Certificate');
    assert.ok(docIds.includes('income'), 'Must include Family Income Certificate');
    assert.ok(docIds.includes('residence'), 'Must include Domicile/Aadhaar');
    assert.ok(docIds.includes('bank-passbook'), 'Must include Bank Account Passbook');
  });

  await t.test('includes college admission letter & fee structure for education loans', () => {
    const checklist = generatePartnerChecklist(mockPartner, 'education-loan');
    const docIds = checklist.map((d) => d.id);

    assert.ok(docIds.includes('admission'), 'Must include Admission Letter for education loan');
    assert.ok(docIds.includes('fees'), 'Must include Fee Structure for education loan');
  });

  await t.test('includes detailed project report (DPR) for term loans', () => {
    const checklist = generatePartnerChecklist(mockPartner, 'term-loan');
    const docIds = checklist.map((d) => d.id);

    assert.ok(docIds.includes('dpr'), 'Must include Detailed Project Report (DPR) for term loans');
    assert.ok(docIds.includes('quotations'), 'Must include Machinery / Asset Quotations for term loans');
  });
});
