---
title: Security & Secrets
inclusion: always
---

# Segredos e Segurança

- Toda credencial (chaves ImageKit, `JWT_SECRET`, `ADMIN_PASSWORD`, `DATABASE_URL`)
  vive em `.env`, que é git-ignored. Cada `.env` tem um `.env.example` versionado com
  as chaves sem valor.
- Nenhum arquivo gerado pode conter valor real de segredo — nem em comentário, nem em
  exemplo de código, nem em teste. Usar placeholders como `<sua-chave-aqui>`.
- No frontend, apenas variáveis com prefixo `VITE_` são expostas ao bundle — nunca
  colocar a `IMAGEKIT_PRIVATE_KEY` no `.env` do frontend; a assinatura de upload é
  sempre gerada pelo backend (endpoint de autenticação do ImageKit).
- Senha do professor (`ADMIN_PASSWORD`) nunca é comparada em texto puro contra input —
  ao evoluir além do MVP, hashear; no MVP documentar explicitamente essa limitação em
  `deployment-vercel-render` como dívida técnica aceita.
- CORS do backend restrito à URL do Vercel em produção; em dev, `http://localhost:5173`.
- O hook `security-secrets-check.kiro.hook` roda antes de qualquer escrita de arquivo
  para pegar segredo hardcoded antes que ele chegue ao disco.
