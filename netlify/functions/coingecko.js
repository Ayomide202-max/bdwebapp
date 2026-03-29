exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // CoinGecko free tier - markets endpoint
    // Fetches top coins by market cap with full data
    const url = 'https://api.coingecko.com/api/v3/coins/markets?' +
      'vs_currency=usd' +
      '&order=volume_desc' +
      '&per_page=100' +
      '&page=1' +
      '&sparkline=false' +
      '&price_change_percentage=24h' +
      '&locale=en';

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EnfluxBD/1.0'
      }
    });

    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
    const data = await res.json();

    // Normalize to our schema
    const projects = data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      image: coin.image, // logo url
      chain: guessChain(coin.id, coin.symbol),
      category: 'DeFi', // CoinGecko free tier doesn't return category per coin
      market_cap: coin.market_cap || 0,
      price: coin.current_price || 0,
      volume_24h: coin.total_volume || 0,
      price_change_24h: coin.price_change_percentage_24h || 0,
      spread: estimateSpread(coin.total_volume, coin.market_cap),
      markets: coin.market_cap_rank || 0,
      exchanges: [],
      website: `https://www.coingecko.com/en/coins/${coin.id}`,
      twitter: '',
      source: 'coingecko',
      primary_venue: 'cex',
      dex_volume_ratio: 0,
      stage: 'listed',
      has_token: true,
      tge_status: 'done',
      is_listed: true,
      age_days: 365,
    }));

    return { statusCode: 200, headers, body: JSON.stringify(projects) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function guessChain(id, symbol) {
  const ethTokens = ['uniswap','aave','maker','compound','chainlink','the-graph'];
  const solTokens = ['raydium','serum','orca','bonk','jupiter-exchange-solana'];
  const bscTokens = ['pancakeswap-token','venus','alpaca-finance'];
  if (ethTokens.some(t => id.includes(t))) return 'Ethereum';
  if (solTokens.some(t => id.includes(t))) return 'Solana';
  if (bscTokens.some(t => id.includes(t))) return 'BSC';
  return 'Ethereum';
}

function estimateSpread(volume, marketCap) {
  if (!volume || !marketCap) return 1.5;
  const ratio = volume / marketCap;
  if (ratio > 0.5) return 0.3 + Math.random() * 0.4;
  if (ratio > 0.1) return 0.6 + Math.random() * 0.6;
  return 1.0 + Math.random() * 2.0;
}
