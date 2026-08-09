'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { funds } from '../lib/funds';

type Row = {
  id:number; name:string; code:string; category:string; nav:number|null; navDate:string|null; dataPoints:number;
  belowHigh:number; aboveLow:number; rsi:number; weekly:number; monthly:number; ret3m:number; ret6m:number;
  ma20:number; ma50:number; weeklyRank:number; monthlyRank:number; blendedRank:number;
  discount:number; opportunity:number; total:number;
};
type Point = {date:string; nav:number};
type Log = {date:string; fund:string; amount:number; nav:number|null};

const money = (n:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
const pct = (n:number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
const scoreColor = (n:number) => n >= 70 ? '#10b981' : n >= 50 ? '#f59e0b' : '#ef4444';

function ScorePill({value}:{value:number}) {
  return <span className="score-pill" style={{color:scoreColor(value),background:`${scoreColor(value)}12`}}>{value.toFixed(1)}</span>;
}

function Stat({label,value,sub,tone='dark'}:{label:string;value:string;sub?:string;tone?:'dark'|'green'|'blue'|'amber'}) {
  return <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className={`stat-value ${tone}`}>{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>;
}

function Skeleton({className=''}:{className?:string}) { return <div className={`skeleton ${className}`} />; }

export default function Home() {
  const [rows,setRows] = useState<Row[]>([]);
  const [selected,setSelected] = useState('120843');
  const [history,setHistory] = useState<Point[]>([]);
  const [amount,setAmount] = useState(10000);
  const [opWeight,setOpWeight] = useState(60);
  const [stepUp,setStepUp] = useState(10);
  const [loading,setLoading] = useState(true);
  const [historyLoading,setHistoryLoading] = useState(false);
  const [error,setError] = useState('');
  const [apiStatus,setApiStatus] = useState('CONNECTING');
  const [generatedAt,setGeneratedAt] = useState('');
  const [logs,setLogs] = useState<Log[]>([]);
  const [period,setPeriod] = useState<'1M'|'6M'|'1Y'>('1Y');

  const loadDashboard = async (fresh=false) => {
    setLoading(true); setError(''); setApiStatus('CONNECTING');
    try {
      const response = await fetch(`/api/dashboard${fresh ? '?refresh=1' : ''}`,{cache:'no-store'});
      const json = await response.json();
      if (!response.ok && !json.rows?.length) throw new Error(json.error || 'Unable to load NAV data');
      setRows(json.rows || []); setApiStatus(json.status || 'ERROR'); setGeneratedAt(json.generatedAt || '');
      if (json.errors?.length) setError(`${json.errors.length} fund${json.errors.length>1?'s':''} could not be loaded from MFAPI.`);
    } catch (e) {
      setApiStatus('ERROR'); setError(e instanceof Error ? e.message : 'Unable to connect to NAV data source.');
    } finally { setLoading(false); }
  };

  const loadHistory = async (code:string, fresh=false) => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/nav?code=${code}${fresh?'&refresh=1':''}`,{cache:'no-store'});
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'NAV history unavailable');
      setHistory(json.data || []);
    } catch { setHistory([]); }
    finally { setHistoryLoading(false); }
  };

  useEffect(()=>{
    const stored = JSON.parse(localStorage.getItem('smart-sip-logs') || '[]');
    setLogs(stored);
    loadDashboard();
  },[]);

  useEffect(()=>{ if (!loading) loadHistory(selected); },[selected,loading]);

  const selectedRow = rows.find(r=>r.code===selected);
  const topWeek = useMemo(()=>[...rows].sort((a,b)=>b.discount-a.discount).slice(0,5),[rows]);
  const topMonth = useMemo(()=>[...rows].sort((a,b)=>b.total-a.total).slice(0,5),[rows]);

  const allocation = useMemo(()=>{
    if (!rows.length) return [];
    const floor=0.03, cap=0.20;
    const raw=rows.map(r=>Math.max(0.001,(r.opportunity*(opWeight/100))+(r.discount*((100-opWeight)/100))));
    let weights=raw.map(v=>v/raw.reduce((a,b)=>a+b,0));
    for(let pass=0;pass<20;pass++){
      let excess=0; let free=0;
      weights=weights.map(w=>w<floor?floor:w);
      weights=weights.map(w=>w>cap?(excess+=w-cap,cap):w);
      weights.forEach(w=>{if(w<cap-1e-9) free++});
      if(!excess || !free) break;
      weights=weights.map(w=>w<cap-1e-9?w+excess/free:w);
    }
    const total=weights.reduce((a,b)=>a+b,0);
    return rows.map((r,i)=>({...r,weight:weights[i]/total,allocation:amount*(weights[i]/total)})).sort((a,b)=>b.allocation-a.allocation);
  },[rows,amount,opWeight]);

  const displayHistory = useMemo(()=>{
    const days=period==='1M'?31:period==='6M'?183:365;
    return history.slice(-days).map(p=>({
      ...p, short:p.date.length>=10?p.date.slice(0,5):p.date,
    }));
  },[history,period]);

  const totalLogged=logs.reduce((s,x)=>s+x.amount,0);
  const currentMonthly = amount;
  const nextYear = Math.round(amount*(1+stepUp/100));

  const markInvested = (fund:any) => {
    const entry:Log={date:new Date().toISOString().slice(0,10),fund:fund.name,amount:Math.round(fund.allocation),nav:fund.nav};
    const next=[...logs,entry]; setLogs(next); localStorage.setItem('smart-sip-logs',JSON.stringify(next));
  };

  return <main>
    <header className="hero">
      <div className="hero-inner">
        <div className="brand-row">
          <div>
            <div className="eyebrow">SMART SIP • DECISION ENGINE</div>
            <h1>Smart SIP Allocation Dashboard</h1>
            <p>19-fund historical NAV analytics • rule-based scoring • allocation engine</p>
          </div>
          <div className="header-actions">
            <div className="live-badge"><span className={`status-dot ${apiStatus==='LIVE'?'live':apiStatus==='PARTIAL'?'partial':'loading'}`} /> {apiStatus==='LIVE'?'LIVE NAV DATA':apiStatus==='PARTIAL'?'PARTIAL DATA':apiStatus==='ERROR'?'DATA ERROR':'CONNECTING'}</div>
            <button className="ghost-btn" onClick={()=>loadDashboard(true)} disabled={loading}>↻ Refresh NAV</button>
          </div>
        </div>
        <div className="hero-strip">
          <span>● No trade execution</span><span>● No forecasting</span><span>● No broker connection</span><span>● Historical rule engine</span>
        </div>
      </div>
    </header>

    <div className="page">
      <section className="notice">
        <div className="notice-icon">i</div>
        <div><b>Decision-support only.</b> Opportunity Score is a rule-based heuristic using historical NAV patterns. It does not predict future performance and is not investment advice. Mutual fund investments are subject to market risk; past NAV trends do not guarantee future rallies or lowest-price entries.</div>
      </section>

      {error && <div className="error-banner"><b>Data warning:</b> {error} <button onClick={()=>loadDashboard(true)}>Retry</button></div>}

      <section className="stats-grid">
        <Stat label="Funds tracked" value="19" sub={`${rows.length}/19 currently available`} tone="blue" />
        <Stat label="Monthly SIP" value={money(currentMonthly)} sub={`Next-year target ${money(nextYear)}`} tone="dark" />
        <Stat label="Logged investments" value={money(totalLogged)} sub={`${logs.length} manual entries`} tone="green" />
        <Stat label="Last data refresh" value={generatedAt?new Date(generatedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'—'} sub={generatedAt?new Date(generatedAt).toLocaleDateString('en-IN'): 'Waiting for data'} tone="amber" />
      </section>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-head"><div><div className="section-kicker">RELATIVE OPPORTUNITY</div><h2>Top 5 — Recent weakness</h2><p>Funds with the strongest recent decline score.</p></div><span className="mini-tag">WEEKLY</span></div>
          <div className="rank-list">
            {loading ? [1,2,3,4,5].map(i=><Skeleton key={i} className="rank-skeleton" />) : topWeek.map((r,i)=><button className="rank-row" key={r.id} onClick={()=>setSelected(r.code)}>
              <span className="rank-num">{String(i+1).padStart(2,'0')}</span><span className="rank-main"><b>{r.name}</b><small>{r.category} · {pct(r.weekly)} 1W</small></span><ScorePill value={r.discount}/><span className="arrow">›</span>
            </button>)}
            {!loading && !topWeek.length && <div className="empty">NAV data has not loaded yet.</div>}
          </div>
        </div>

        <div className="panel allocator">
          <div className="panel-head"><div><div className="section-kicker">CAPITAL ALLOCATION</div><h2>Smart SIP Allocator</h2><p>Opportunity + discount tilt with strict diversification limits.</p></div><span className="mini-tag purple">3%—20%</span></div>
          <div className="control-grid">
            <label><span>Monthly amount</span><div className="input-wrap"><span>₹</span><input type="number" min="1000" step="500" value={amount} onChange={e=>setAmount(Math.max(1000,Number(e.target.value)||0))}/></div></label>
            <label><span>Annual step-up</span><div className="input-wrap"><input type="number" min="0" max="50" step="1" value={stepUp} onChange={e=>setStepUp(Math.max(0,Math.min(50,Number(e.target.value)||0)))}/><span>%</span></div></label>
          </div>
          <div className="slider-head"><span>Opportunity weight</span><b>{opWeight}%</b></div>
          <input className="slider" type="range" min="0" max="100" value={opWeight} onChange={e=>setOpWeight(Number(e.target.value))}/>
          <div className="slider-labels"><span>Discount 100%</span><span>Balanced 50/50</span><span>Opportunity 100%</span></div>
          <div className="allocation-preview">
            {loading ? [1,2,3,4].map(i=><Skeleton key={i} className="allocation-skeleton" />) : allocation.slice(0,5).map((r:any,i)=><div className="allocation-row" key={r.id}>
              <span className="allocation-rank">{i+1}</span><div className="allocation-name"><b>{r.name}</b><small>{(r.weight*100).toFixed(1)}% · Total {r.total.toFixed(1)}</small></div><strong>{money(r.allocation)}</strong>
            </div>)}
          </div>
          {allocation[0] && <button className="primary-btn" onClick={()=>markInvested(allocation[0])}>＋ Log top allocation as invested</button>}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head leaderboard-head"><div><div className="section-kicker">FULL UNIVERSE</div><h2>19-Fund Leaderboard</h2><p>Click any fund to inspect NAV history and scoring inputs.</p></div><div className="legend"><span><i className="legend-dot green"/>70+ strong</span><span><i className="legend-dot amber"/>50–70</span><span><i className="legend-dot red"/>&lt;50</span></div></div>
        <div className="table-wrap">
          <table className="leaderboard"><thead><tr><th>#</th><th>Fund</th><th>Category</th><th>NAV</th><th>1W</th><th>1M</th><th>RSI</th><th>Opportunity</th><th>Discount</th><th>Total</th></tr></thead>
          <tbody>
          {loading ? [1,2,3,4,5,6].map(i=><tr key={i}><td colSpan={10}><Skeleton className="table-skeleton"/></td></tr>) : rows.sort((a,b)=>b.total-a.total).map((r,i)=><tr key={r.id} className={selected===r.code?'selected-row':''} onClick={()=>setSelected(r.code)}>
            <td className="muted">{String(i+1).padStart(2,'0')}</td><td><div className="fund-cell"><span className="fund-logo">{r.name.slice(0,1)}</span><div><b>{r.name}</b><small>{r.code} · {r.navDate || 'NAV date unavailable'}</small></div></div></td><td><span className="category">{r.category}</span></td><td className="nav">{r.nav!=null?`₹${r.nav.toFixed(2)}`:'—'}</td><td className={r.weekly<0?'negative':'positive'}>{pct(r.weekly)}</td><td className={r.monthly<0?'negative':'positive'}>{pct(r.monthly)}</td><td>{r.rsi.toFixed(0)}</td><td><ScorePill value={r.opportunity}/></td><td><ScorePill value={r.discount}/></td><td><ScorePill value={r.total}/></td>
          </tr>)}
          </tbody></table>
        </div>
      </section>

      <section className="grid-2 detail-grid">
        <div className="panel chart-panel">
          <div className="panel-head"><div><div className="section-kicker">PRICE HISTORY</div><h2>{selectedRow?.name || 'NAV History'}</h2><p>{selectedRow?.nav!=null?`Latest NAV ₹${selectedRow.nav.toFixed(2)} · ${selectedRow.navDate || ''}`:'Select a fund to inspect its historical NAV.'}</p></div><div className="period-tabs">{(['1M','6M','1Y'] as const).map(x=><button className={period===x?'active':''} key={x} onClick={()=>setPeriod(x)}>{x}</button>)}</div></div>
          <div className="chart-wrap">{historyLoading ? <div className="chart-loading"><Skeleton className="chart-skeleton"/></div> : history.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={displayHistory} margin={{top:10,right:10,left:0,bottom:0}}><defs><linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b5ce2" stopOpacity={0.28}/><stop offset="100%" stopColor="#5b5ce2" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#edf0f5" vertical={false}/><XAxis dataKey="short" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} minTickGap={35}/><YAxis domain={['auto','auto']} tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} width={48}/><Tooltip contentStyle={{borderRadius:12,border:'1px solid #e2e8f0',boxShadow:'0 8px 30px rgba(15,23,42,.12)'}} formatter={(v:any)=>[`₹${Number(v).toFixed(2)}`,'NAV']}/><Area type="monotone" dataKey="nav" stroke="#5757d8" strokeWidth={2.5} fill="url(#navFill)" dot={false}/></AreaChart></ResponsiveContainer> : <div className="empty chart-empty">NAV history unavailable. Check the data status above and retry.</div>}</div>
        </div>

        <div className="panel score-panel">
          <div className="panel-head"><div><div className="section-kicker">SCORING BREAKDOWN</div><h2>Why this score?</h2><p>Transparent inputs — no ML or prediction layer.</p></div></div>
          {selectedRow ? <>
            <div className="big-score"><div className="score-ring" style={{'--score':`${selectedRow.total*3.6}deg`} as any}><span>{selectedRow.total.toFixed(1)}</span><small>Total</small></div><div><b>{selectedRow.total>=70?'High historical opportunity':selectedRow.total>=50?'Moderate historical opportunity':'Lower historical opportunity'}</b><p>Opportunity {selectedRow.opportunity.toFixed(1)} · Discount {selectedRow.discount.toFixed(1)}</p></div></div>
            <div className="metric-bars">
              <Metric label="% below 52W high" value={selectedRow.belowHigh} suffix="%" max={50} color="#5757d8"/>
              <Metric label="RSI (14)" value={selectedRow.rsi} suffix="" max={100} color="#f59e0b" reverse/>
              <Metric label="3M return" value={selectedRow.ret3m} suffix="%" max={30} color="#10b981" centered/>
              <Metric label="6M return" value={selectedRow.ret6m} suffix="%" max={50} color="#10b981" centered/>
            </div>
            <div className="formula-note"><b>Formula</b><br/>Opportunity = 40% discount-from-high + 30% RSI signal + 30% relative strength.<br/>Discount = 50% weekly decline rank + 50% monthly decline rank.<br/>Total = 60% Opportunity + 40% Discount.</div>
          </> : <div className="empty">Select a loaded fund.</div>}
        </div>
      </section>

      <section className="panel monthly-panel">
        <div className="panel-head"><div><div className="section-kicker">SIP PLAN</div><h2>Recommended monthly allocation</h2><p>Floor 3% per fund · cap 20% per fund · current SIP {money(amount)}</p></div><div className="mini-tag">{opWeight}% opportunity / {100-opWeight}% discount</div></div>
        <div className="allocation-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={allocation.slice(0,10)} margin={{top:10,right:10,left:0,bottom:0}}><CartesianGrid stroke="#edf0f5" vertical={false}/><XAxis dataKey="name" tick={{fontSize:10,fill:'#64748b'}} interval={0} angle={-22} textAnchor="end" height={55} tickFormatter={(x)=>x.split(' ').slice(0,2).join(' ')}/><YAxis tick={{fontSize:10,fill:'#94a3b8'}} tickFormatter={(x)=>`₹${x/1000}k`} axisLine={false} tickLine={false}/><Tooltip contentStyle={{borderRadius:12,border:'1px solid #e2e8f0'}} formatter={(v:any)=>[money(Number(v)),'Monthly SIP']}/><Bar dataKey="allocation" radius={[6,6,0,0]}>{allocation.slice(0,10).map((r:any)=><Cell key={r.id} fill={selected===r.code?'#5757d8':'#a5b4fc'}/>)}</Bar></BarChart></ResponsiveContainer></div>
      </section>

      <section className="grid-2 bottom-grid">
        <div className="panel methodology"><div className="section-kicker">METHODOLOGY</div><h2>How the engine works</h2><div className="method-grid"><Method n="01" title="Collect" text="Historical NAV is fetched from MFAPI and cached for 24 hours."/><Method n="02" title="Measure" text="52W high/low, RSI, 1W/1M/3M/6M returns and moving averages are calculated."/><Method n="03" title="Rank" text="Recent declines and medium-term relative strength are ranked across the 19-fund universe."/><Method n="04" title="Allocate" text="Scores drive a monthly SIP tilt while enforcing 3% minimum and 20% maximum weights."/></div></div>
        <div className="panel logs"><div className="panel-head"><div><div className="section-kicker">PORTFOLIO LOG</div><h2>Recent investments</h2><p>Stored locally in this browser.</p></div><button className="text-btn" onClick={()=>{if(confirm('Clear all locally stored investment logs?')){localStorage.removeItem('smart-sip-logs');setLogs([])}}}>Clear</button></div>{logs.length ? <div className="log-list">{logs.slice(-6).reverse().map((l,i)=><div className="log-row" key={`${l.date}-${i}`}><span className="log-date">{l.date}</span><span>{l.fund}</span><b>{money(l.amount)}</b></div>)}</div> : <div className="empty">No investments logged yet.</div>}</div>
      </section>

      <footer className="footer"><b>Smart SIP Allocation Dashboard</b><span>Rule-based historical analytics • Data source: MFAPI • No trade execution</span><span>Not investment advice. Mutual fund investments are subject to market risk.</span></footer>
    </div>
  </main>;
}

function Metric({label,value,suffix,max,color,reverse,centered}:{label:string;value:number;suffix:string;max:number;color:string;reverse?:boolean;centered?:boolean}){
  const pctValue=reverse?Math.max(0,Math.min(100,(100-value))):centered?Math.max(0,Math.min(100,50+(value/max)*50)):Math.max(0,Math.min(100,(value/max)*100));
  return <div className="metric"><div><span>{label}</span><b>{value.toFixed(1)}{suffix}</b></div><div className="metric-track"><span style={{width:`${pctValue}%`,background:color}}/></div></div>;
}
function Method({n,title,text}:{n:string;title:string;text:string}){return <div className="method"><span>{n}</span><div><b>{title}</b><p>{text}</p></div></div>}
