# Vendê

**Vender se aprende.** Experiência de aprendizagem gamificada em vendas, uma experiência Meu Farol, feita para o time comercial da Open.

- Linha **Venda Consultiva**, baseada no Playbook Vendas Open 2025: 8 unidades, 24 lições e 8 desafios.
- Linha **Materiais e Produtos**: 4 unidades sobre ACM e chapas, impressão e tintas, mídias, acabamento e iluminação.
- **Simulador de vendas** em modo guiado: 5 conversas com clientes fictícios e avaliação por competência.
- Cinco tipos de questão (situação real, múltipla escolha, verdadeiro ou falso, ordenar e completar), sempre com explicação.
- **Faíscas** (os pontos do Vendê), meta diária, moedas, níveis e conquistas.
- **Chama** (dias seguidos de prática) com **protetor de chama**, usado sozinho quando o vendedor perde um dia.
- **Avatar** montado pelo vendedor (corpo, pele, olhos, cabelo, barba, tipo e cor de roupa) e **loja** com itens para equipar (chapéus, óculos, acessórios e fundos).
- **Divisões semanais** (Bronze, Prata, Ouro, Platina, Diamante e Farol): no fim da semana os 3 primeiros sobem, os 3 últimos descem e os demais permanecem.
- Ao concluir a última unidade, o vendedor vê os parabéns e o gestor é avisado para liberar novos módulos.

## Rodar

```bash
pnpm install
pnpm dev      # http://localhost:3000 (abre em /farol)
pnpm build && pnpm start
```

## Onde mexer

| O quê | Arquivo |
|---|---|
| Conteúdo das lições e versão da trilha | `src/farol/content.ts`, `src/farol/content-materiais.ts` |
| Cenários do simulador | `src/farol/simulador.ts` |
| Progresso do vendedor (salvo no navegador) | `src/farol/store.ts` |
| Níveis, conquistas e divisões | `src/farol/gamification.ts` |
| Avatar e itens da loja | `src/farol/shop.ts` e `src/farol/components/Avatar.tsx` |
| Aviso ao gestor | `src/farol/notify.ts` e `docs/farol-integracao-gestor.md` |
| Telas | `src/pages/farol/` e `src/farol/components/` |
| Cores e fontes | `tailwind.config.ts` (`colors.farol`) |

## Configuração

- `NEXT_PUBLIC_FAROL_API_URL` (opcional): endereço da API do Meu Farol que recebe o aviso de trilha concluída. Sem ela, o aviso fica pendente no aparelho do vendedor.

## Limitações conhecidas

- O progresso fica salvo no navegador de cada vendedor; ainda não há login nem sincronização entre aparelhos.
- As divisões usam colegas simulados até existir um servidor com os dados do time.
- As páginas do projeto-base (abaixo) continuam no repositório, mas redirecionam para `/farol`.

---

## Projeto-base

O Vendê foi construído sobre o projeto abaixo.

# React Duolingo

https://react-duolingo-clone.vercel.app/ 

A simple [Duolingo](https://www.duolingo.com) web app clone written with [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Next.js](https://nextjs.org/), [Tailwind](https://tailwindcss.com/), and [Zustand](https://github.com/pmndrs/zustand). I used [create-t3-app](https://github.com/t3-oss/create-t3-app) to initialize the project.

<img src="./screenshots/screenshot-mobile.png" alt="Mobile screenshot" />
<img src="./screenshots/screenshot-desktop.png" alt="Desktop screenshot" />
