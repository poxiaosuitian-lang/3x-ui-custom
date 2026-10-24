import { describe, expect, it } from 'vitest';
import { buildRowActionsMenu } from '@/pages/inbounds/list/RowActions';
import type { DBInboundRecord } from '@/pages/inbounds/list/types';

const record: DBInboundRecord = {
  id: 1,
  enable: true,
  remark: 'test',
  subSortIndex: 0,
  port: 8443,
  protocol: 'vless',
  up: 0,
  down: 0,
  total: 0,
  expiryTime: 0,
  _expiryTime: null,
  settings: {},
  streamSettings: {},
};
const t = (key: string) => key;

describe('subscription download action', () => {
  it.each([false, true])('is available on desktop/mobile (%s)', (isMobile) => {
    const items = buildRowActionsMenu({ record, subEnable: true, hasClients: true, t, isMobile });
    const item = items?.find((entry) => entry && 'key' in entry && entry.key === 'downloadSubs');
    expect(item).toMatchObject({ key: 'downloadSubs', disabled: false });
  });

  it('is hidden when subscriptions are disabled', () => {
    const items = buildRowActionsMenu({ record, subEnable: false, hasClients: true, t });
    expect(items?.some((entry) => entry && 'key' in entry && entry.key === 'downloadSubs')).toBe(
      false,
    );
  });

  it('is disabled for an empty inbound', () => {
    const items = buildRowActionsMenu({ record, subEnable: true, hasClients: false, t });
    expect(
      items?.find((entry) => entry && 'key' in entry && entry.key === 'downloadSubs'),
    ).toMatchObject({ disabled: true });
  });
});
