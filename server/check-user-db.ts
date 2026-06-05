import prisma from './src/config/prisma';
import bcrypt from 'bcrypt';

async function run() {
  try {
    const testCases = [
      { cpf: '04833969157', rawPass: '@Cudechaira123' },
      { cpf: '00368676161', rawPass: '12345678' }
    ];

    for (const test of testCases) {
      const user = await prisma.user.findFirst({
        where: { cpf: test.cpf }
      });
      if (user) {
        const match = await bcrypt.compare(test.rawPass, user.senhaHash);
        console.log(`CPF: ${test.cpf} | Name: ${user.nome}`);
        console.log(`  Entered Password: "${test.rawPass}"`);
        console.log(`  Hash: ${user.senhaHash}`);
        console.log(`  Bcrypt Compare Match: ${match}`);
      } else {
        console.log(`CPF: ${test.cpf} | Not found`);
      }
    }
  } catch (err: any) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
