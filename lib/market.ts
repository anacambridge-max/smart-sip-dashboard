export type MarketInstrument={symbol:string;ticker:string;name:string;category:'INDEX'|'SECTOR'};
export const sectors:MarketInstrument[]=[
{symbol:'NIFTY50',ticker:'^NSEI',name:'Nifty 50',category:'INDEX'},
{symbol:'NEXT50',ticker:'^NSMIDCP',name:'Nifty Next 50',category:'INDEX'},
{symbol:'MIDCAP150',ticker:'NIFTYMIDCAP150.NS',name:'Nifty Midcap 150',category:'INDEX'},
{symbol:'SMALLCAP250',ticker:'NIFTYSMLCAP250.NS',name:'Nifty Smallcap 250',category:'INDEX'},
{symbol:'NIFTY500',ticker:'NIFTY500.NS',name:'Nifty 500',category:'INDEX'},
{symbol:'BANKING',ticker:'^NSEBANK',name:'Banking',category:'SECTOR'},
{symbol:'IT',ticker:'^CNXIT',name:'Information Technology',category:'SECTOR'},
{symbol:'AUTO',ticker:'^CNXAUTO',name:'Automobile',category:'SECTOR'},
{symbol:'PHARMA',ticker:'^CNXPHARMA',name:'Pharma',category:'SECTOR'},
{symbol:'METAL',ticker:'^CNXMETAL',name:'Metals',category:'SECTOR'},
{symbol:'REALTY',ticker:'^CNXREALTY',name:'Realty',category:'SECTOR'},
{symbol:'PSUBANK',ticker:'^CNXPSUBANK',name:'PSU Banks',category:'SECTOR'},
{symbol:'MEDIA',ticker:'^CNXMEDIA',name:'Media',category:'SECTOR'},
{symbol:'INFRA',ticker:'^CNXINFRA',name:'Infrastructure',category:'SECTOR'},
{symbol:'ENERGY',ticker:'^CNXENERGY',name:'Energy',category:'SECTOR'},
{symbol:'CONSUMPTION',ticker:'^CNXCONSUM',name:'Consumption',category:'SECTOR'}];
