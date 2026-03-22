import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  formatCurrencyValue,
  getLocaleDirection,
  getLocaleFallbackChain,
  negotiateLocale,
  normalizeLocale,
  parseAcceptLanguageHeader,
} from '../../shared/localization.js';

test('supported locales and default locale are configured', () => {
  assert.equal(DEFAULT_LOCALE, 'en-US');
  assert.deepEqual(SUPPORTED_LOCALES, ['en-US']);
});

test('normalizes direct locales and language-only values', () => {
  assert.equal(normalizeLocale('fr-CA'), null);
  assert.equal(normalizeLocale('fr'), null);
  assert.equal(normalizeLocale('en-GB'), 'en-US');
  assert.equal(normalizeLocale('es-MX'), null);
});

test('parses accept-language in quality order', () => {
  assert.deepEqual(
    parseAcceptLanguageHeader('fr-CA,fr;q=0.9,en;q=0.8'),
    ['fr-CA', 'fr', 'en']
  );
});

test('negotiates locale from accept-language and browser preference arrays', () => {
  assert.equal(
    negotiateLocale('fr-CA,fr;q=0.9,en;q=0.8', SUPPORTED_LOCALES, DEFAULT_LOCALE),
    'en-US'
  );

  assert.equal(
    negotiateLocale(['en-GB', 'fr-CA'], SUPPORTED_LOCALES, DEFAULT_LOCALE),
    'en-US'
  );
});

test('fallback chain always resolves to a supported locale', () => {
  assert.deepEqual(getLocaleFallbackChain('fr-FR'), ['en-US']);
  assert.deepEqual(getLocaleFallbackChain('fr-CA'), ['en-US']);
});

test('locale formatting is stable for supported currencies and directions', () => {
  assert.equal(formatCurrencyValue(123.45, 'en-US', 'USD'), '$123.45');
  assert.equal(getLocaleDirection('ar'), 'rtl');
  assert.equal(getLocaleDirection('en-US'), 'ltr');
});
