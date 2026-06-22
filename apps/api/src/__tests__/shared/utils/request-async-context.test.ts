import { requestAsyncContext } from '@/shared/utils/request-async-context';

describe('requestAsyncContext', () => {
  it('exposes store inside run callback', () => {
    requestAsyncContext.run({ requestId: 'req-123' }, () => {
      expect(requestAsyncContext.getStore()).toEqual({ requestId: 'req-123' });
    });
  });

  it('returns undefined outside run', () => {
    expect(requestAsyncContext.getStore()).toBeUndefined();
  });
});
