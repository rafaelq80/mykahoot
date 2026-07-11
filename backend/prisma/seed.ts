/**
 * Cria (ou atualiza a senha de) um administrador no banco de dados.
 *
 * Uso:
 *   npx tsx prisma/seed.ts <username> <password>
 */
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

const url = process.env.DATABASE_URL;

if (!url) {
  console.error('❌ ERRO: DATABASE_URL não encontrada no seu arquivo .env');
  process.exit(1);
}

// O PrismaNeon mais novo aceita a configuração da string de conexão direto nele,
// sem precisar dar "new Pool()" antes!
const adapter = new PrismaNeon({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [username, password] = process.argv.slice(2);

  if (!username || !password) {
    console.error('❌ Erro: Você precisa passar o usuário e a senha.');
    console.error('Uso: npx tsx prisma/seed.ts <username> <password>');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Erro: A senha precisa ter pelo menos 6 caracteres.');
    process.exit(1);
  }

  console.log(`⏳ Gerando hash da senha para o usuário: ${username}...`);
  const passwordHash = await bcrypt.hash(password, 10);

  console.log('🚀 Conectando ao Neon via Adapter e salvando no banco...');
  
  const admin = await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
    select: { id: true, username: true },
  });

  console.log(`\x1b[32m✔ Admin criado/atualizado com sucesso! \x1b[0m`);
  console.log(`➔ Usuário: ${admin.username} (ID: ${admin.id})`);
}

main()
  .catch((err) => {
    console.error('❌ Erro crítico ao executar o seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });