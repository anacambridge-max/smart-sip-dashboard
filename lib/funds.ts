export type Fund={id:number;name:string;code:string;category:string;group:'EQUITY'|'GOLD'|'SILVER'};

// Fixed portfolio: ONLY these 19 schemes are tracked by the dashboard.
const raw:[string,string,string,'EQUITY'|'GOLD'|'SILVER'][]=[
['Quant Flexi Cap Fund Direct Growth','120843','Flexi Cap','EQUITY'],
['Quant Large and Mid Cap Fund Direct Growth','120826','Large & Mid Cap','EQUITY'],
['Quant Multi Asset Fund Direct Growth','120821','Multi Asset','EQUITY'],
['Quant Multi Cap Fund Direct Growth','120823','Multi Cap','EQUITY'],
['Quant Infrastructure Fund Direct Growth','120833','Infrastructure','EQUITY'],
['Quant BFSI Fund Direct Growth','151791','BFSI','EQUITY'],
['SBI Nifty 50 Index Fund Direct Growth','119827','Nifty 50 Index','EQUITY'],
['SBI Healthcare Opportunities Fund Direct Growth','119783','Healthcare','EQUITY'],
['SBI Focused Equity Fund Direct Growth','119727','Focused Equity','EQUITY'],
['SBI Children\'s Benefit Fund Direct Growth','148490','Children','EQUITY'],
['Bandhan Small Cap Fund Direct Growth','147946','Small Cap','EQUITY'],
['HDFC Mid Cap Opportunities Fund Direct Growth','118989','Mid Cap','EQUITY'],
['UTI Nifty Next 50 Index Fund Direct Growth','143341','Nifty Next 50 Index','EQUITY'],
['UTI Gold ETF FoF Direct Growth','150714','Gold','GOLD'],
['SBI Small Cap Fund Direct Growth','125497','Small Cap','EQUITY'],
['ICICI Prudential Value Discovery Fund Direct Growth','120586','Value','EQUITY'],
['Axis ELSS Tax Saver Fund Direct Growth','120503','ELSS','EQUITY'],
['Sundaram Services Fund Direct Growth','144835','Services','EQUITY'],
['Tata Digital India Fund Direct Growth','135800','Digital / IT','EQUITY'],
];

export const funds:Fund[]=raw.map((x,i)=>({id:i+1,name:x[0],code:x[1],category:x[2],group:x[3]}));
