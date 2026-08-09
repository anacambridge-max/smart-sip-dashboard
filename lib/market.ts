export type MarketInstrument = {
  symbol: string;
  ticker: string;
  name: string;
  category: 'ETF' | 'SECTOR';
  group: 'Core' | 'Sector ETF' | 'Gold & Silver' | 'Sector';
};

export const etfs: MarketInstrument[] = [
  { symbol: 'GOLDBEES', ticker: 'GOLDBEES.NS', name: 'Nippon India ETF Gold BeES', category: 'ETF', group: 'Gold & Silver' },
  { symbol: 'SILVERBEES', ticker: 'SILVERBEES.NS', name: 'Nippon India Silver ETF', category: 'ETF', group: 'Gold & Silver' },
  { symbol: 'NIFTYBEES', ticker: 'NIFTYBEES.NS', name: 'Nippon India ETF Nifty 50 BeES', category: 'ETF', group: 'Core' },
  { symbol: 'BANKBEES', ticker: 'BANKBEES.NS', name: 'Nippon India ETF Nifty Bank BeES', category: 'ETF', group: 'Core' },
  { symbol: 'JUNIORBEES', ticker: 'JUNIORBEES.NS', name: 'Nippon India ETF Nifty Next 50 BeES', category: 'ETF', group: 'Core' },
  { symbol: 'MID150BEES', ticker: 'MID150BEES.NS', name: 'Nippon India ETF Nifty Midcap 150', category: 'ETF', group: 'Core' },
  { symbol: 'ITBEES', ticker: 'ITBEES.NS', name: 'Nippon India ETF Nifty IT', category: 'ETF', group: 'Sector ETF' },
  { symbol: 'PHARMABEES', ticker: 'PHARMABEES.NS', name: 'Nippon India ETF Nifty Pharma', category: 'ETF', group: 'Sector ETF' },
  { symbol: 'AUTOBEES', ticker: 'AUTOBEES.NS', name: 'Nippon India ETF Nifty Auto', category: 'ETF', group: 'Sector ETF' },
  { symbol: 'PSUBNKBEES', ticker: 'PSUBNKBEES.NS', name: 'Nippon India ETF Nifty PSU Bank', category: 'ETF', group: 'Sector ETF' },
  { symbol: 'INFRABEES', ticker: 'INFRABEES.NS', name: 'Nippon India ETF Infra BeES', category: 'ETF', group: 'Sector ETF' },
  { symbol: 'CPSEETF', ticker: 'CPSEETF.NS', name: 'CPSE ETF', category: 'ETF', group: 'Sector ETF' },
  { symbol: 'METALIETF', ticker: 'METALIETF.NS', name: 'ICICI Prudential Nifty Metal ETF', category: 'ETF', group: 'Sector ETF' },
  { symbol: 'NIFTYIETF', ticker: 'NIFTYIETF.NS', name: 'ICICI Prudential Nifty 50 ETF', category: 'ETF', group: 'Core' },
  { symbol: 'SETFNIF50', ticker: 'SETFNIF50.NS', name: 'SBI ETF Nifty 50', category: 'ETF', group: 'Core' },
  { symbol: 'NEXT50IETF', ticker: 'NEXT50IETF.NS', name: 'ICICI Prudential Nifty Next 50 ETF', category: 'ETF', group: 'Core' },
];

export const sectors: MarketInstrument[] = [
  { symbol: 'NIFTY50', ticker: '^NSEI', name: 'Nifty 50', category: 'SECTOR', group: 'Sector' },
  { symbol: 'BANKING', ticker: '^NSEBANK', name: 'Banking', category: 'SECTOR', group: 'Sector' },
  { symbol: 'IT', ticker: '^CNXIT', name: 'Information Technology', category: 'SECTOR', group: 'Sector' },
  { symbol: 'AUTO', ticker: '^CNXAUTO', name: 'Automobile', category: 'SECTOR', group: 'Sector' },
  { symbol: 'PHARMA', ticker: '^CNXPHARMA', name: 'Pharma', category: 'SECTOR', group: 'Sector' },
  { symbol: 'METAL', ticker: '^CNXMETAL', name: 'Metals', category: 'SECTOR', group: 'Sector' },
  { symbol: 'REALTY', ticker: '^CNXREALTY', name: 'Realty', category: 'SECTOR', group: 'Sector' },
  { symbol: 'PSUBANK', ticker: '^CNXPSUBANK', name: 'PSU Banks', category: 'SECTOR', group: 'Sector' },
  { symbol: 'MEDIA', ticker: '^CNXMEDIA', name: 'Media', category: 'SECTOR', group: 'Sector' },
  { symbol: 'INFRA', ticker: '^CNXINFRA', name: 'Infrastructure', category: 'SECTOR', group: 'Sector' },
  { symbol: 'ENERGY', ticker: '^CNXENERGY', name: 'Energy', category: 'SECTOR', group: 'Sector' },
  { symbol: 'CONSUMPTION', ticker: '^CNXCONSUM', name: 'Consumption', category: 'SECTOR', group: 'Sector' },
];
