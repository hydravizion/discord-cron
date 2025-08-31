import axios from "axios";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL_CUR as string;
const baseUrl = "https://free.ratesdb.com/v1/rates?from=MYR";

interface Rates {
  [key: string]: number;
}

interface RatesResponse {
  data: {
    rates: Rates;
    date: string;
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

async function getRates(
  date?: string
): Promise<{ rates: Rates; date: string }> {
  const url = date ? `${baseUrl}&date=${date}` : baseUrl;
  const res = await axios.get<string>(url, { responseType: "text" });

  const json = JSON.parse(res.data) as RatesResponse;
  return {
    rates: json.data.rates,
    date: json.data.date, // API's reported date
  };
}

function formatRate(today?: number, yesterday?: number): string {
  if (today == null || yesterday == null) return "N/A";

  const diff = today - yesterday;
  const emoji = diff < 0 ? "🟢" : diff > 0 ? "🔴" : "⚪";
  return `${today.toFixed(3)} (${emoji} ${diff.toFixed(3)})`;
}

async function postExchangeRate(): Promise<void> {
  try {
    // 1. Get latest available rates (no date param)
    const latestData = await getRates();
    const todayRates = latestData.rates;
    const todayStr = latestData.date;

    console.log(
      `📅 Latest available rates date: ${todayStr}`,
      JSON.stringify(latestData)
    );

    // 2. Calculate yesterday from API's date
    const yesterdayDate = new Date(todayStr);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatDate(yesterdayDate);

    // 3. Fetch yesterday's rates
    const yesterdayData = await getRates(yesterdayStr);
    const yesterdayRates = yesterdayData.rates;

    console.log(
      `📅 Yesterday's date: ${yesterdayStr}`,
      JSON.stringify(yesterdayData)
    );

    // 4. Build Discord message
    const message = {
      embeds: [
        {
          title: `📊 Currency Comparison (Base: 1 MYR 🇲🇾)`,
          description: `Comparing ${todayStr} vs ${yesterdayStr}`,
          color: 0x3498db,
          fields: [
            {
              name: "🇯🇵 JPY",
              value: formatRate(todayRates.JPY, yesterdayRates.JPY),
              inline: true,
            },
            {
              name: "🇮🇩 IDR",
              value: formatRate(todayRates.IDR, yesterdayRates.IDR),
              inline: true,
            },
            {
              name: "🇹🇭 THB",
              value: formatRate(todayRates.THB, yesterdayRates.THB),
              inline: true,
            },
            {
              name: "🇺🇸 USD",
              value: formatRate(todayRates.USD, yesterdayRates.USD),
              inline: true,
            },
            {
              name: "🇸🇬 SGD",
              value: formatRate(todayRates.SGD, yesterdayRates.SGD),
              inline: true,
            },
          ],
          footer: { text: "Source: ratesdb.com" },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // 5. Post to Discord
    if (!webhookUrl) {
      throw new Error(
        "Missing DISCORD_WEBHOOK_URL_CUR in environment variables"
      );
    }

    const hookres = await axios.post(webhookUrl, message);
    console.log("✅ Sent to Discord:", hookres.status);
  } catch (err: any) {
    console.error("❌ Failed to post rate:", err.response?.data || err.message);
  }
}

postExchangeRate();
