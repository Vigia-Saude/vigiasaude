import prisma from './config/prisma';

async function check() {
  try {
    const pedidosCompra = await prisma.pedidoCompra.findMany({
      take: 5,
      orderBy: { criadoEm: 'desc' },
      include: { itens: true }
    });
    console.log('--- RECENT PURCHASE ORDERS (PedidoCompra) ---');
    pedidosCompra.forEach(p => {
      console.log(`ID: ${p.id} | Numero: ${p.numero} | Status: ${p.status} | Total: ${p.valorTotal} | Criado: ${p.criadoEm}`);
      p.itens.forEach(i => console.log(`  - Item: ${i.medicamentoNome} | Qtd: ${i.quantidade} | Preco: ${i.precoUnitario}`));
    });

    const pedidosReposicao = await prisma.pedidoReposicao.findMany({
      take: 5,
      orderBy: { criadoEm: 'desc' },
      include: { itens: true }
    });
    console.log('--- RECENT REPLENISHMENT ORDERS (PedidoReposicao) ---');
    pedidosReposicao.forEach(p => {
      console.log(`ID: ${p.id} | Numero: ${p.numero} | Status: ${p.status} | Criado: ${p.criadoEm}`);
      p.itens.forEach(i => console.log(`  - Item: ${i.medicamentoNome} | Qtd: ${i.quantidade}`));
    });
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
