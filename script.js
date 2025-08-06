const axios = require('axios');

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const apiUrl = 'https://free.ratesdb.com/v1/rates?from=JPY&to=MYR'
async function postExchangeRate() {
  const res = await axios.get(apiUrl);
  const rates = res.data.rates;

  const message = {
    embeds: [
      {
        title: '📊 Daily Currency Exchange Rates (Base: MYR)',
        color: 0x3498db,
        fields: [
          { name: '🇯🇵 JPY', value: rates.toFixed(3), inline: true },
        ],
        footer: { text: 'Source: exchangerate.host' },
        timestamp: new Date().toISOString()
      }
    ]
  };

  const hookres = await axios.post(webhookUrl, message);
  console.log(message,hookres)
}

postExchangeRate().catch(console.error);
