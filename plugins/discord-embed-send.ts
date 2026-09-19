/// <reference types="@types/node" />

import { getEmbed } from "./discord-embed-def.ts";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
  throw new Error(
    "DISCORD_WEBHOOK_URL is not defined in the environment variables.",
  );
}

async function sendEmbed() {
  const response = await fetch(`${webhookUrl}?with_components=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      flags: 32768, // MessageFlags.IsComponentsV2
      components: [getEmbed("https://fluorite.afcms.dev")],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to send embed: ${response.status} ${response.statusText}`,
    );
  }
}

sendEmbed().catch((error) => {
  console.error("Error sending embed:", error);
});
