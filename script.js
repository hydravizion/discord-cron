const axios = require('axios');

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

async function postExchangeRate() {
  const res = await axios.get('https://api.exchangerate.host/latest?base=MYR&symbols=JPY');
  const rates = res.data.rates;

  const message = {
    content: "Harini punya jpy",
    embeds: [
      {
        title: '📊 Daily Currency Exchange Rates (Base: USD)',
        color: 0x3498db,
        fields: [
          { name: '🇯🇵 JPY', value: rates.JPY.toFixed(2), inline: true },
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
