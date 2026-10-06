// Run after npm run build. Uses the actual Prisma adapter; changes no application data.
require('dotenv').config({quiet:true});
const prisma=require('../dist/config/prisma').default;
(async()=>{try{
  await prisma.$transaction(async tx=>{
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('regulacao-importacao'))`;
    const rows=await tx.$queryRaw`SELECT 1::integer AS ok`;
    if(rows[0].ok!==1)throw Error('Driver returned an unexpected value');
  });
  console.log('PASS: transaction lock works with the deployed Prisma adapter; no data changed.');
}finally{await prisma.$disconnect();}})().catch(e=>{console.error(e.message);process.exitCode=1});
