import { expect, test } from "vitest";
import { formatResolution, formatTime } from "./format";

// formatResolution
test("formatResolution 1080p", () => {
  expect(formatResolution(1920, 1080)).toBe("1920×1080 (16:9)");
});

const orderedCases: [string, number, number, string][] = [
  ["720p", 1280, 720, "1280×720 (16:9)"],
  ["1600×900 (HD+)", 1600, 900, "1600×900 (16:9)"],
  ["cinematic 1920×800", 1920, 800, "1920×800 (12:5)"],
  ["1080p", 1920, 1080, "1920×1080 (16:9)"],
  ["QHD 1440p", 2560, 1440, "2560×1440 (16:9)"],
  ["ultrawide 3440×1440", 3440, 1440, "3440×1440 (43:18)"],
  ["4K UHD", 3840, 2160, "3840×2160 (16:9)"],
  ["8K UHD", 7680, 4320, "7680×4320 (16:9)"],
];

orderedCases.forEach(([label, w, h, expected]) => {
  test(`formatResolution (ordered) ${label}`, () => {
    expect(formatResolution(w, h)).toBe(expected);
  });
});

test("formatResolution 4K UHD", () => {
  expect(formatResolution(3840, 2160)).toBe("3840×2160 (16:9)");
});

test("formatResolution QHD 1440p", () => {
  expect(formatResolution(2560, 1440)).toBe("2560×1440 (16:9)");
});

test("formatResolution 1600×900 (HD+)", () => {
  expect(formatResolution(1600, 900)).toBe("1600×900 (16:9)");
});

test("formatResolution 8K UHD", () => {
  expect(formatResolution(7680, 4320)).toBe("7680×4320 (16:9)");
});

test("formatResolution ultrawide 3440×1440", () => {
  expect(formatResolution(3440, 1440)).toBe("3440×1440 (43:18)");
});

test("formatResolution cinematic 1920×800", () => {
  expect(formatResolution(1920, 800)).toBe("1920×800 (12:5)");
});

test("formatResolution zero width returns Unknown", () => {
  expect(formatResolution(0, 1080)).toBe("Unknown");
});

test("formatResolution zero height returns Unknown", () => {
  expect(formatResolution(1920, 0)).toBe("Unknown");
});

test("formatResolution NaN returns Unknown", () => {
  expect(formatResolution(NaN, 1080)).toBe("Unknown");
  expect(formatResolution(1920, NaN)).toBe("Unknown");
});

// formatTime
test("formatTime H:MM:SS", () => {
  expect(formatTime(3880)).toBe("1:04:40");
});

test("formatTime MM:SS", () => {
  expect(formatTime(800)).toBe("13:20");
});

test("formatTime M:SS", () => {
  expect(formatTime(220)).toBe("3:40");
});

test("formatTime 0:0S", () => {
  expect(formatTime(8)).toBe("0:08");
});
