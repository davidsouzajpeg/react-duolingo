/**
 * SIMULADOR DE VENDAS — modo guiado
 *
 * Conversas no estilo de mensagens com clientes fictícios. Em cada rodada o
 * vendedor escolhe uma resposta; o cliente reage de acordo com a escolha e a
 * conversa segue. A avaliação é determinística: cada alternativa vale de 0 a
 * 2 pontos em uma ou mais competências (rubrica abaixo), e o desfecho depende
 * do total.
 *
 * Personagens e empresas são fictícios. Para criar um cenário novo, copie um
 * dos existentes: `rounds` são as rodadas, na ordem; `reply` é a reação do
 * cliente à alternativa escolhida.
 */

export const competencias = {
  abordagem: {
    nome: "Abordagem",
    criterio: "Abrir a conversa com educação, contexto e interesse pelo cliente.",
    dica: "Comece reconhecendo o que o cliente disse antes de falar de você ou da Open.",
  },
  diagnostico: {
    nome: "Diagnóstico",
    criterio: "Fazer perguntas para entender a necessidade real antes de propor.",
    dica: "Antes de responder, pergunte: o que está por trás desse pedido? O que ele precisa resolver?",
  },
  comunicacao: {
    nome: "Clareza na comunicação",
    criterio: "Mensagens diretas, respeitosas e fáceis de entender, sem enrolar nem pressionar.",
    dica: "Diga uma coisa de cada vez e termine com uma pergunta ou um próximo passo claro.",
  },
  valor: {
    nome: "Argumentação e valor",
    criterio: "Mostrar o que o cliente ganha (durabilidade, resultado, tranquilidade), não só o que o produto tem.",
    dica: "Ligue cada argumento a algo que o cliente disse que é importante para ele.",
  },
  objecoes: {
    nome: "Tratamento de objeções",
    criterio: "Ouvir, validar a preocupação, investigar o motivo e só então responder.",
    dica: "Não rebata nem ceda de cara: valide (“entendo”) e pergunte o que está pesando.",
  },
  fechamento: {
    nome: "Condução do fechamento",
    criterio: "Levar a conversa a um próximo passo concreto, com data ou decisão.",
    dica: "Termine sempre com uma proposta de próximo passo: uma escolha entre duas opções funciona bem.",
  },
} as const;

export type Competencia = keyof typeof competencias;

export type SimOption = {
  text: string;
  /** pontos (0, 1 ou 2) em cada competência avaliada na rodada */
  scores: Partial<Record<Competencia, 0 | 1 | 2>>;
  /** reação do cliente a esta resposta */
  reply: string;
  /** por que essa resposta funciona ou não (mostrado na avaliação) */
  note: string;
};

export type SimRound = {
  /** competências avaliadas nesta rodada (máximo de 2 pontos em cada) */
  avalia: Competencia[];
  options: SimOption[];
};

export type Scenario = {
  id: string;
  title: string;
  resumo: string;
  cliente: { nome: string; empresa: string; emoji: string };
  /** primeira mensagem (do cliente, ou o contexto quando é o vendedor quem abre) */
  abertura: string;
  /** true quando a conversa começa com o vendedor (prospecção) */
  vendedorAbre?: boolean;
  competencias: Competencia[];
  rounds: SimRound[];
  /** desfecho por faixa de pontuação geral */
  desfechos: { otimo: string; medio: string; fraco: string };
};

