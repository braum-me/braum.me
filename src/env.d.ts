/// <reference types="astro/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    CONTACT_NAME: string;
    CONTACT_EMAIL: string;
    CONTACT_EMAIL_CONSULTING: string;
    CONTACT_ORG: string;
    CONTACT_TITLE: string;
    CONTACT_URL: string;
    CONTACT_URL_CONSULTING: string;
    CONTACT_URL_ABOUTEXPORT: string;
    CONTACT_URL_LINKEDIN: string;
    CONTACT_URL_GITHUB: string;
    CAPTCHA_SECRET?: string;
    UMAMI_SCRIPT_URL?: string;
    UMAMI_WEBSITE_ID?: string;
    RATE_LIMIT_MAX?: string;
    RATE_LIMIT_WINDOW_MS?: string;
    NODE_ENV?: "development" | "production";
  }
}
