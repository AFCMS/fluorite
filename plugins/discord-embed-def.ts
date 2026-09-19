import {
  type APIContainerComponent,
  ComponentType,
  ButtonStyle,
  SeparatorSpacingSize,
} from "discord-api-types/v10";

export const emojiIds = {
  github: "1550543636557729823",
  steam: "1550541784260681729",
  youtube: "1550544833150586920",
} as const satisfies Record<string, string>;

const mainText = `## Fluorite
An elegant, offline‑first PWA video player for your local media.`;

export function getEmbed(appUrl: string) {
  return {
    type: ComponentType.Container,
    components: [
      {
        type: ComponentType.Section,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: mainText,
          },
        ],
        accessory: {
          type: ComponentType.Button,
          label: "Open",
          url: appUrl,
          style: ButtonStyle.Link,
        },
      },
      {
        type: ComponentType.MediaGallery,
        items: [
          {
            media: {
              url: `${appUrl}/fluorite_empty.png`,
            },
            description: "Fluorite - No video loaded",
          },
        ],
      },
      {
        type: ComponentType.Separator,
        divider: true,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: "GitHub",
            emoji: {
              id: emojiIds.github,
              name: "github",
            },
            url: "https://github.com/AFCMS/fluorite",
            style: ButtonStyle.Link,
          },
          {
            type: ComponentType.Button,
            label: "More projects",
            emoji: {
              name: "🌐",
            },
            url: "https://afcms.dev",
            style: ButtonStyle.Link,
          },
        ],
      },
    ],
  } as const satisfies APIContainerComponent;
}
