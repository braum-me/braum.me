import { env } from "./env.ts";

export interface Contact {
  name: string;
  email: string;
  emailConsulting: string;
  org: string;
  title: string;
  url: string;
  urlConsulting: string;
  urlAboutexport: string;
  urlLinkedin: string;
  urlGithub: string;
}

export function getContact(): Contact {
  return {
    name: env("CONTACT_NAME") ?? "",
    email: env("CONTACT_EMAIL") ?? "",
    emailConsulting: env("CONTACT_EMAIL_CONSULTING") ?? "",
    org: env("CONTACT_ORG") ?? "",
    title: env("CONTACT_TITLE") ?? "",
    url: env("CONTACT_URL") ?? "",
    urlConsulting: env("CONTACT_URL_CONSULTING") ?? "",
    urlAboutexport: env("CONTACT_URL_ABOUTEXPORT") ?? "",
    urlLinkedin: env("CONTACT_URL_LINKEDIN") ?? "",
    urlGithub: env("CONTACT_URL_GITHUB") ?? "",
  };
}
