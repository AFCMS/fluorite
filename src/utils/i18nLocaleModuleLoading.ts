import { i18n } from "@lingui/core";

export async function dynamicActivate(locale: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { messages } = await import(`./../locales/${locale}.po`);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  i18n.load(locale, messages);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  i18n.activate(locale);
}
