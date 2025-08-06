const axios = require('axios');

const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/your-webhook-url';
const apiUrl = 'https://free.ratesdb.com/v1/rates?from=JPY&to=MYR';

async function postExchangeRate() {
  try {
    const res = await axios.get(apiUrl, { responseType: 'text' }); // force plain text
    const json = JSON.parse(res.data); // parse manually
    const rate = json.data.rates.MYR;

    const message = {
      embeds: [
        {
          title: '📊 Daily Currency Exchange Rate (Base: JPY)',
          color: 0x3498db,
          fields: [
            { name: '🇲🇾 MYR', value: rate.toFixed(3), inline: true },
          ],
          footer: { text: 'Source: ratesdb.com' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const hookres = await axios.post(webhookUrl, message);
    console.log('Sent to Discord:', hookres.status);
  } catch (err) {
    console.error('Failed to post rate:', err.message);
  }
}

postExchangeRate();
