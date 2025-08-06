const axios = require('axios');

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

async function postExchangeRate() {
  const res = await axios.get('https://api.exchangerate.host/latest?base=USD&symbols=EUR,MYR,JPY');
  const rates = res.data.rates;

  const message = {
    username: 'CurrencyBot',
    embeds: [
      {
        title: '📊 Daily Currency Exchange Rates (Base: USD)',
        color: 0x3498db,
        fields: [
          { name: '🇪🇺 EUR', value: rates.EUR.toFixed(2), inline: true },
          { name: '🇲🇾 MYR', value: rates.MYR.toFixed(2), inline: true },
          { name: '🇯🇵 JPY', value: rates.JPY.toFixed(2), inline: true },
        ],
        footer: { text: 'Source: exchangerate.host' },
        timestamp: new Date().toISOString()
      }
    ]
  };

  await axios.post(webhookUrl, message);
}

postExchangeRate().catch(console.error);
