import { CookieOptions, Request, Response } from 'express';

export type TSetCookie = {
  cookieName: string;
  cookieValue: string;
  cookieOptions?: CookieOptions;
};

const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 1000 * 60 * 60 * 24,
  domain: process.env.FRONTEND_DOMAIN || undefined,
};

export const setCookies = (res: Response, cookies: TSetCookie[]) => {
  cookies.forEach((cookie) => {
    const { cookieName, cookieValue, cookieOptions } = cookie;

    res.cookie(cookieName, cookieValue, {
      ...defaultCookieOptions,
      ...cookieOptions,
    });
  });
};

export const extractCookie = (
  req: Request,
  cookieName: string,
): string | null => {
  return req.cookies?.[cookieName] || null;
};
