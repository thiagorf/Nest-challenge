import { CheckAuthCookieMiddleware } from './check-auth-cookie.middleware';

describe('CheckAuthCookieMiddleware', () => {
  it('should be defined', () => {
    expect(new CheckAuthCookieMiddleware(null)).toBeDefined();
  });
});
