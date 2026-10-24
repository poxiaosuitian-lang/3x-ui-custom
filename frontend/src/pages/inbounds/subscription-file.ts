import { coerceInboundJsonField } from '@/models/dbinbound';

interface SubscriptionInbound {
  enable?: boolean;
  settings: unknown;
}

export function buildClashSubscriptionFile(
  inbounds: readonly SubscriptionInbound[],
  baseURI: string,
  remark = 'inbounds',
) {
  const base = new URL(baseURI);
  if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password) {
    throw new Error('Invalid subscription URL');
  }
  base.hash = '';
  const links = new Set<string>();
  for (const inbound of inbounds) {
    if (inbound.enable === false) continue;
    const settings = coerceInboundJsonField(inbound.settings) as {
      clients?: { subId?: string; enable?: boolean }[];
    };
    for (const client of settings.clients || []) {
      if (client.enable === false || !client.subId?.trim()) continue;
      const url = new URL(base);
      url.pathname = `${base.pathname.replace(/\/$/, '')}/${encodeURIComponent(client.subId)}`;
      links.add(url.href);
    }
  }
  const name = remark
    // eslint-disable-next-line no-control-regex -- Strip unsafe filename control characters.
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/[. ]+$/g, '')
    .slice(0, 80);
  return {
    filename: `${name || 'inbounds'}-clash-subscriptions.txt`,
    content: links.size ? [...links].join('\r\n') + '\r\n' : '',
    count: links.size,
  };
}
