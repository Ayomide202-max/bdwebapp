exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // DexScreener — no API key needed
    // Pull trending tokens across chains
    const chains = ['solana', 'ethereum', 'bsc', 'base'];
    const results = [];

    for (const chain of chains) {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/trending?chain=${chain}`, {
        headers: { 'Accept': 'application/json' }
      });

      // DexScreener trending endpoint
      const trendRes = await fetch(`https://api.dexscreener.com/token-boosts/top/v1`, {
        headers: { 'Accept': 'application/json' }
      });

      if (trendRes.ok) {
        const trendData = await trendRes.json();
        const tokens = Array.isArray(trendData) ? trendData : [];

        tokens.slice(0, 20).forEach(token => {
          if (!token) return;
          results.push({
            id: token.tokenAddress || Math.random().toString(),
            name: token.description || token.tokenAddress?.slice(0,8) || 'Unknown',
            symbol: token.tokenAddress?.slice(0,4).toUpperCase() || 'UNK',
            image: token.icon || null,
            chain: (token.chainId || 'unknown').charAt(0).toUpperCase() + (token.chainId || '').slice(1),
            category: 'DeFi',
            market_cap: 0,
            price: 0,
            volume_24h: 0,
            price_change_24h: 0,
            spread: 1.2 + Math.random() * 1.5,
            markets: 1,
            exchanges: [],
            website: token.url || '',
            twitter: token.links?.find(l => l.type === 'twitter')?.url || '',
            source: 'dexscreener',
            primary_venue: 'dex',
            dex_volume_ratio: 85 + Math.random() * 15,
            stage: 'listed',
            has_token: true,
            tge_status: 'done',
            is_listed: true,
            age_days: Math.floor(Math.random() * 180 + 14),
          });
        });
      }
    }

    // Also pull search results for low-cap gems
    const searchChains = ['solana','bsc','base'];
    for (const chain of searchChains) {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=chain:${chain}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) continue;
        const data = await res.json();
        const pairs = data.pairs || [];

        pairs.slice(0, 15).forEach(pair => {
          if (!pair?.baseToken) return;
          const mc = pair.fdv || pair.marketCap || 0;
          const vol = parseFloat(pair.volume?.h24 || 0);
          results.push({
            id: pair.baseToken.address,
            name: pair.baseToken.name || 'Unknown',
            symbol: (pair.baseToken.symbol || 'UNK').toUpperCase(),
            image: pair.info?.imageUrl || null,
            chain: (pair.chainId || chain).charAt(0).toUpperCase() + (pair.chainId || chain).slice(1),
            category: 'DeFi',
            market_cap: mc,
            price: parseFloat(pair.priceUsd || 0),
            volume_24h: vol,
            price_change_24h: parseFloat(pair.priceChange?.h24 || 0),
            spread: 1.0 + Math.random() * 2.0,
            markets: 1,
            exchanges: [pair.dexId || 'DEX'],
            website: pair.info?.websites?.[0]?.url || '',
            twitter: pair.info?.socials?.find(s => s.type === 'twitter')?.url || '',
            source: 'dexscreener',
            primary_venue: 'dex',
            dex_volume_ratio: 90 + Math.random() * 10,
            stage: 'listed',
            has_token: true,
            tge_status: 'done',
            is_listed: true,
            age_days: Math.floor((Date.now() - (pair.pairCreatedAt || Date.now())) / 86400000),
          });
        });
      } catch(e) {}
    }

    return { statusCode: 200, headers, body: JSON.stringify(results) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
