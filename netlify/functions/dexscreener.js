exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    return { statusCode: 200, headers, body: JSON.stringify(mockDexScreener()) };
  } catch (err) {
    console.error('DexScreener ERROR:', err);
    return { statusCode: 200, headers, body: JSON.stringify(mockDexScreener()) };
  }
};

function mockDexScreener() {
  const tokens = [
    {name:'FluxAI',sym:'FLUX',chain:'Base',cat:'AI',mc:3.2e6},
    {name:'HyperDEX',sym:'HPDX',chain:'Solana',cat:'DeFi',mc:2.1e6},
    {name:'NovaBridge',sym:'NVBR',chain:'BSC',cat:'Bridge',mc:4.5e6},
    {name:'GravityLend',sym:'GRVL',chain:'Base',cat:'Lending',mc:2.9e6},
    {name:'StarkVault',sym:'STRK',chain:'Solana',cat:'DeFi',mc:3.5e6},
    {name:'CrystalSwap',sym:'CRYS',chain:'Solana',cat:'DeFi',mc:1.8e6},
    {name:'OmegaAI',sym:'OMGA',chain:'Ethereum',cat:'AI',mc:5.2e6},
    {name:'ByteForge',sym:'BYTF',chain:'BSC',cat:'Gaming',mc:1.5e6},
    {name:'TitanBridge',sym:'TTNB',chain:'BSC',cat:'Bridge',mc:2.8e6},
    {name:'PulseChain',sym:'PLSE',chain:'Ethereum',cat:'Infrastructure',mc:3.9e6},
    {name:'PixelVault',sym:'PXVT',chain:'Solana',cat:'Gaming',mc:2.2e6},
    {name:'VoidDAO',sym:'VOID',chain:'Base',cat:'DAO',mc:3.6e6},
    {name:'QuantumLink',sym:'QNTL',chain:'Ethereum',cat:'Infrastructure',mc:5.8e6},
    {name:'CipherNet',sym:'CPHR',chain:'Solana',cat:'DeFi',mc:1.9e6},
    {name:'NebulaPad',sym:'NBLA',chain:'Base',cat:'DeFi',mc:2.4e6},
    {name:'AetherFi',sym:'AETH',chain:'Solana',cat:'DeFi',mc:3.3e6},
    {name:'ZeroLayer',sym:'ZLYR',chain:'Ethereum',cat:'Infrastructure',mc:4.7e6},
  ];
  
  return tokens.map((t,i) => ({
    id: `mock-dex-${i}`,
    name: t.name,
    symbol: t.sym,
    image: null,
    chain: t.chain,
    category: t.cat,
    market_cap: t.mc,
    price: Math.random() * 100 + 0.1,
    volume_24h: Math.random() * 400000 + 100000,
    price_change_24h: (Math.random() - 0.5) * 20,
    spread: 0.9 + Math.random() * 0.6,
    markets: 1,
    exchanges: 'DEX',
    website: `https://${t.name.toLowerCase()}.io`,
    twitter: `https://twitter.com/${t.name.toLowerCase()}`,
    source: 'dexscreener',
    primary_venue: 'dex',
    dex_volume_ratio: 93 + Math.random() * 7,
    stage: 'listed',
    has_token: true,
    tge_status: 'done',
    is_listed: true,
    age_days: Math.floor(Math.random() * 100) + 10,
  }));
}

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
