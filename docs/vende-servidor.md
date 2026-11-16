# Vendê: contas e progresso no servidor

O app publicado tem login. O progresso de cada vendedor fica no banco de
dados do servidor (e numa cópia rápida no navegador).

## Peças

- `servidor/api/index.php`: API em PHP puro + PDO (MySQL). Rotas: `entrar`,
  `sair`, `eu`, `trocar-senha`, `progresso`, e as do gestor
  (`gestor/usuarios`, `gestor/criar`, `gestor/redefinir-senha`, `gestor/ativar`).
- `servidor/api/config.php`: credenciais do banco. Existe **só no servidor**;
  o modelo é `config.exemplo.php`.
- `src/farol/conta.ts`: login e sincronização no app. Só liga quando
  `NEXT_PUBLIC_VENDE_API` está definida (o `scripts/exportar.mjs` define).
- `src/pages/farol/gestor.tsx`: painel do gestor.

## Regras

- Usuário novo e senha redefinida: senha `1234`, com troca obrigatória no
  primeiro acesso (mínimo de 6 caracteres; `1234` e sequências óbvias são recusadas).
- 8 senhas erradas seguidas bloqueiam o usuário por 15 minutos.
- Redefinir a senha ou desativar o acesso encerra as sessões da pessoa.
- A sessão dura 30 dias (cookie HttpOnly, SameSite=Strict).

## Instalar em outro servidor

1. Criar um banco MySQL e o `config.php` a partir do modelo.
2. `POST /api/index.php?r=instalar` com `{chave, usuario, nome, senha}`
   (cabeçalho `X-Vende: 1`) cria as tabelas e o primeiro gestor.
3. Esvaziar `chave_instalacao` no `config.php`.

## Limites conhecidos

- A pontuação é calculada no aparelho e enviada ao servidor: serve para
  acompanhamento, não para premiação em dinheiro.
- Usar a mesma conta em dois aparelhos ao mesmo tempo: vale o último que salvou.
