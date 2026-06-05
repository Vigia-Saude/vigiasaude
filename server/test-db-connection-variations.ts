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
      name: 'Shared Pooler (User: postgres, Port 6543)',
      str: 'postgresql://postgres:Graxasafado2026@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
    },
    {
      name: 'Shared Pooler (User: postgres.oxanubfolkoulklrhrpr, Port 6543)',
      str: 'postgresql://postgres.oxanubfolkoulklrhrpr:Graxasafado2026@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
    },
    {
      name: 'Shared Pooler (User: postgres.oxanubfolkoulklrhrpr, Port 5432)',
      str: 'postgresql://postgres.oxanubfolkoulklrhrpr:Graxasafado2026@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
    },
    {
      name: 'Shared Pooler (User: postgres, Port 5432)',
      str: 'postgresql://postgres:Graxasafado2026@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
    }
  ];

  for (const item of strings) {
    await test(item.name, item.str);
  }
}

run();
