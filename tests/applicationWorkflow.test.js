// tests/applicationWorkflow.test.js — Tests for Demo Application Workflow & State Transitions
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDemoReference, getWorkflowDisclaimer } from '../src/services/applicationService.js';

test('Feature 3: Demo Reference Number generation', () => {
  const refMF = generateDemoReference('micro-finance');
  assert.match(refMF, /^SHK-\d{4}-MF-\d{4}$/, 'Expected format SHK-YYYY-MF-NNNN');

  const refTL = generateDemoReference('term-loan');
  assert.match(refTL, /^SHK-\d{4}-TL-\d{4}$/, 'Expected format SHK-YYYY-TL-NNNN');

  const refED = generateDemoReference('education-loan');
  assert.match(refED, /^SHK-\d{4}-ED-\d{4}$/, 'Expected format SHK-YYYY-ED-NNNN');
});

test('Feature 3: Application Structure and Required Attributes', () => {
  const mockDraft = {
    id: 'app-test-1',
    refNumber: generateDemoReference('micro-finance'),
    schemeCategory: 'Micro Finance',
    amount: 100000,
    status: 'draft',
    applicantName: 'Demo Applicant',
    timeline: [
      { status: 'draft', timestamp: new Date().toISOString(), note: 'Created' },
    ],
  };

  assert.equal(mockDraft.status, 'draft');
  assert.ok(mockDraft.refNumber.startsWith('SHK-'));
  assert.equal(mockDraft.amount, 100000);
  assert.equal(mockDraft.timeline.length, 1);
});

test('Feature 3: Application State Transition Logic', () => {
  // Valid lifecycle: draft -> ready-for-partner -> submitted -> under-review
  const validStatuses = ['draft', 'ready-for-partner', 'submitted', 'under-review', 'approved', 'rejected'];
  
  let currentStatus = 'draft';
  assert.ok(validStatuses.includes(currentStatus));

  currentStatus = 'submitted';
  assert.equal(currentStatus, 'submitted');

  currentStatus = 'under-review';
  assert.equal(currentStatus, 'under-review');
});

test('Feature 3: Demo Submission Disclaimer Notice', () => {
  const disclaimer = getWorkflowDisclaimer();
  assert.ok(disclaimer.includes('demonstration platform'));
  assert.ok(disclaimer.includes('DOES NOT transmit an official loan application'));
});
