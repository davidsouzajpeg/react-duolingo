# Evolução do Vendê: situação real e pendências

Este documento registra o que existe de fato no repositório, o que foi entregue do pedido de evolução e o que depende de infraestrutura que ainda não existe aqui.

## Auditoria: o que este repositório é

- É um app **Next.js + TypeScript** (não há código Go neste repositório).
- **Não há servidor nem banco de dados.** Todo o progresso do vendedor fica no navegador (`localStorage`, chave `farol-vendas`), em `src/farol/store.ts`.
- **Não há login.** O vendedor só informa um nome no primeiro acesso.
- O **Meu Farol** (painel comercial, com login e API) roda em outro servidor e o código dele não está neste repositório.
- O ranking por divisões usa **colegas simulados** e está identificado assim na tela.

## Entregue e funcionando (sem depender de servidor)

| Item do pedido | O que existe |
|---|---|
| Simulador de vendas, modo guiado | 5 cenários (preço, indeciso, insatisfeito, prospecção fria, industrial) em `src/farol/simulador.ts`; conversa em `src/pages/farol/simulador.tsx`; avaliação por rubrica determinística em 6 competências, pontos fortes, o que melhorar e revisão rodada a rodada |
| Repetição com recompensa reduzida | No simulador: a primeira conclusão vale até 20 faíscas e 8 moedas; repetições valem até 6 faíscas e nenhuma moeda |
| Conquistas novas | "Primeira negociação" e "Negociador experiente" |
| Confirmação real | Reiniciar o progresso abre um diálogo que explica as consequências; o `window.confirm` sempre verdadeiro foi removido do artefato |
| Correções de uso | Barra inferior acima do conteúdo; botão de ação da lição sobre o ponto tocado |

O modo livre do simulador (texto digitado, com IA) aparece como **indisponível**: depende de um serviço de IA no servidor.

## Pendente: depende de servidor, banco e login

Nada abaixo foi implementado, porque sem servidor seria só aparência:

1. Autenticação integrada ao Meu Farol.
2. Progresso, faíscas e moedas guardados e validados no servidor (antifraude, idempotência, histórico auditável).
3. Ranking e divisões com vendedores reais, histórico de semanas e desempate no servidor.
4. Sincronização entre aparelhos.
5. Painel do gestor, treinamentos atribuídos e notificação confirmada pelo servidor.
6. Administração de conteúdo com gabarito protegido e versões.
7. Comparação com indicadores comerciais do Meu Farol.
8. Regra de recompensa reduzida ao repetir **lições** (hoje só o simulador reduz).

Pendente, mas possível sem servidor (ainda não feito): competências por questão, recomendações e revisão espaçada, painel de evolução do vendedor, metas e desafios semanais.

## Decisão necessária

Para a fase de servidor é preciso definir **onde ele vive**:

- **Dentro do Meu Farol** (mesmo login, mesmo banco): exige acesso ao código e ao banco do Meu Farol.
- **Servidor próprio do Vendê** (por exemplo, rotas de API neste app com um banco Postgres), recebendo do Meu Farol apenas a identidade do vendedor.

## Trilha única: vendas e produto intercalados

A trilha tem 12 unidades em sequência. As de produto ficam entre as de venda, na ordem definida em `ORDEM`, em `src/farol/content.ts`:

`u1 u2 m1 u3 u4 m2 u5 u6 m3 u7 u8 m4`

- **Vendas** (`u1` a `u8`, em `src/farol/content.ts`): baseadas no Playbook Vendas Open 2025.
- **Produto** (`m1` a `m4`, em `src/farol/content-materiais.ts`): ACM e chapas, impressão e tintas, mídias, acabamento, iluminação e como indicar a solução certa. Escritas com conhecimento técnico geral do setor; **precisam da revisão da produção da Open** antes de ir para o time (marcas, garantias e prazos reais não estão no texto).

Para incluir uma unidade nova, escreva-a em um dos arquivos de conteúdo e acrescente o id em `ORDEM`. Suba também `TRAIL_VERSION`, para o gestor ser avisado quando o vendedor concluir a nova última unidade.

## Ajuda nas correções

Quando o vendedor erra, a questão volta no fim da lição já com o que ele acertou (`HELP_AFTER_ERRORS = 1`, em `src/pages/farol/licao/[id].tsx`): posições certas ao ordenar, lacunas certas ao completar e, nas questões de escolha, as opções erradas já tentadas ficam riscadas.

## Aprofundamento de produto

As unidades de produto crescem por camadas: primeiro o que é o material, depois as especificações. Já aprofundado:

- **ACM:** o que é → espessura da chapa e das lâminas → pintura para fora e para dentro → composição da pintura → garantia e procedência → outras chapas.
- **Látex:** base, secagem, durabilidade estimada e efeito da laminação.

Números usados como referência, **a confirmar com a produção e com os fornecedores** antes de divulgar ao time:

| Dado | Valor usado | Origem |
|---|---|---|
| Lâminas de alumínio | 0,21 / 0,30 / 0,50 mm | catálogos de fabricantes (AECweb) |
| Pintura PVDF | padrão 70/30 | padrão de mercado |
| Garantia de fabricante | PVDF na casa de 15 anos; poliéster na casa de 5 | catálogos de fabricantes (AECweb), inclusive a linha NanoMaxx da Alucomaxx |
| Tinta látex na rua | até ~3 anos sem laminação; ~5 com laminação | estimativa da HP, não é garantia |

Próximas camadas sugeridas: solvente e ecossolvente, UV, vinis (marcas e garantias), lonas (gramatura), acrílico (espessuras) e LED (potência e garantia).

## Como entram novas lições (inclusive a partir de livros)

Hoje, uma lição é um bloco em `src/farol/content.ts` (dica do Faroldo + 4 ou 5 situações com explicação) e um cenário do simulador é um bloco em `src/farol/simulador.ts`. Fluxo proposto para conteúdo novo:

1. **Fonte**: o gestor envia o material (capítulo de livro, playbook, gravação de atendimento).
2. **Extração**: tiram-se as ideias práticas e transformam-se em situações da Open, com texto próprio. Não se copiam trechos do livro; conceitos e métodos podem ser ensinados com as nossas palavras e exemplos.
3. **Rascunho**: gera-se a unidade no formato do app (dica, situações, explicações, competências).
4. **Revisão do gestor** antes de publicar.
5. **Publicação**: hoje exige alterar o arquivo e publicar o app; com o servidor, vira cadastro em tela de administração, sem mexer em código, e sobe a versão da trilha para avisar os vendedores.
