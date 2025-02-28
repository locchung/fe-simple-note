// src/app/helpers/cookie.ts
interface CookieOptions {
  path?: string;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
  if (typeof window === 'undefined') return;

  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options.path) cookie += `;path=${options.path}`;
  if (options.maxAge) cookie += `;max-age=${options.maxAge}`;
  if (options.secure) cookie += ';secure';
  if (options.sameSite) cookie += `;samesite=${options.sameSite}`;

  document.cookie = cookie;
};

export const removeCookie = (name: string) => {
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};
