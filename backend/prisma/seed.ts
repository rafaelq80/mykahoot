/**
 * Cria (ou atualiza a senha de) um administrador no banco.
 *
 * Uso:
 *   npx prisma db seed -- <username> <password>
 *
 * Exemplo:
 *   npx prisma db seed -- professor "senha-forte-123"
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const [username, password] = process.argv.slice(2);

  if (!username || !password) {
    console.error('Uso: npx prisma db seed -- <username> <password>');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('A senha precisa ter pelo menos 6 caracteres.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
    select: { id: true, username: true },
  });

  console.log(`Admin pronto: ${admin.username} (id: ${admin.id})`);
}

main()
  .catch((err) => {
    console.error('Erro ao criar admin:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());