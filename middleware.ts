import { NextRequest, NextResponse } from 'next/server';
export function middleware(req:NextRequest){
  if(req.nextUrl.pathname.startsWith('/api/cron/nav')&&req.headers.get('x-vercel-cron')==='1')return NextResponse.next();
  const configured=process.env.DASHBOARD_PASSWORD;
  if(!configured)return new NextResponse('Dashboard password is not configured.',{status:503,headers:{'Content-Type':'text/plain'}});
  const auth=req.headers.get('authorization');
  if(auth?.startsWith('Basic ')){try{const decoded=atob(auth.slice(6));const password=decoded.slice(decoded.indexOf(':')+1);if(password===configured)return NextResponse.next();}catch{}}
  return new NextResponse('Authentication required.',{status:401,headers:{'WWW-Authenticate':'Basic realm="Smart SIP Dashboard"'}});
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
