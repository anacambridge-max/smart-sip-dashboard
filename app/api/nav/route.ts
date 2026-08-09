import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';
export const dynamic='force-dynamic';
export async function GET(req:Request){const code=new URL(req.url).searchParams.get('code');if(!code)return NextResponse.json({error:'code required'},{status:400});try{const r=await getPool().query(`SELECT TO_CHAR(nav_date,'DD-MM-YYYY') AS date,nav FROM nav_history WHERE fund_code=$1 ORDER BY nav_date ASC`,[code]);return NextResponse.json({data:r.rows.map((x:any)=>({date:x.date,nav:Number(x.nav)})),status:r.rows.length?'CACHED':'UNAVAILABLE'},{headers:{'Cache-Control':'no-store'}})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'NAV cache unavailable',status:'ERROR'},{status:503})}}
