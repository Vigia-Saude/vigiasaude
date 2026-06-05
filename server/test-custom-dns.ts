import dns from 'dns';
import { Client } from 'pg';

const customLookup = (hostname: string, options: any, callback: any) => {
  if (hostname === 'db.oxanubfolkoulklrhrpr.supabase.co') {
    // Resolve to the IPv4 address of aws-0-sa-east-1.pooler.supabase.com
    console.log(`[DNS Overrider] Intercepted ${hostname} -> resolving to 52.67.1.88`);
    return callback(null, '52.67.1.88', 4);
  }
  return dns.lookup(hostname, options, callback);
};

async function run() {
  const connectionString = 'postgresql://postgres:Graxasafado2026@db.oxanubfolkoulklrhrpr.supabase.co:6543/postgres?pgbouncer=true';
  const client = new Client({
    connectionString,
    // @ts-ignore
    lookup: customLookup
  });
  
  try {
    await client.connect();
    console.log('SUCCESS: Connected using custom lookup over IPv4!');
    const res = await client.query('SELECT NOW()');
    console.log('Result:', res.rows[0].now);
    await client.end();
  } catch (err: any) {
    console.error('FAILED:', err.message);
  }
}
run();
