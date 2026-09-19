import type { Plugin } from "vite";

import { getEmbed } from "./discord-embed-def.ts";

// https://docs.discord.com/developers/link-previews/component-embeds
// https://github.com/discord/discord-api-docs/pull/8606

export function discordEmbed(): Plugin {
  let appUrlSet: string | undefined = undefined;

  return {
    name: "discord-embed",
    apply: "build",
    configResolved(config) {
      appUrlSet = config.env.VITE_APP_URL;
    },
    transformIndexHtml() {
      if (!appUrlSet) {
        return [];
      }

      return [
        {
          tag: "link",
          attrs: {
            rel: "discord:component-embed",
            type: "application/json",
            href: `${appUrlSet}/discord-embed.json`,
          },
        },
      ];
    },
    generateBundle() {
      if (!appUrlSet) {
        return;
      }

      this.emitFile({
        type: "asset",
        fileName: "discord-embed.json",
        source: JSON.stringify({ component: getEmbed(appUrlSet) }),
      });
    },
  };
}
