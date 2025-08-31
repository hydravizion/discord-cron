import fetch from "node-fetch";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL_CD as string;
if (!DISCORD_WEBHOOK_URL) {
  throw new Error("Missing DISCORD_WEBHOOK_URL_CD");
}

const mentionEnv = process.env.DISCORD_MENTIONS_CD || "";
const mentions = mentionEnv
  .split(",")
  .map((id) => id.trim())
  .filter((id) => id.length > 0);

const mentionStrings =
  mentions.length > 0
    ? mentions.map((id) => {
        if (id.startsWith("&")) return `<@${id}>`;
        return `<@${id}>`;
      })
    : ["@everyone"];

function getCountdownMessage() {
  const targetDate = new Date("2025-10-24T00:00:00+08:00");
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return (
    `🇯🇵✨ **Japan Trip Countdown!** ✨🇯🇵\n\n` +
    `⏳ Only **${days} days** left until our adventure begins! 🛫🌏\n\n` +
    `🎒 Pack your bags, get your cameras ready 📸, and let’s make memories!\n\n` +
    `${mentionStrings.join(" ")}`
  );
}

async function sendMessage() {
  const message = getCountdownMessage();

  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: message,
    }),
  });

  console.log("Message sent:", message);
}

sendMessage().catch(console.error);
