const axios = require('axios');

const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/your-webhook-url';
const baseUrl = 'https://free.ratesdb.com/v1/rates?from=MYR';

function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

async function getRates(date) {
  const url = date ? `${baseUrl}&date=${date}` : baseUrl;
  const res = await axios.get(url, { responseType: 'text' });
  const json = JSON.parse(res.data);
  return {
    rates: json.data.rates,
    date: json.data.date // API's reported date
  };
}

function formatRate(today, yesterday) {
  if (!today || !yesterday) return 'N/A';

  const diff = today - yesterday;
  const emoji = diff < 0 ? '🟢' : diff > 0 ? '🔴' : '⚪';
  return `${today.toFixed(3)} (${emoji} ${diff.toFixed(3)})`;
}

async function postExchangeRate() {
  try {
    // 1. Get latest available rates (no date param)
    const latestData = await getRates();
    const todayRates = latestData.rates;
    const todayStr = latestData.date; // API's own date

    console.log(`📅 Latest available rates date: ${todayStr}`);

    // 2. Calculate yesterday from API's date
    const yesterdayDate = new Date(todayStr);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatDate(yesterdayDate);

    // 3. Fetch yesterday's rates
    const yesterdayData = await getRates(yesterdayStr);
    const yesterdayRates = yesterdayData.rates;

    console.log(`📅 Yesterday's date: ${yesterdayStr}`);

    // 4. Build Discord message
    const message = {
      embeds: [
        {
          title: `📊 Currency Comparison (Base: 1 MYR 🇲🇾)`,
          description: `Comparing ${todayStr} vs ${yesterdayStr}`,
          color: 0x3498db,
          fields: [
            { name: '🇯🇵 JPY', value: formatRate(todayRates.JPY, yesterdayRates.JPY), inline: true },
            { name: '🇮🇩 IDR', value: formatRate(todayRates.IDR, yesterdayRates.IDR), inline: true },
            { name: '🇹🇭 THB', value: formatRate(todayRates.THB, yesterdayRates.THB), inline: true },
            { name: '🇺🇸 USD', value: formatRate(todayRates.USD, yesterdayRates.USD), inline: true },
            { name: '🇸🇬 SGD', value: formatRate(todayRates.SGD, yesterdayRates.SGD), inline: true }
          ],
          footer: { text: 'Source: ratesdb.com' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    // 5. Post to Discord
    const hookres = await axios.post(webhookUrl, message);
    console.log('✅ Sent to Discord:', hookres.status);
  } catch (err) {
    console.error('❌ Failed to post rate:', err.response?.data || err.message);
  }
}

postExchangeRate();
postExchangeRate();