export const scenarios: Scenario[] = [
  {
    id: "preco",
    title: "Cliente focado em preço",
    resumo: "Ela recebeu um orçamento mais barato do concorrente e quer desconto.",
    cliente: { nome: "Carla", empresa: "Bela Trama Modas", emoji: "👩‍💼" },
    abertura:
      "Boa tarde! Fiz três orçamentos para a fachada da minha loja e o de vocês ficou muito mais caro. Tem como melhorar esse preço?",
    competencias: ["objecoes", "diagnostico", "valor", "fechamento"],
    rounds: [
      {
        avalia: ["objecoes", "diagnostico"],
        options: [
          {
            text: "Consigo 10% de desconto se fechar hoje.",
            scores: { objecoes: 0, diagnostico: 0 },
            reply: "Hum… se já tinha 10% de gordura, quanto mais dá pra tirar? O outro ainda está mais barato.",
            note: "Desconto de cara confirma que o preço era alto e convida a pedir mais.",
          },
          {
            text: "Entendo, Carla, faz sentido comparar. Me ajuda a entender: o que os outros orçamentos incluem? Material, iluminação e instalação são os mesmos?",
            scores: { objecoes: 2, diagnostico: 2 },
            reply: "Olha, um deles é em lona, sem iluminação. O outro é ACM, mas não fala de instalação nem de garantia.",
            note: "Validou a preocupação e investigou a comparação antes de responder.",
          },
          {
            text: "Nosso preço é justo. A qualidade da Open é muito superior à dos outros.",
            scores: { objecoes: 0, diagnostico: 0 },
            reply: "Todo mundo fala isso… No fim, pra mim é uma placa na frente da loja.",
            note: "Rebater sem ouvir fecha a conversa e não mostra valor nenhum.",
          },
        ],
      },
      {
        avalia: ["diagnostico", "valor"],
        options: [
          {
            text: "E o que é mais importante pra você nessa fachada: durar bastante, chamar atenção à noite, ou ficar pronta rápido?",
            scores: { diagnostico: 2, valor: 2 },
            reply: "Preciso que chame atenção à noite, a rua é movimentada. E não quero ter que refazer daqui a um ano.",
            note: "Descobriu o critério de decisão dela: visibilidade à noite e durabilidade.",
          },
          {
            text: "A nossa é em ACM com letra caixa iluminada em LED, estrutura reforçada e acabamento premium.",
            scores: { diagnostico: 0, valor: 1 },
            reply: "Tá, mas isso tudo eu não sei se preciso. É bonito, mas é caro.",
            note: "Listou características sem saber o que importa para ela.",
          },
          {
            text: "Então o melhor é a senhora fechar com o mais barato mesmo e depois ver se deu certo.",
            scores: { diagnostico: 0, valor: 0 },
            reply: "Nossa. Tá bom, obrigada.",
            note: "Desistiu da venda e deixou a cliente sem orientação.",
          },
        ],
      },
      {
        avalia: ["valor", "objecoes"],
        options: [
          {
            text: "Então a iluminação em LED e o ACM fazem diferença pra você: a loja aparece à noite e o material não desbota. A lona costuma precisar de troca em um ou dois anos. Somando a troca, qual sai mais em conta?",
            scores: { valor: 2, objecoes: 2 },
            reply: "É… pensando assim, refazer sairia caro. Mas o valor de vocês ainda pesa no meu caixa agora.",
            note: "Ligou o valor ao que ela disse que importa e comparou o custo ao longo do tempo.",
          },
          {
            text: "A senhora vai se arrepender se fizer com lona. Depois não diga que não avisei.",
            scores: { valor: 0, objecoes: 0 },
            reply: "Não gostei do tom. Vou pensar.",
            note: "Pressionar com medo gera resistência, não confiança.",
          },
          {
            text: "Posso tirar a iluminação para baixar o preço.",
            scores: { valor: 0, objecoes: 1 },
            reply: "Mas aí não aparece à noite, que é o que eu mais queria…",
            note: "Cortou justamente o que ela mais valoriza.",
          },
        ],
      },
      {
        avalia: ["fechamento", "objecoes"],
        options: [
          {
            text: "Entendi, o ponto é o caixa. Posso ver com meu gerente uma condição de pagamento que caiba melhor. Se eu conseguir parcelar, fechamos esta semana?",
            scores: { fechamento: 2, objecoes: 2 },
            reply: "Se parcelar em mais vezes, fecho sim. Me manda a proposta atualizada?",
            note: "Tratou a objeção real (caixa) com condição, sem derrubar o valor, e pediu o compromisso.",
          },
          {
            text: "Tudo bem, fico no aguardo então.",
            scores: { fechamento: 0, objecoes: 0 },
            reply: "Tá bom. Qualquer coisa eu chamo.",
            note: "Sem próximo passo, a negociação esfria e o concorrente fecha.",
          },
          {
            text: "Faço 20% de desconto e não se fala mais nisso.",
            scores: { fechamento: 1, objecoes: 0 },
            reply: "Fechado! Mas da próxima vez já sei que dá pra pedir 20%, né?",
            note: "Fechou, mas queimou a margem e ensinou a cliente a pedir desconto sempre.",
          },
        ],
      },
    ],
    desfechos: {
      otimo: "Carla fechou a fachada em ACM com iluminação, parcelada, sem desconto fora da margem.",
      medio: "Carla ficou de pensar. Ainda dá para retomar com um bom follow-up.",
      fraco: "Carla fechou com o concorrente mais barato.",
    },
  },
  {
    id: "indeciso",
    title: "Cliente indeciso",
    resumo: "Ele gostou do projeto, mas não consegue decidir.",
    cliente: { nome: "Rogério", empresa: "Clínica Sorriso Certo", emoji: "🧑‍⚕️" },
    abertura:
      "Oi! Vi a proposta da sinalização da clínica. Gostei, mas ainda não sei… vou pensar mais um pouco.",
    competencias: ["diagnostico", "objecoes", "comunicacao", "fechamento"],
    rounds: [
      {
        avalia: ["objecoes", "diagnostico"],
        options: [
          {
            text: "Claro, Rogério, faz sentido avaliar bem. Só pra eu te ajudar: tem algum ponto específico que está te deixando em dúvida?",
            scores: { objecoes: 2, diagnostico: 2 },
            reply: "É que não sei se faço tudo agora ou só a recepção. E minha sócia ainda não viu.",
            note: "“Vou pensar” escondia duas dúvidas: o escopo e a sócia.",
          },
          {
            text: "Tudo bem! Quando decidir, me chama.",
            scores: { objecoes: 0, diagnostico: 0 },
            reply: "Combinado, obrigado.",
            note: "Aceitou o “vou pensar” sem descobrir o que falta para decidir.",
          },
          {
            text: "Pensar o quê? A proposta está ótima e o preço só vale até hoje.",
            scores: { objecoes: 0, diagnostico: 0 },
            reply: "Assim você me pressiona. Prefiro deixar pra depois.",
            note: "Pressão com prazo inventado afasta o cliente.",
          },
        ],
      },
      {
        avalia: ["diagnostico", "comunicacao"],
        options: [
          {
            text: "Entendi. O que mais incomoda hoje: os pacientes se perderem lá dentro ou a recepção não passar a imagem que vocês querem?",
            scores: { diagnostico: 2, comunicacao: 2 },
            reply: "A recepção. Paciente novo chega e acha que a clínica é antiga. As salas dá pra esperar.",
            note: "Pergunta simples que revela a prioridade e organiza a decisão.",
          },
          {
            text: "O ideal é fazer tudo de uma vez: recepção, salas, corredores, fachada e estacionamento.",
            scores: { diagnostico: 0, comunicacao: 1 },
            reply: "Nossa, aí fica pesado demais. Agora que eu travo mesmo.",
            note: "Aumentou o tamanho da decisão para quem já estava indeciso.",
          },
          {
            text: "Então tanto faz, o senhor que sabe.",
            scores: { diagnostico: 0, comunicacao: 0 },
            reply: "Pois é… por isso que eu ia pensar.",
            note: "O consultor precisa ajudar a decidir, não devolver a dúvida.",
          },
        ],
      },
      {
        avalia: ["comunicacao", "objecoes"],
        options: [
          {
            text: "Então sugiro começar pela recepção, que resolve a primeira impressão, e deixar as salas como segunda etapa. E posso apresentar pra sua sócia em 15 minutos, pra ela ver o projeto direto comigo. Que tal?",
            scores: { comunicacao: 2, objecoes: 2 },
            reply: "Gostei de dividir em etapas. Acho que ela topa ver, sim.",
            note: "Reduziu a decisão a um passo pequeno e resolveu a questão da sócia.",
          },
          {
            text: "Fala com a sua sócia e depois me avisa o que ela achou.",
            scores: { comunicacao: 1, objecoes: 0 },
            reply: "Tá, vou tentar falar com ela essa semana…",
            note: "Deixou a venda depender de um recado que talvez nem aconteça.",
          },
          {
            text: "Sua sócia vai gostar, pode confiar. Posso mandar o contrato?",
            scores: { comunicacao: 0, objecoes: 0 },
            reply: "Calma, ela nem viu ainda.",
            note: "Atropelou a outra pessoa que participa da decisão.",
          },
        ],
      },
      {
        avalia: ["fechamento"],
        options: [
          {
            text: "Ótimo! Consigo falar com vocês dois amanhã às 10h ou quinta às 16h. Qual fica melhor?",
            scores: { fechamento: 2 },
            reply: "Quinta às 16h. Já aviso ela.",
            note: "Técnica da escolha: duas opções, e as duas avançam a venda.",
          },
          {
            text: "Qualquer dia me liga que eu passo aí.",
            scores: { fechamento: 0 },
            reply: "Tá bom, vejo e te falo.",
            note: "Sem data, não há compromisso.",
          },
          {
            text: "Podemos marcar para algum dia da semana que vem?",
            scores: { fechamento: 1 },
            reply: "Pode ser… me lembra na segunda?",
            note: "Pediu o próximo passo, mas sem data definida ele fica solto.",
          },
        ],
      },
    ],
    desfechos: {
      otimo: "Rogério marcou a reunião com a sócia e vai começar pela recepção.",
      medio: "Rogério continua interessado, mas a decisão ficou em aberto.",
      fraco: "Rogério deixou o projeto para depois e parou de responder.",
    },
  },
  {
    id: "insatisfeito",
    title: "Cliente insatisfeito",
    resumo: "O letreiro chegou com a cor errada e fora do prazo.",
    cliente: { nome: "João", empresa: "Auto Peças Ferraz", emoji: "😠" },
    abertura:
      "Isso é um absurdo! O letreiro chegou com a cor errada e ainda atrasou dois dias. Como vocês fazem um negócio desses?",
    competencias: ["abordagem", "comunicacao", "objecoes", "fechamento"],
    rounds: [
      {
        avalia: ["abordagem", "comunicacao"],
        options: [
          {
            text: "João, entendo totalmente a sua frustração, e você tem razão em cobrar. Me deixa cuidar disso contigo agora.",
            scores: { abordagem: 2, comunicacao: 2 },
            reply: "Tá. Mas eu tenho inauguração no sábado, não posso ficar com isso assim.",
            note: "Chamou pelo nome, acolheu e assumiu o problema.",
          },
          {
            text: "Se acalme, senhor. Isso nunca aconteceu antes.",
            scores: { abordagem: 0, comunicacao: 0 },
            reply: "Me acalmar?! Quem está com letreiro errado sou eu!",
            note: "“Se acalme” e “nunca aconteceu” invalidam o que o cliente sente.",
          },
          {
            text: "Foi a produção que errou a cor, não fui eu.",
            scores: { abordagem: 0, comunicacao: 0 },
            reply: "Não quero saber de quem foi a culpa. Quero resolvido!",
            note: "O cliente quer solução, não um culpado.",
          },
        ],
      },
      {
        avalia: ["comunicacao", "objecoes"],
        options: [
          {
            text: "Entendi, sábado é o prazo. Me confirma só uma coisa: a cor certa é o vermelho do seu logotipo, o mesmo do arquivo que você aprovou?",
            scores: { comunicacao: 2, objecoes: 2 },
            reply: "Isso, o vermelho do logo. Veio um laranja.",
            note: "Confirmou o prazo e o problema exato antes de prometer.",
          },
          {
            text: "Estamos fazendo o possível para resolver.",
            scores: { comunicacao: 0, objecoes: 0 },
            reply: "“O possível” não me diz nada. Vai estar pronto sábado ou não?",
            note: "Frase genérica: o cliente precisa saber como, quando e quem.",
          },
          {
            text: "O que você quer que eu faça agora?",
            scores: { comunicacao: 0, objecoes: 0 },
            reply: "Quero que você faça o seu trabalho!",
            note: "Joga o problema de volta para o cliente.",
          },
        ],
      },
      {
        avalia: ["fechamento", "comunicacao"],
        options: [
          {
            text: "Combinado: a peça nova entra em produção amanhã às 8h, na cor do seu logo, e a instalação fica para sexta de manhã. Eu acompanho pessoalmente e te mando foto antes de sair da fábrica.",
            scores: { fechamento: 2, comunicacao: 2 },
            reply: "Sexta de manhã resolve. Vou confiar.",
            note: "Plano claro: como, quando e quem, com acompanhamento.",
          },
          {
            text: "Vamos resolver o mais rápido possível, pode ficar tranquilo.",
            scores: { fechamento: 0, comunicacao: 0 },
            reply: "Não fico tranquilo sem data.",
            note: "Promessa sem data não devolve a confiança.",
          },
          {
            text: "Acho que dá pra sábado cedo, mas depende da produção.",
            scores: { fechamento: 1, comunicacao: 1 },
            reply: "Sábado cedo é em cima da inauguração… e “acho” não me ajuda.",
            note: "Deu uma previsão, mas incerta e arriscada para o prazo dele.",
          },
        ],
      },
      {
        avalia: ["abordagem", "fechamento"],
        options: [
          {
            text: "Obrigado pela confiança, João. Na sexta, depois de instalado, te ligo pra confirmar que ficou como você queria. E pelo transtorno, a adesivação da porta vai por nossa conta.",
            scores: { abordagem: 2, fechamento: 2 },
            reply: "Agora sim. Se ficar certo na sexta, está resolvido.",
            note: "Follow-up combinado e um gesto de boa vontade, sem falar em desconto.",
          },
          {
            text: "Dou 30% de desconto e fica tudo certo.",
            scores: { abordagem: 0, fechamento: 1 },
            reply: "Desconto é bom, mas eu queria era o letreiro certo no dia.",
            note: "Gesto de boa vontade não é desconto: é mostrar valorização.",
          },
          {
            text: "Então é isso. Qualquer coisa, liga no atendimento.",
            scores: { abordagem: 0, fechamento: 0 },
            reply: "Atendimento? Achei que você ia acompanhar…",
            note: "Abandonou o cliente logo depois de prometer acompanhar.",
          },
        ],
      },
    ],
    desfechos: {
      otimo: "O letreiro foi corrigido e instalado antes da inauguração. João voltou a confiar na Open.",
      medio: "O problema foi encaminhado, mas João segue desconfiado.",
      fraco: "João ameaçou reclamar publicamente e pediu para falar com a gerência.",
    },
  },
  {
    id: "prospeccao",
    title: "Prospecção fria",
    resumo: "Você aborda uma rede de academias que nunca ouviu falar da Open.",
    cliente: { nome: "Paula", empresa: "Rede Pulso Academias", emoji: "👩‍💻" },
    abertura:
      "Você encontrou o contato da Paula, gerente de marketing da Rede Pulso, que vai abrir duas unidades novas. Como você começa?",
    vendedorAbre: true,
    competencias: ["abordagem", "diagnostico", "valor", "fechamento"],
    rounds: [
      {
        avalia: ["abordagem"],
        options: [
          {
            text: "Oi, Paula! Sou da Open, de comunicação visual. Vi que a Pulso vai abrir duas unidades novas, parabéns! Posso te fazer uma pergunta rápida sobre as fachadas delas?",
            scores: { abordagem: 2 },
            reply: "Oi! Pode sim, mas estou meio corrida.",
            note: "Personalizado, curto e com pedido de permissão.",
          },
          {
            text: "Bom dia! A Open faz fachadas, banners, adesivos, placas, troféus e brindes. Quer um orçamento?",
            scores: { abordagem: 0 },
            reply: "Obrigada, já temos fornecedor.",
            note: "Mensagem de catálogo: serve para qualquer um, então não chama ninguém.",
          },
          {
            text: "Oi, tudo bem? Você é a responsável pelas compras de comunicação visual?",
            scores: { abordagem: 1 },
            reply: "Sou do marketing. Do que se trata?",
            note: "Educado, mas não deu motivo para ela continuar a conversa.",
          },
        ],
      },
      {
        avalia: ["diagnostico"],
        options: [
          {
            text: "Vai ser rápido: hoje as fachadas das unidades seguem o mesmo padrão, ou cada uma ficou de um jeito?",
            scores: { diagnostico: 2 },
            reply: "Cada uma ficou de um jeito, pra ser sincera. Isso me incomoda bastante.",
            note: "Uma pergunta só, certeira, que revela a dor: falta de padrão.",
          },
          {
            text: "Qual é o orçamento de vocês para as fachadas?",
            scores: { diagnostico: 0 },
            reply: "Isso eu não passo assim, nem te conheço.",
            note: "Perguntar de dinheiro antes de gerar interesse soa invasivo.",
          },
          {
            text: "Vocês já têm fornecedor de fachada?",
            scores: { diagnostico: 1 },
            reply: "Temos um. Por quê?",
            note: "Pergunta fechada: informa pouco e encerra o assunto.",
          },
        ],
      },
      {
        avalia: ["valor"],
        options: [
          {
            text: "Faz sentido. Padronizamos as filiais de uma rede com o mesmo problema: homologamos a cor da marca no ACM e todas ficaram iguais. Posso te mostrar o antes e depois?",
            scores: { valor: 2 },
            reply: "Isso eu gostaria de ver, sim.",
            note: "Case parecido com a dor dela: prova em vez de promessa.",
          },
          {
            text: "A gente é o melhor da região, pode confiar.",
            scores: { valor: 0 },
            reply: "Todo fornecedor diz isso…",
            note: "Afirmação sem prova não gera interesse.",
          },
          {
            text: "Nosso preço costuma ser melhor que o do fornecedor de vocês.",
            scores: { valor: 0 },
            reply: "Preço não é meu problema agora.",
            note: "Ela disse que o problema é padrão, não preço.",
          },
        ],
      },
      {
        avalia: ["fechamento"],
        options: [
          {
            text: "Te mostro em 20 minutos, com os cases e o que faríamos nas duas unidades novas. Fica melhor terça às 10h ou quarta às 15h?",
            scores: { fechamento: 2 },
            reply: "Quarta às 15h. Me manda o convite?",
            note: "O objetivo da prospecção é a reunião: pediu com duração e duas opções de horário.",
          },
          {
            text: "Vou te mandar nosso catálogo em PDF e você vê quando puder.",
            scores: { fechamento: 0 },
            reply: "Pode mandar. (Ela não abriu o arquivo.)",
            note: "Catálogo enviado não é próximo passo: a conversa morre ali.",
          },
          {
            text: "Posso passar aí qualquer dia desses?",
            scores: { fechamento: 1 },
            reply: "Me chama semana que vem que eu vejo.",
            note: "Pediu a visita, mas sem data nem duração.",
          },
        ],
      },
    ],
    desfechos: {
      otimo: "Reunião marcada com a Paula para apresentar os cases e as duas unidades novas.",
      medio: "Paula ficou curiosa, mas sem reunião marcada.",
      fraco: "Paula encerrou a conversa: “já temos fornecedor”.",
    },
  },
  {
    id: "industrial",
    title: "Cliente industrial",
    resumo: "O comprador de uma indústria precisa de sinalização em volume.",
    cliente: { nome: "Marcos", empresa: "Metalforte Indústria", emoji: "👷" },
    abertura:
      "Boa tarde. Preciso de cotação para 400 placas de sinalização de segurança, para três galpões. Preciso do preço até amanhã.",
    competencias: ["diagnostico", "valor", "objecoes", "fechamento"],
    rounds: [
      {
        avalia: ["diagnostico", "comunicacao"],
        options: [
          {
            text: "Boa tarde, Marcos! Te atendo, sim. Pra cotar certo: as placas ficam em área interna ou externa, e seguem alguma norma ou padrão de cores da empresa?",
            scores: { diagnostico: 2, comunicacao: 2 },
            reply: "Metade externa. Seguimos a NR-26 e temos um manual de identidade. E já tivemos placa que desbotou em seis meses.",
            note: "Levantou os requisitos técnicos e descobriu uma dor: placas que desbotam.",
          },
          {
            text: "Claro! Me passa as medidas que eu mando o preço por placa hoje ainda.",
            scores: { diagnostico: 0, comunicacao: 1 },
            reply: "30x40. Mas quero ver se o preço de vocês bate com os outros.",
            note: "Virou comparação de preço por unidade, sem saber o que ele precisa.",
          },
          {
            text: "400 placas é muita coisa, não sei se dá até amanhã.",
            scores: { diagnostico: 0, comunicacao: 0 },
            reply: "Então vou seguir com outro fornecedor.",
            note: "Começou pela dificuldade em vez de entender o pedido.",
          },
        ],
      },
      {
        avalia: ["valor", "diagnostico"],
        options: [
          {
            text: "Esse desbotamento custou caro pra vocês? Para área externa uso impressão UV em chapa própria, que aguenta sol e chuva, e produzo tudo no padrão do manual de vocês.",
            scores: { valor: 2, diagnostico: 2 },
            reply: "Custou: tivemos que refazer e ainda levamos apontamento em auditoria. Durabilidade é requisito.",
            note: "Aprofundou a dor e ligou a solução a ela.",
          },
          {
            text: "Nossas placas são as melhores, pode comparar.",
            scores: { valor: 0, diagnostico: 0 },
            reply: "Preciso de especificação, não de adjetivo.",
            note: "Comprador técnico quer dados e requisitos atendidos.",
          },
          {
            text: "Temos adesivo, PVC, ACM, acrílico… o que o senhor preferir.",
            scores: { valor: 1, diagnostico: 0 },
            reply: "Eu não sei qual é o certo. Vocês é que são os especialistas.",
            note: "Deixou a escolha técnica com quem não é especialista.",
          },
        ],
      },
      {
        avalia: ["objecoes", "valor"],
        options: [
          {
            text: "Entendo, Marcos: compras precisa justificar o valor. Coloco na proposta a especificação, a garantia contra desbotamento e a comparação de custo com a troca em seis meses. Assim você mostra o custo total, não só o preço da placa.",
            scores: { objecoes: 2, valor: 2 },
            reply: "Isso me ajuda a defender internamente. Manda assim.",
            note: "Entendeu a objeção de um comprador (justificar a compra) e deu a ele os argumentos.",
          },
          {
            text: "Se o outro é mais barato, eu cubro.",
            scores: { objecoes: 0, valor: 0 },
            reply: "Então por que não mandou esse preço antes?",
            note: "Cobrir preço sem critério destrói a margem e a credibilidade.",
          },
          {
            text: "Preço baixo demais é sinal de material ruim.",
            scores: { objecoes: 1, valor: 0 },
            reply: "Pode ser, mas preciso de algo concreto para comparar.",
            note: "Tem um fundo de verdade, mas sem dados soa como ataque ao concorrente.",
          },
        ],
      },
      {
        avalia: ["fechamento"],
        options: [
          {
            text: "Envio a proposta amanhã até as 10h. Como é para três galpões, sugiro entregar por galpão. E o pedido sai pelo setor de compras, certo? Se precisar, mando o modelo de pedido oficial.",
            scores: { fechamento: 2 },
            reply: "Isso, pedido oficial pelo compras. Entrega por galpão é melhor. Aguardo a proposta.",
            note: "Próximo passo com data, entrega planejada e o caminho formal de aprovação.",
          },
          {
            text: "Mando o preço e você me fala depois.",
            scores: { fechamento: 0 },
            reply: "Ok.",
            note: "Sem data nem processo de aprovação, a cotação vira só mais uma.",
          },
          {
            text: "Mando amanhã. Fechando, precisamos de 50% adiantado.",
            scores: { fechamento: 1 },
            reply: "Condição de pagamento aqui é com o financeiro, vamos ver.",
            note: "Deu a data, mas travou em condição antes de entender o processo de compra dele.",
          },
        ],
      },
    ],
    desfechos: {
      otimo: "Marcos recebeu a proposta com custo total e encaminhou o pedido oficial pelo setor de compras.",
      medio: "A Open entrou na cotação, mas só comparada por preço.",
      fraco: "Marcos seguiu com outro fornecedor.",
    },
  },
];

