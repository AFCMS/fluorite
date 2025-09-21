import { i18n, type Messages } from "@lingui/core";

export async function dynamicActivate(locale: string) {
  const { messages } = (await import(`./../locales/${locale}/messages.po`)) as {
    messages: Messages;
  };

  i18n.load(locale, messages);
  i18n.activate(locale);
}
