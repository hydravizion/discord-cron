const axios = require('axios');

const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/your-webhook-url';
const apiUrl = 'https://free.ratesdb.com/v1/rates?from=MYR';

async function postExchangeRate() {
  try {
    const res = await axios.get(apiUrl, { responseType: 'text' }); // force plain text
    const json = JSON.parse(res.data); // parse manually
    const rate = json.data.rates;

    const message = {
      embeds: [
        {
          title: '📊 Harini punya currency (Base: 1 MYR 🇲🇾)',
          color: 0x3498db,
          fields: [
            { name: '🇯🇵 JPY', value: rate.JPY?.toFixed(3) || 'N/A', inline: true },
            { name: '🇮🇩 IDR', value: rate.IDR?.toFixed(3) || 'N/A', inline: true },
            { name: '🇹🇭 THB', value: rate.THB?.toFixed(3) || 'N/A', inline: true },
            { name: '🇺🇲 USD', value: rate.USD?.toFixed(3) || 'N/A', inline: true },
            { name: '🇸🇬 SGD', value: rate.SGD?.toFixed(3) || 'N/A', inline: true }
          ],
          footer: { text: 'Source: ratesdb.com' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const hookres = await axios.post(webhookUrl, message);
    console.log('✅ Sent to Discord:', hookres.status);
  } catch (err) {
    console.error('❌ Failed to post rate:', err.response?.data || err.message);
  }
}

postExchangeRate();
