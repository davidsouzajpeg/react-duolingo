import type { Lesson, Question, Unit } from "./types";

/**
 * Trilha de vendas do Farol.
 *
 * Para adicionar conteúdo: crie uma nova lição dentro de `lessons` de uma
 * unidade (o desafio da unidade é montado automaticamente a partir das lições).
 */

type UnitSeed = Omit<Unit, "lessons"> & { lessons: Omit<Lesson, "kind">[] };

const seeds: UnitSeed[] = [
  {
    id: "u1",
    number: 1,
    title: "Fundamentos e prospecção",
    description: "Mentalidade consultiva, cliente ideal e primeiro contato",
    color: "#f5a524",
    shade: "#c7811a",
    lessons: [
      {
        id: "u1-l1",
        title: "Mentalidade consultiva",
        questions: [
          {
            kind: "multipla",
            prompt: "O que define um vendedor consultivo?",
            options: [
              "Fala o máximo possível sobre o produto",
              "Entende o problema do cliente antes de oferecer uma solução",
              "Oferece desconto logo no primeiro contato",
              "Só atende clientes que já querem comprar",
            ],
            answer: 1,
            explanation:
              "Venda consultiva começa pelo diagnóstico: primeiro você entende a dor, depois mostra como resolvê-la.",
          },
          {
            kind: "vf",
            statement:
              "Em uma boa reunião de vendas, o vendedor fala mais do que o cliente.",
            answer: false,
            explanation:
              "Os melhores vendedores ouvem mais do que falam. Uma referência comum é deixar o cliente falar mais da metade do tempo.",
          },
          {
            kind: "completar",
            prompt: "Complete a frase",
            sentence: "Cliente não compra produto, compra ___ para o seu ___.",
            answer: ["solução", "problema"],
            distractors: ["desconto", "brinde"],
            explanation:
              "O produto é só o meio. O que o cliente quer de verdade é resolver um problema ou alcançar um objetivo.",
          },
          {
            kind: "cenario",
            customer: "Me manda só a tabela de preços que eu vejo depois.",
            context: "Primeira conversa com um lead que pediu contato pelo site.",
            prompt: "Qual a melhor resposta?",
            options: [
              "Claro! Já te envio agora por e-mail.",
              "Posso enviar sim. Pra eu mandar a opção certa, posso te fazer duas perguntas rápidas sobre o que você precisa?",
              "Sem uma reunião eu não consigo passar preço.",
              "Nossos preços são os melhores do mercado, pode confiar.",
            ],
            answer: 1,
            explanation:
              "Você atende o pedido sem perder o controle da conversa: pede permissão para entender a necessidade antes de mandar o preço.",
          },
        ],
      },
      {
        id: "u1-l2",
        title: "Cliente ideal (ICP)",
        questions: [
          {
            kind: "multipla",
            prompt: "O que é o ICP (Perfil de Cliente Ideal)?",
            options: [
              "A lista de todos os clientes da empresa",
              "O cliente que mais reclama",
              "O tipo de empresa/cliente que mais se beneficia da sua solução e traz mais resultado",
              "O cliente que pagou mais caro no último mês",
            ],
            answer: 2,
            explanation:
              "O ICP descreve quem tem mais chance de comprar, ficar satisfeito e dar retorno. Ele orienta onde investir seu tempo de prospecção.",
          },
          {
            kind: "vf",
            statement:
              "Prospectar todo mundo é melhor do que focar em um perfil de cliente.",
            answer: false,
            explanation:
              "Sem foco, você gasta energia com quem não vai comprar. Prospecção boa é direcionada.",
          },
          {
            kind: "multipla",
            prompt:
              "Qual destas informações MENOS ajuda a qualificar um lead?",
            options: [
              "Se ele tem orçamento disponível",
              "Se ele tem poder de decisão",
              "Qual o time de futebol dele",
              "Se ele tem uma necessidade real e um prazo",
            ],
            answer: 2,
            explanation:
              "Orçamento, autoridade, necessidade e prazo (o famoso BANT) qualificam o lead. O time de futebol pode ajudar no rapport, mas não na qualificação.",
          },
          {
            kind: "ordenar",
            prompt: "Coloque o funil de vendas na ordem",
            steps: ["Prospecção", "Qualificação", "Apresentação", "Negociação", "Fechamento"],
            explanation:
              "Prospectar → qualificar → apresentar → negociar → fechar. Pular etapas costuma gerar objeções lá na frente.",
          },
        ],
      },
      {
        id: "u1-l3",
        title: "Primeiro contato",
        questions: [
          {
            kind: "ordenar",
            prompt: "Organize uma abordagem de ligação fria",
            steps: [
              "Apresentar-se e dizer o motivo da ligação",
              "Pedir permissão para continuar",
              "Fazer uma pergunta sobre o desafio do cliente",
              "Propor um próximo passo claro",
            ],
            explanation:
              "Apresentação curta, permissão, interesse genuíno no cliente e um próximo passo definido (ex.: agendar uma conversa).",
          },
          {
            kind: "cenario",
            customer: "Estou sem tempo agora.",
            context: "Você ligou para um prospect pela primeira vez.",
            prompt: "Como você responde?",
            options: [
              "É rapidinho, só 10 minutos!",
              "Tudo bem, desculpa o incômodo. Tchau.",
              "Entendo! Qual o melhor horário amanhã para uma conversa de 15 minutos?",
              "Então vou mandar um e-mail com tudo.",
            ],
            answer: 2,
            explanation:
              "Respeite o tempo do cliente e já garanta o próximo passo com um horário concreto.",
          },
          {
            kind: "completar",
            prompt: "Complete o objetivo do primeiro contato",
            sentence: "O objetivo do primeiro contato não é vender, é conseguir o ___ ___.",
            answer: ["próximo", "passo"],
            distractors: ["maior", "desconto"],
            explanation:
              "Cada contato deve avançar a venda para uma próxima etapa clara: reunião, demonstração, visita.",
          },
          {
            kind: "vf",
            statement:
              "Personalizar a mensagem de prospecção com algo específico da empresa do cliente aumenta a taxa de resposta.",
            answer: true,
            explanation:
              "Mensagens personalizadas mostram que você fez a lição de casa e geram muito mais respostas que textos genéricos.",
          },
        ],
      },
    ],
  },
  {
    id: "u2",
    number: 2,
    title: "Diagnóstico",
    description: "Perguntas que vendem e escuta ativa",
    color: "#14b8a6",
    shade: "#0f8f81",
    lessons: [
      {
        id: "u2-l1",
        title: "Perguntas abertas",
        questions: [
          {
            kind: "multipla",
            prompt: "Qual destas é uma pergunta ABERTA?",
            options: [
              "Vocês usam algum sistema hoje?",
              "Como funciona o processo de vocês hoje?",
              "Você é o responsável pela compra?",
              "Tem orçamento para este ano?",
            ],
            answer: 1,
            explanation:
              "Perguntas abertas (como, por que, o que) fazem o cliente falar e revelam informações que você não sabia perguntar.",
          },
          {
            kind: "vf",
            statement: "Perguntas fechadas nunca devem ser usadas em vendas.",
            answer: false,
            explanation:
              "Perguntas fechadas são ótimas para confirmar informações e conduzir ao fechamento. O segredo é equilibrar.",
          },
          {
            kind: "cenario",
            customer: "Nosso fornecedor atual atrasa as entregas às vezes.",
            prompt: "Qual a melhor pergunta para aprofundar?",
            options: [
              "Que bom que você falou, nós nunca atrasamos!",
              "Quando isso acontece, qual o impacto para vocês?",
              "Vocês querem trocar de fornecedor?",
              "Quantas vezes atrasou?",
            ],
            answer: 1,
            explanation:
              "Perguntar sobre o impacto transforma um incômodo em uma dor clara, e é a dor que justifica a compra.",
          },
          {
            kind: "completar",
            prompt: "Complete a regra de ouro do diagnóstico",
            sentence: "Quem faz as ___ conduz a ___.",
            answer: ["perguntas", "conversa"],
            distractors: ["promessas", "proposta"],
            explanation:
              "Fazer boas perguntas coloca você no controle da reunião sem parecer insistente.",
          },
        ],
      },
      {
        id: "u2-l2",
        title: "Método SPIN",
        questions: [
          {
            kind: "ordenar",
            prompt: "Coloque as etapas do SPIN na ordem",
            steps: ["Situação", "Problema", "Implicação", "Necessidade de solução"],
            explanation:
              "SPIN: entender a Situação, descobrir o Problema, explorar a Implicação e levar o cliente a expressar a Necessidade da solução.",
          },
          {
            kind: "multipla",
            prompt: '"Se esse retrabalho continuar, quanto isso custa por mês?" é uma pergunta de:',
            options: ["Situação", "Problema", "Implicação", "Necessidade de solução"],
            answer: 2,
            explanation:
              "Perguntas de implicação mostram o tamanho da dor: custo, tempo perdido, risco.",
          },
          {
            kind: "multipla",
            prompt: '"Quantas pessoas trabalham no seu time?" é uma pergunta de:',
            options: ["Situação", "Problema", "Implicação", "Necessidade de solução"],
            answer: 0,
            explanation:
              "Perguntas de situação levantam fatos. São necessárias, mas use poucas: o cliente se cansa delas rápido.",
          },
          {
            kind: "multipla",
            prompt: "Qual é uma pergunta de NECESSIDADE de solução?",
            options: [
              "Que sistema vocês usam hoje?",
              "Se vocês reduzissem esse retrabalho pela metade, o que isso mudaria para o time?",
              "Vocês têm problemas com atraso?",
              "Quem decide a compra?",
            ],
            answer: 1,
            explanation:
              "Ela faz o próprio cliente verbalizar o valor da solução, o que vale mais do que qualquer argumento seu.",
          },
        ],
      },
      {
        id: "u2-l3",
        title: "Escuta ativa",
        questions: [
          {
            kind: "multipla",
            prompt: "Qual atitude demonstra escuta ativa?",
            options: [
              "Interromper para mostrar que você já sabe a resposta",
              "Pensar na próxima frase enquanto o cliente fala",
              "Resumir o que o cliente disse e confirmar se entendeu",
              "Olhar o celular para anotar rápido",
            ],
            answer: 2,
            explanation:
              "Parafrasear (\"Então, se entendi bem...\") mostra atenção e evita mal-entendidos.",
          },
          {
            kind: "cenario",
            customer: "A gente já tentou uma solução parecida e não deu certo.",
            prompt: "Qual a melhor resposta?",
            options: [
              "Mas a nossa é diferente, pode confiar.",
              "Entendo. O que aconteceu naquela vez que fez não dar certo?",
              "Provavelmente vocês usaram errado.",
              "Que pena. Mas vamos ver o preço?",
            ],
            answer: 1,
            explanation:
              "Investigar a experiência ruim mostra empatia e te dá a informação exata do que o cliente teme.",
          },
          {
            kind: "vf",
            statement:
              "Fazer silêncio depois de uma pergunta importante ajuda o cliente a dar respostas mais completas.",
            answer: true,
            explanation:
              "Segurar o silêncio por alguns segundos dá espaço para o cliente pensar e se abrir.",
          },
          {
            kind: "completar",
            prompt: "Complete a técnica de confirmação",
            sentence: "\"Então, se eu ___ bem, o principal desafio de vocês hoje é...\"",
            answer: ["entendi"],
            distractors: ["vendi", "ofereci"],
            explanation:
              "A paráfrase valida o entendimento e faz o cliente se sentir ouvido.",
          },
        ],
      },
    ],
  },
  {
    id: "u3",
    number: 3,
    title: "Apresentação de valor",
    description: "Benefícios, proposta de valor e prova social",
    color: "#3b82f6",
    shade: "#2563c9",
    lessons: [
      {
        id: "u3-l1",
        title: "Benefício x característica",
        questions: [
          {
            kind: "multipla",
            prompt: "Qual destas frases é um BENEFÍCIO (e não uma característica)?",
            options: [
              "O sistema tem integração com 30 aplicativos",
              "A máquina imprime 100 páginas por minuto",
              "Você fecha o mês dois dias mais cedo, sem hora extra",
              "O produto tem 2 anos de garantia",
            ],
            answer: 2,
            explanation:
              "Característica é o que o produto tem; benefício é o que muda na vida do cliente.",
          },
          {
            kind: "completar",
            prompt: "Complete a ponte entre característica e benefício",
            sentence: "\"Nosso sistema emite nota automaticamente, o que ___ que você ganha 5 horas por semana.\"",
            answer: ["significa"],
            distractors: ["obriga", "impede"],
            explanation:
              "Use pontes como \"o que significa que...\" para traduzir cada característica em benefício.",
          },
          {
            kind: "vf",
            statement:
              "Apresentar todas as funcionalidades do produto é a melhor forma de convencer o cliente.",
            answer: false,
            explanation:
              "Mostre apenas o que resolve as dores levantadas no diagnóstico. Excesso de informação confunde.",
          },
          {
            kind: "cenario",
            customer: "Tá, mas o que eu ganho com isso?",
            context: "Você acabou de explicar uma funcionalidade técnica.",
            prompt: "Como responder?",
            options: [
              "É uma tecnologia de ponta, ninguém tem igual.",
              "Você mencionou que perde tempo conferindo pedidos; com isso, essa conferência passa a ser automática.",
              "Vou te mandar o manual técnico.",
              "Todo mundo usa, você vai gostar.",
            ],
            answer: 1,
            explanation:
              "Conecte a funcionalidade com uma dor que o próprio cliente citou. Isso torna o benefício concreto.",
          },
        ],
      },
      {
        id: "u3-l2",
        title: "Proposta de valor",
        questions: [
          {
            kind: "ordenar",
            prompt: "Monte uma boa apresentação de proposta",
            steps: [
              "Relembrar o problema do cliente",
              "Mostrar a solução para esse problema",
              "Apresentar o resultado esperado",
              "Apresentar o investimento",
              "Combinar o próximo passo",
            ],
            explanation:
              "Problema → solução → resultado → investimento → próximo passo. O preço vem depois do valor.",
          },
          {
            kind: "multipla",
            prompt: "Por que falar de preço só depois de mostrar valor?",
            options: [
              "Para esconder o preço do cliente",
              "Porque o preço é avaliado em comparação com o valor percebido",
              "Porque assim o cliente esquece de negociar",
              "Não faz diferença a ordem",
            ],
            answer: 1,
            explanation:
              "Preço sem contexto parece caro. Depois de entender o valor, o cliente compara o investimento com o ganho.",
          },
          {
            kind: "completar",
            prompt: "Complete a troca de palavras",
            sentence: "Em vez de \"custo\", prefira falar em ___, e em vez de \"contrato\", fale em ___.",
            answer: ["investimento", "acordo"],
            distractors: ["gasto", "multa"],
            explanation:
              "Palavras moldam a percepção. \"Investimento\" remete a retorno; \"acordo\" soa mais colaborativo.",
          },
          {
            kind: "vf",
            statement: "Uma boa proposta de valor é personalizada para o cliente.",
            answer: true,
            explanation:
              "Propostas genéricas parecem catálogo. Use os números e palavras que o cliente usou no diagnóstico.",
          },
        ],
      },
      {
        id: "u3-l3",
        title: "Prova social e histórias",
        questions: [
          {
            kind: "multipla",
            prompt: "Qual destes é um exemplo de prova social?",
            options: [
              "\"Nosso produto é o melhor\"",
              "\"A empresa X, do mesmo segmento que vocês, reduziu 30% do retrabalho em 3 meses\"",
              "\"Temos um preço imbatível\"",
              "\"Confia em mim\"",
            ],
            answer: 1,
            explanation:
              "Prova social mostra resultados reais de clientes parecidos. Quanto mais próximo do segmento do cliente, mais forte.",
          },
          {
            kind: "ordenar",
            prompt: "Organize uma história de cliente (case)",
            steps: [
              "Quem era o cliente e qual era o desafio",
              "O que foi feito",
              "O resultado alcançado (com números)",
            ],
            explanation:
              "Desafio → ação → resultado. Histórias com números são lembradas e geram confiança.",
          },
          {
            kind: "cenario",
            customer: "Não sei se isso funciona para uma empresa do nosso tamanho.",
            prompt: "Qual a melhor resposta?",
            options: [
              "Funciona para qualquer tamanho, garanto.",
              "Faz sentido a dúvida. Temos um cliente com um time do tamanho do seu; posso te contar como foi lá?",
              "Talvez vocês ainda sejam pequenos para isso.",
              "Vamos testar e ver no que dá.",
            ],
            answer: 1,
            explanation:
              "Valide a dúvida e responda com um caso semelhante. A prova vale mais do que a promessa.",
          },
          {
            kind: "vf",
            statement: "Depoimentos de clientes do mesmo segmento são mais convincentes.",
            answer: true,
            explanation:
              "O cliente se identifica com quem enfrenta os mesmos desafios que ele.",
          },
        ],
      },
    ],
  },
  {
    id: "u4",
    number: 4,
    title: "Contorno de objeções",
    description: "\"Está caro\", \"vou pensar\" e outras",
    color: "#f43f5e",
    shade: "#c42a47",
    lessons: [
      {
        id: "u4-l1",
        title: "O método",
        questions: [
          {
            kind: "ordenar",
            prompt: "Coloque o método de contorno de objeções na ordem",
            steps: [
              "Ouvir até o fim, sem interromper",
              "Validar a preocupação do cliente",
              "Investigar a causa real",
              "Responder e confirmar se resolveu",
            ],
            explanation:
              "Ouvir → validar → investigar → responder. Responder rápido demais costuma atacar a objeção errada.",
          },
          {
            kind: "vf",
            statement: "Uma objeção é sempre sinal de que o cliente não quer comprar.",
            answer: false,
            explanation:
              "Objeção muitas vezes é sinal de interesse: o cliente está avaliando seriamente e precisa de segurança.",
          },
          {
            kind: "multipla",
            prompt: "Qual destas frases VALIDA a objeção sem concordar com ela?",
            options: [
              "Você está errado.",
              "Entendo sua preocupação, faz sentido querer ter certeza.",
              "Isso não é verdade.",
              "Todo mundo fala isso.",
            ],
            answer: 1,
            explanation:
              "Validar é mostrar que a preocupação é legítima, não que ela está certa. Isso abaixa a guarda do cliente.",
          },
          {
            kind: "completar",
            prompt: "Complete a pergunta de investigação",
            sentence: "\"Além disso, existe mais alguma ___ que te impede de seguir ___?\"",
            answer: ["coisa", "adiante"],
            distractors: ["multa", "parado"],
            explanation:
              "Isolar a objeção garante que, ao resolvê-la, não aparecerá outra logo em seguida.",
          },
        ],
      },
      {
        id: "u4-l2",
        title: "\"Está caro\"",
        questions: [
          {
            kind: "cenario",
            customer: "Achei caro.",
            prompt: "Qual a melhor primeira resposta?",
            options: [
              "Posso te dar 15% de desconto.",
              "Caro comparado a quê?",
              "Mas a qualidade é muito superior.",
              "É o preço de mercado.",
            ],
            answer: 1,
            explanation:
              "Antes de responder, descubra a referência: outro fornecedor, o orçamento, ou o valor que ele ainda não percebeu?",
          },
          {
            kind: "multipla",
            prompt: "Por que dar desconto logo de cara é arriscado?",
            options: [
              "Porque o cliente pode gostar",
              "Porque reduz sua margem e sinaliza que o preço inicial não era real",
              "Porque é proibido",
              "Porque demora para calcular",
            ],
            answer: 1,
            explanation:
              "Desconto imediato corrói a margem e a credibilidade. O cliente passa a desconfiar de todo preço seu.",
          },
          {
            kind: "cenario",
            customer: "O concorrente cobra 20% menos.",
            prompt: "Qual a melhor resposta?",
            options: [
              "Então pode fechar com eles.",
              "A gente cobre a oferta.",
              "Entendo. Para comparar de forma justa, o que está incluso na proposta deles?",
              "O concorrente é ruim.",
            ],
            answer: 2,
            explanation:
              "Compare escopo com escopo. Muitas vezes a proposta mais barata não inclui o que é importante para o cliente.",
          },
          {
            kind: "completar",
            prompt: "Complete a técnica de fracionar o valor",
            sentence: "\"Esse investimento representa menos de R$ 5 por ___ para resolver um problema que custa R$ 2 mil por ___.\"",
            answer: ["dia", "mês"],
            distractors: ["ano", "hora"],
            explanation:
              "Fracionar o preço e compará-lo com o custo do problema deixa o valor muito mais claro.",
          },
        ],
      },
      {
        id: "u4-l3",
        title: "\"Vou pensar\"",
        questions: [
          {
            kind: "cenario",
            customer: "Gostei, mas vou pensar.",
            prompt: "Qual a melhor resposta?",
            options: [
              "Tudo bem, fico no aguardo.",
              "Claro! Para eu te ajudar nessa análise, o que ainda gera dúvida?",
              "Se fechar hoje eu dou desconto.",
              "Pensar em quê? Já expliquei tudo.",
            ],
            answer: 1,
            explanation:
              "\"Vou pensar\" quase sempre esconde uma objeção não dita. Pergunte com leveza para trazê-la à tona.",
          },
          {
            kind: "cenario",
            customer: "Já tenho fornecedor e estou satisfeito.",
            prompt: "Qual a melhor resposta?",
            options: [
              "Mas o nosso é melhor.",
              "Ok, obrigado pelo seu tempo.",
              "Que ótimo! Se pudesse melhorar uma coisa no atendimento atual, o que seria?",
              "Seu fornecedor cobra muito caro.",
            ],
            answer: 2,
            explanation:
              "Não ataque o fornecedor atual. Procure uma brecha de melhoria; ela abre espaço para uma comparação.",
          },
          {
            kind: "cenario",
            customer: "Preciso falar com meu sócio antes.",
            prompt: "Qual a melhor resposta?",
            options: [
              "Faz total sentido. Que tal agendarmos uma conversa rápida com vocês dois, para eu tirar as dúvidas dele também?",
              "Então me liga quando decidirem.",
              "Você não tem autonomia para decidir?",
              "Ele com certeza vai aprovar.",
            ],
            answer: 0,
            explanation:
              "Envolva o decisor em vez de depender de um recado. Você explica o valor muito melhor que um repasse.",
          },
          {
            kind: "vf",
            statement:
              "Antecipar uma objeção comum antes que o cliente a levante pode reduzir a resistência.",
            answer: true,
            explanation:
              "Trazer a objeção antes (\"muitos clientes perguntam sobre X...\") mostra transparência e tira a força dela.",
          },
        ],
      },
    ],
  },
  {
    id: "u5",
    number: 5,
    title: "Negociação e fechamento",
    description: "Sinais de compra, técnicas de fechamento e concessões",
    color: "#8b5cf6",
    shade: "#6d3fd6",
    lessons: [
      {
        id: "u5-l1",
        title: "Sinais de compra",
        questions: [
          {
            kind: "multipla",
            prompt: "Qual destas falas é um SINAL DE COMPRA?",
            options: [
              "\"Vocês existem há quanto tempo?\"",
              "\"Se a gente fechar, em quanto tempo conseguimos começar?\"",
              "\"Não sei se é o momento.\"",
              "\"Me manda um material.\"",
            ],
            answer: 1,
            explanation:
              "Perguntar sobre prazo de início, implantação ou pagamento indica que o cliente já está se imaginando como cliente.",
          },
          {
            kind: "vf",
            statement:
              "Ao perceber um sinal de compra, o vendedor deve continuar apresentando mais funcionalidades.",
            answer: false,
            explanation:
              "Sinal de compra é hora de conduzir ao fechamento. Falar demais pode levantar dúvidas novas.",
          },
          {
            kind: "cenario",
            customer: "Vocês aceitam pagamento em 3 vezes?",
            prompt: "Qual a melhor resposta?",
            options: [
              "Aceitamos sim! Prefere já deixar no 3x para começarmos semana que vem?",
              "Sim.",
              "Depende do valor.",
              "Só à vista, infelizmente.",
            ],
            answer: 0,
            explanation:
              "Responda e já avance para o fechamento com uma pergunta de alternativa.",
          },
          {
            kind: "completar",
            prompt: "Complete a lição",
            sentence: "Depois de pedir o ___, faça ___ e deixe o cliente responder.",
            answer: ["fechamento", "silêncio"],
            distractors: ["desconto", "barulho"],
            explanation:
              "Quem fala primeiro depois da pergunta de fechamento geralmente cede. Segure o silêncio.",
          },
        ],
      },
      {
        id: "u5-l2",
        title: "Técnicas de fechamento",
        questions: [
          {
            kind: "multipla",
            prompt: "\"Você prefere começar na segunda ou na quarta?\" é um exemplo de:",
            options: [
              "Fechamento por alternativa",
              "Fechamento por urgência",
              "Pergunta de situação",
              "Objeção",
            ],
            answer: 0,
            explanation:
              "No fechamento por alternativa, as duas opções levam ao sim. Você ajuda o cliente a decidir o como, não o se.",
          },
          {
            kind: "multipla",
            prompt: "O que é o fechamento por resumo?",
            options: [
              "Mandar um resumo por e-mail e esperar",
              "Recapitular as dores e os benefícios combinados e então pedir a decisão",
              "Resumir o preço com desconto",
              "Encerrar a reunião rapidamente",
            ],
            answer: 1,
            explanation:
              "Relembrar tudo o que o cliente concordou cria um caminho natural para o sim.",
          },
          {
            kind: "vf",
            statement: "Criar urgência falsa (\"só hoje!\") é uma boa prática de longo prazo.",
            answer: false,
            explanation:
              "Urgência deve ser real (prazo de condição, agenda de implantação). Urgência falsa destrói a confiança.",
          },
          {
            kind: "ordenar",
            prompt: "Organize um fechamento por resumo",
            steps: [
              "Relembrar o problema do cliente",
              "Confirmar os benefícios que ele valorizou",
              "Perguntar se ficou alguma dúvida",
              "Pedir a decisão",
            ],
            explanation:
              "Resumo, confirmação, espaço para dúvidas e o pedido claro. Não tenha medo de pedir o fechamento.",
          },
        ],
      },
      {
        id: "u5-l3",
        title: "Negociar sem dar desconto",
        questions: [
          {
            kind: "multipla",
            prompt: "Qual a regra de ouro da concessão em negociação?",
            options: [
              "Ceder tudo para fechar rápido",
              "Nunca ceder em nada",
              "Toda concessão deve ter uma contrapartida",
              "Ceder só para clientes grandes",
            ],
            answer: 2,
            explanation:
              "\"Se eu conseguir X, você consegue Y?\" Trocas mantêm o valor e evitam que o cliente peça sempre mais.",
          },
          {
            kind: "cenario",
            customer: "Se você baixar 10%, eu fecho agora.",
            prompt: "Qual a melhor resposta?",
            options: [
              "Fechado, 10% de desconto!",
              "Não posso dar nenhum desconto.",
              "Consigo chegar perto disso se fecharmos o plano anual com pagamento antecipado. Faz sentido para você?",
              "Vou ver com meu gerente e te retorno.",
            ],
            answer: 2,
            explanation:
              "Você troca o desconto por algo de valor para a empresa (prazo, volume, antecipação).",
          },
          {
            kind: "completar",
            prompt: "Complete a frase de troca",
            sentence: "\"___ eu conseguir esse prazo, você ___ o contrato hoje?\"",
            answer: ["Se", "assina"],
            distractors: ["Quando", "esquece"],
            explanation:
              "A estrutura \"Se eu..., você...?\" deixa clara a troca e compromete o cliente.",
          },
          {
            kind: "vf",
            statement:
              "Conhecer seu limite de negociação antes da reunião evita decisões ruins no calor do momento.",
            answer: true,
            explanation:
              "Defina antes o que pode ceder e o que é inegociável. Improvisar na negociação custa caro.",
          },
        ],
      },
    ],
  },
  {
    id: "u6",
    number: 6,
    title: "Pós-venda e fidelização",
    description: "Encantar, vender mais e ganhar indicações",
    color: "#22c55e",
    shade: "#18a04a",
    lessons: [
      {
        id: "u6-l1",
        title: "Follow-up e onboarding",
        questions: [
          {
            kind: "vf",
            statement: "O trabalho do vendedor termina quando o contrato é assinado.",
            answer: false,
            explanation:
              "O pós-venda garante que o cliente tenha sucesso, renove e indique. Venda boa é relacionamento.",
          },
          {
            kind: "multipla",
            prompt: "Qual o melhor momento para o primeiro contato após a venda?",
            options: [
              "Só quando for renovar",
              "Logo nos primeiros dias, para garantir uma boa experiência inicial",
              "Apenas se o cliente reclamar",
              "Nunca, para não incomodar",
            ],
            answer: 1,
            explanation:
              "Os primeiros dias definem a percepção do cliente. Um contato rápido evita frustrações e mostra cuidado.",
          },
          {
            kind: "ordenar",
            prompt: "Organize um bom follow-up após a reunião",
            steps: [
              "Agradecer pelo tempo",
              "Resumir o que foi conversado",
              "Confirmar o próximo passo com data",
            ],
            explanation:
              "Follow-up curto, com resumo e próximo passo datado, mantém a venda andando.",
          },
          {
            kind: "cenario",
            customer: "O pedido chegou, mas veio com um detalhe errado.",
            prompt: "Como responder?",
            options: [
              "Isso é com o setor de produção, não comigo.",
              "Sinto muito pelo transtorno! Vou resolver agora e te dou um retorno até o fim do dia.",
              "Mas está quase certo, né?",
              "Abre um chamado no site.",
            ],
            answer: 1,
            explanation:
              "Assuma o problema, peça desculpas e dê um prazo. Um problema bem resolvido gera mais lealdade do que nenhum problema.",
          },
        ],
      },
      {
        id: "u6-l2",
        title: "Upsell e cross-sell",
        questions: [
          {
            kind: "multipla",
            prompt: "Qual a diferença entre upsell e cross-sell?",
            options: [
              "São a mesma coisa",
              "Upsell é uma versão superior do mesmo produto; cross-sell é um produto complementar",
              "Upsell é desconto; cross-sell é brinde",
              "Cross-sell só vale para clientes novos",
            ],
            answer: 1,
            explanation:
              "Upsell: plano maior, versão premium. Cross-sell: produto complementar (ex.: instalação junto com a placa).",
          },
          {
            kind: "vf",
            statement:
              "Vender mais para um cliente atual costuma ser mais barato do que conquistar um cliente novo.",
            answer: true,
            explanation:
              "O cliente atual já confia em você. O custo de aquisição de um novo cliente costuma ser bem maior.",
          },
          {
            kind: "cenario",
            customer: "Estamos crescendo e contratando mais gente.",
            context: "Cliente ativo há 6 meses, satisfeito.",
            prompt: "Qual a melhor abordagem?",
            options: [
              "Parabéns! Vou te mandar o plano mais caro.",
              "Que ótimo! Como esse crescimento impacta o uso que vocês fazem da nossa solução hoje?",
              "Legal. Tchau!",
              "Então vocês vão precisar pagar mais.",
            ],
            answer: 1,
            explanation:
              "Mesmo no upsell, comece pelo diagnóstico. A oferta certa nasce da necessidade nova do cliente.",
          },
          {
            kind: "completar",
            prompt: "Complete a lição",
            sentence: "A melhor oferta adicional é a que aumenta o ___ do cliente, não só o seu ___.",
            answer: ["resultado", "ticket"],
            distractors: ["problema", "estoque"],
            explanation:
              "Upsell forçado gera cancelamento. Ofereça o que realmente ajuda o cliente a ir mais longe.",
          },
        ],
      },
      {
        id: "u6-l3",
        title: "Indicações",
        questions: [
          {
            kind: "multipla",
            prompt: "Qual o melhor momento para pedir uma indicação?",
            options: [
              "Antes de fechar a venda",
              "Logo depois que o cliente elogia um resultado",
              "Quando o cliente está reclamando",
              "Nunca se deve pedir",
            ],
            answer: 1,
            explanation:
              "Peça quando o cliente está satisfeito e acabou de perceber valor. A disposição para indicar está no pico.",
          },
          {
            kind: "completar",
            prompt: "Complete o pedido de indicação",
            sentence: "\"Que bom que deu certo! Você ___ mais alguém que poderia ter esse mesmo ___?\"",
            answer: ["conhece", "resultado"],
            distractors: ["vende", "problema"],
            explanation:
              "Pedido específico e ligado ao resultado é mais fácil de atender do que um genérico \"me indica alguém?\".",
          },
          {
            kind: "vf",
            statement: "Leads indicados costumam fechar com mais facilidade.",
            answer: true,
            explanation:
              "A indicação transfere a confiança de quem indicou. Por isso o ciclo de venda tende a ser mais curto.",
          },
          {
            kind: "ordenar",
            prompt: "Organize o ciclo de fidelização",
            steps: [
              "Entregar o que foi prometido",
              "Acompanhar os resultados do cliente",
              "Oferecer melhorias e novas soluções",
              "Pedir indicações",
            ],
            explanation:
              "Entregar, acompanhar, expandir e pedir indicação: assim cada cliente vira uma fonte de novos clientes.",
          },
        ],
      },
    ],
  },
];

/** Desafio da unidade: 2 questões de cada lição, alternando a posição */
const buildChallenge = (unit: UnitSeed): Lesson => {
  const questions: Question[] = unit.lessons.flatMap((lesson, i) =>
    lesson.questions.filter((_, qi) => qi % 2 === i % 2).slice(0, 2),
  );
  return {
    id: `${unit.id}-desafio`,
    title: `Desafio da unidade ${unit.number}`,
    kind: "desafio",
    questions,
  };
};

export const units: Unit[] = seeds.map((seed) => ({
  ...seed,
  lessons: [
    ...seed.lessons.map((l) => ({ ...l, kind: "licao" as const })),
    buildChallenge(seed),
  ],
}));

/** Todas as lições em ordem de desbloqueio */
export const allLessons: { lesson: Lesson; unit: Unit }[] = units.flatMap(
  (unit) => unit.lessons.map((lesson) => ({ lesson, unit })),
);

export const findLesson = (id: string) =>
  allLessons.find(({ lesson }) => lesson.id === id);
