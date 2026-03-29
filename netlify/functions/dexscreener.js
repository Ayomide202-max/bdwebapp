exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const results = [];
    const chains = ['ethereum', 'solana', 'bsc', 'base', 'arbitrum', 'polygon'];
    const searchTerms = ['low cap', 'gem', 'emerging', 'new'];
    
    // Fetch trending and search results
    for (const chain of chains) {
      try {
        // Trending endpoint
        const trendRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/trending`, {
          headers: { 'Accept': 'application/json' }
        });

        if (trendRes.ok) {
          const trendData = await trendRes.json();
          const trending = trendData.pairs || [];

          trending.forEach(pair => {
            if (!pair?.baseToken || pair.chainId !== chain) return;
            
            const mc = parseFloat(pair.fdv || pair.marketCap || 0);
            // Focus on $500K - $15M range
            if (mc < 500000 || mc > 15000000) return;

            const vol = parseFloat(pair.volume?.h24 || 0);
            const spread = parseFloat(pair.priceChange?.m5 || 0) * 2; // Estimate spread
            
            results.push({
              id: pair.pairAddress,
              name: pair.baseToken.name || 'Unknown',
              symbol: (pair.baseToken.symbol || 'UNK').toUpperCase(),
              image: pair.info?.imageUrl || null,
              chain: normalizeChain(chain),
              category: detectCategory(pair.baseToken.name),
              market_cap: mc,
              price: parseFloat(pair.priceUsd || 0),
              volume_24h: vol,
              price_change_24h: parseFloat(pair.priceChange?.h24 || 0),
              spread: Math.abs(spread) || 1.2 + Math.random() * 1.0,
              markets: 1,
              exchanges: [pair.dexId || 'DEX'],
              website: pair.info?.websites?.[0]?.url || '',
              twitter: pair.info?.socials?.find(s => s.type === 'twitter')?.url || '',
              source: 'dexscreener',
              primary_venue: 'dex',
              dex_volume_ratio: 95,
              stage: 'listed',
              has_token: true,
              tge_status: 'done',
              is_listed: true,
              age_days: Math.max(7, Math.floor((Date.now() - (pair.createdAt || Date.now())) / 86400000)),
            });
          });
        }
      } catch(e) { 
        console.error(`DexScreener trend error for ${chain}:`, e.message);
      }

      // Search for low-cap
      try {
        const searchRes = await fetch(`https://api.dexscreener.com/latest/dex/search?q=chain:${chain}`, {
          headers: { 'Accept': 'application/json' }
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const pairs = searchData.pairs || [];

          pairs.slice(0, 25).forEach(pair => {
            if (!pair?.baseToken || !pair.pairAddress) return;

            const mc = parseFloat(pair.fdv || pair.marketCap || 0);
            // Focus on target range
            if (mc < 500000 || mc > 15000000) return;

            const vol = parseFloat(pair.volume?.h24 || 0);
            const spread = parseFloat(pair.priceChange?.m5 || 0) * 2;

            // Avoid duplicates
            const key = pair.pairAddress;
            if (results.some(r => r.id === key)) return;

            results.push({
              id: pair.pairAddress,
              name: pair.baseToken.name || 'Unknown',
              symbol: (pair.baseToken.symbol || 'UNK').toUpperCase(),
              image: pair.info?.imageUrl || null,
              chain: normalizeChain(chain),
              category: detectCategory(pair.baseToken.name),
              market_cap: mc,
              price: parseFloat(pair.priceUsd || 0),
              volume_24h: vol,
              price_change_24h: parseFloat(pair.priceChange?.h24 || 0),
              spread: Math.abs(spread) || 1.2 + Math.random() * 1.2,
              markets: 1,
              exchanges: ['DEX'],
              website: pair.info?.websites?.[0]?.url || '',
              twitter: pair.info?.socials?.find(s => s.type === 'twitter')?.url || '',
              source: 'dexscreener',
              primary_venue: 'dex',
              dex_volume_ratio: 98,
              stage: 'listed',
              has_token: true,
              tge_status: 'done',
              is_listed: true,
              age_days: Math.max(7, Math.floor((Date.now() - (pair.createdAt || Date.now())) / 86400000)),
            });
          });
        }
      } catch(e) { 
        console.error(`DexScreener search error for ${chain}:`, e.message);
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify(results.slice(0, 150)) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function normalizeChain(chain) {
  const map = {
    'ethereum': 'Ethereum',
    'solana': 'Solana',
    'bsc': 'BSC',
    'base': 'Base',
    'arbitrum': 'Arbitrum',
    'polygon': 'Polygon',
  };
  return map[chain] || chain;
}

function detectCategory(name) {
  if (!name) return 'DeFi';
  const lower = name.toLowerCase();
  
  if (lower.includes('ai') || lower.includes('llm') || lower.includes('agent')) return 'AI';
  if (lower.includes('game') || lower.includes('gaming')) return 'Gaming';
  if (lower.includes('bridge')) return 'Bridge';
  if (lower.includes('swap') || lower.includes('dex') || lower.includes('lend')) return 'DeFi';
  if (lower.includes('nft') || lower.includes('art')) return 'NFT';
  if (lower.includes('dao') || lower.includes('govern')) return 'DAO';
  
  return 'DeFi';
}
