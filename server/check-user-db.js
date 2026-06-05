const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const cpfs = ['04833969157', '00368676161'];
    for (const cpf of cpfs) {
      const user = await prisma.user.findFirst({
        where: { cpf }
      });
      if (user) {
        console.log(`CPF: ${cpf} | Name: ${user.nome} | Status: ${user.status} | Role: ${user.role} | Perfil: ${user.perfil}`);
      } else {
        console.log(`CPF: ${cpf} | Not found in database`);
      }
    }
    
    const activeUsers = await prisma.user.findMany({
      take: 10,
      where: { status: 'ATIVO' }
    });
    console.log('\n--- ACTIVE USERS IN DATABASE ---');
    activeUsers.forEach(u => {
      console.log(`CPF: ${u.cpf} | Name: ${u.nome} | Status: ${u.status} | Role: ${u.role} | Perfil: ${u.perfil}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
