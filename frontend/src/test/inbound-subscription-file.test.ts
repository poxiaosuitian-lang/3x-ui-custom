import { describe, expect, it } from 'vitest';
import { buildClashSubscriptionFile } from '@/pages/inbounds/subscription-file';

describe('Clash subscription text export', () => {
  const base = 'https://panel.example.test:2096/random-clash/';

  it('exports importable subscription URLs, not node URLs, with CRLF and a .txt extension', () => {
    const file = buildClashSubscriptionFile(
      [{ enable: true, settings: { clients: [{ subId: 'abc123', enable: true }] } }],
      base,
      '我的入站',
    );
    expect(file).toEqual({
      filename: '我的入站-clash-subscriptions.txt',
      content: `${base}abc123\r\n`,
      count: 1,
    });
  });

  it('deduplicates shared subscriptions and skips disabled clients and inbounds', () => {
    const file = buildClashSubscriptionFile(
      [
        {
          settings: JSON.stringify({
            clients: [{ subId: 'same' }, { subId: 'off', enable: false }],
          }),
        },
        { settings: { clients: [{ subId: 'same' }, { subId: 'other' }, { subId: '' }, {}] } },
        { enable: false, settings: { clients: [{ subId: 'disabled-inbound' }] } },
      ],
      base,
    );
    expect(file.count).toBe(2);
    expect(file.content).toBe(`${base}same\r\n${base}other\r\n`);
  });

  it('returns no file content for empty or slim inbound data', () => {
    expect(buildClashSubscriptionFile([{ settings: '' }, { settings: {} }], base).content).toBe('');
    expect(buildClashSubscriptionFile([], base).count).toBe(0);
  });

  it('encodes subscription IDs and normalizes the path without leaking credentials', () => {
    const file = buildClashSubscriptionFile(
      [{ settings: { clients: [{ subId: 'a/b?c\nd' }] } }],
      base.slice(0, -1),
      '../unsafe:name',
    );
    expect(file.content).toBe(`${base}a%2Fb%3Fc%0Ad\r\n`);
    expect(file.filename).not.toMatch(/[/\\:]/);
    expect(() => buildClashSubscriptionFile([], 'javascript:alert(1)')).toThrow();
    expect(() => buildClashSubscriptionFile([], 'https://user:password@example.test/')).toThrow();
  });
});
