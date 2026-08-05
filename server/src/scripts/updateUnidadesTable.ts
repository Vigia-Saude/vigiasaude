import prisma from '../config/prisma';

async function main() {
  console.log('Iniciando atualização resiliente da tabela public.unidades...');
  
  await prisma.$executeRawUnsafe(`
    DO $$ 
    BEGIN
      -- Criar ENUM TipoUnidade se não existir
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipoUnidade') THEN
        CREATE TYPE "TipoUnidade" AS ENUM ('UBS', 'USF', 'UPA', 'FARMACIA_MUNICIPAL', 'POSTO_SAUDE');
      END IF;

      -- Adicionar colunas se não existirem
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unidades' AND column_name = 'tipo') THEN
        ALTER TABLE public.unidades ADD COLUMN tipo "TipoUnidade" NOT NULL DEFAULT 'UBS';
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unidades' AND column_name = 'email') THEN
        ALTER TABLE public.unidades ADD COLUMN email text;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unidades' AND column_name = 'responsavel') THEN
        ALTER TABLE public.unidades ADD COLUMN responsavel text;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unidades' AND column_name = 'cep') THEN
        ALTER TABLE public.unidades ADD COLUMN cep text;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unidades' AND column_name = 'logradouro') THEN
        ALTER TABLE public.unidades ADD COLUMN logradouro text;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unidades' AND column_name = 'numero') THEN
        ALTER TABLE public.unidades ADD COLUMN numero text;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unidades' AND column_name = 'bairro') THEN
        ALTER TABLE public.unidades ADD COLUMN bairro text;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unidades' AND column_name = 'cidade') THEN
        ALTER TABLE public.unidades ADD COLUMN cidade text;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unidades' AND column_name = 'uf') THEN
        ALTER TABLE public.unidades ADD COLUMN uf text;
      END IF;
    END $$;
  `);

  console.log('Tabela public.unidades atualizada com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro na atualização DDL:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