export const findScenario = (id: string) => scenarios.find((s) => s.id === id);

export type SimEvaluation = {
  /** 0–100 */
  geral: number;
  porCompetencia: { id: Competencia; pontos: number; max: number; pct: number }[];
  fortes: Competencia[];
  melhorar: Competencia[];
  desfecho: "otimo" | "medio" | "fraco";
};

/** Rubrica: soma os pontos de cada competência nas rodadas em que ela é avaliada */
export const evaluate = (scenario: Scenario, choices: number[]): SimEvaluation => {
  const pontos: Partial<Record<Competencia, number>> = {};
  const max: Partial<Record<Competencia, number>> = {};
  scenario.rounds.forEach((round, i) => {
    const option = round.options[choices[i] ?? -1];
    for (const c of round.avalia) {
      max[c] = (max[c] ?? 0) + 2;
      pontos[c] = (pontos[c] ?? 0) + (option?.scores[c] ?? 0);
    }
  });
  const porCompetencia = (Object.keys(max) as Competencia[]).map((id) => ({
    id,
    pontos: pontos[id] ?? 0,
    max: max[id] ?? 0,
    pct: Math.round(((pontos[id] ?? 0) / (max[id] ?? 1)) * 100),
  }));
  const total = porCompetencia.reduce((a, c) => a + c.pontos, 0);
  const totalMax = porCompetencia.reduce((a, c) => a + c.max, 0);
  const geral = Math.round((total / totalMax) * 100);
  return {
    geral,
    porCompetencia,
    fortes: porCompetencia.filter((c) => c.pct >= 80).map((c) => c.id),
    melhorar: porCompetencia.filter((c) => c.pct < 60).map((c) => c.id),
    desfecho: geral >= 80 ? "otimo" : geral >= 50 ? "medio" : "fraco",
  };
};

/** faíscas por simulação: completas na primeira vez, reduzidas nas repetições */
export const SIM_XP_FIRST = 20;
export const SIM_XP_REPEAT = 6;
export const SIM_COINS_FIRST = 8;
