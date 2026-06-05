import { Client } from 'pg';

async function test(name: string, connectionString: string) {
  console.log(`Testing connection: ${name}...`);
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log(`  SUCCESS: Connected to ${name}`);
    const res = await client.query('SELECT NOW()');
    console.log(`  Result: ${res.rows[0].now}`);
    await client.end();
  } catch (err: any) {
    console.error(`  FAILED: ${err.message}`);
  }
}

async function run() {
  const strings = [
    {
      name: 'Local Env String (Direct Host, port 6543, user postgres)',
      str: 'postgresql://postgres:Graxasafado2026@db.oxanubfolkoulklrhrpr.supabase.co:6543/postgres?pgbouncer=true'
    },
    {
      name: 'Shared Pooler (aws-0-sa-east-1, port 6543, user postgres.oxanubfolkoulklrhrpr)',
      str: 'postgresql://postgres.oxanubfolkoulklrhrpr:Graxasafado2026@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
    },
    {
      name: 'Shared Pooler (aws-0-sa-east-1, port 5432, user postgres.oxanubfolkoulklrhrpr)',
      str: 'postgresql://postgres.oxanubfolkoulklrhrpr:Graxasafado2026@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
    }
  ];

  for (const item of strings) {
    await test(item.name, item.str);
  }
}

run();
