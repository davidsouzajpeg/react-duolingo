import { cenario, completar, multipla, ordenar, vf, type UnitSeed } from "./autoria";
import { materiaisSeeds } from "./content-materiais";
import type { Lesson, Linha, Question, Unit } from "./types";

/**
 * LINHA DE TREINO "VENDA CONSULTIVA" — Open (comunicação visual)
 *
 * SOBRE O CONTEÚDO
 * - A ideia é aprender praticando, não fazer prova: cada lição abre com uma
 *   dica curta do Faroldo (`tip`), as perguntas são situações do dia a dia e
 *   a explicação de cada resposta ensina o porquê. Por isso o texto não cita
 *   documentos ("segundo o playbook…").
 * - O conteúdo segue o Playbook Vendas Open 2025 (cultura comercial, etapas
 *   do processo, diagnóstico, cross e up-selling, objeções, proposta,
 *   follow-up, urgência, gestão de crise, fechamento e indicação). Onde ele
 *   é silencioso (ex.: "manda só a tabela", várias versões de layout,
 *   orçamento parado), usamos boas práticas de venda consultiva.
 * - Descontos, prazos e condições citados são os exemplos do playbook. O
 *   gestor comercial deve revisar e ajustar.
 *
 * COMO EDITAR
 * - Cada unidade tem 3 lições (ids `u{n}-l{m}`) com 4–5 questões. O desafio
 *   da unidade é montado automaticamente por `buildChallenge`.
 * - Tipos de questão: multipla, cenario, ordenar, completar e vf (ver types.ts).
 * - Se mudar o sentido de uma lição existente, suba a `version` do store.
 * - Ao adicionar unidades/lições, suba `TRAIL_VERSION` (ver abaixo e
 *   docs/farol-integracao-gestor.md).
 */

/* --------------------------------- Conteúdo --------------------------------- */

const seeds: UnitSeed[] = [
  /* ------------------------------ Unidade 1 ------------------------------ */
  {
    id: "u1",
    number: 1,
    title: "Cultura comercial Open",
    description: "O que é vender, o ciclo completo da venda e as palavras do dia a dia",
    lessons: [
      {
        id: "u1-l1",
        tip:
          "Vender é descobrir o que o cliente precisa. Quase sempre ele sabe a dor, não o produto. Por isso a gente pergunta antes de oferecer.",
        title: "O que é vender?",
        questions: [
          multipla(
            "Uma venda bem-feita é, antes de tudo…",
            [
              "Uma negociação de preço",
              "Um diagnóstico",
              "Uma apresentação de produtos",
              "Uma disputa com o concorrente",
            ],
            1,
            "“Toda venda é um diagnóstico. Quanto melhor o diagnóstico, mais certeira será a solução.”",
          ),
          cenario(
            "Lead novo no WhatsApp: dona de uma loja de roupas que vai inaugurar.",
            "Quanto custa uma fachada de 6 metros?",
            "Qual resposta segue a cultura consultiva da Open?",
            [
              "Depende do material. Te mando agora o valor do metro em ACM.",
              "Te passo, sim! Antes, me conta: é inauguração ou reforma? Quero entender o que a fachada precisa resolver para indicar a solução certa.",
              "Só consigo falar de valores depois de uma reunião presencial.",
              "Vou te mandar a tabela completa em PDF e você escolhe.",
            ],
            1,
            "O cliente sabe a dor, nem sempre o produto. Ouvir antes de falar e entender antes de propor: é isso que torna a venda consultiva.",
          ),
          vf(
            "Muitas vezes o cliente não sabe qual produto precisa, mas sabe qual é a sua dor.",
            true,
            "Isso mesmo: nosso papel é descobrir essa dor e traduzi-la na solução certa.",
          ),
          completar(
            "Vender é oferecer o que o cliente ___; muitas vezes ele não sabe o produto, mas sabe a ___.",
            ["precisa", "dor"],
            ["rejeita", "tabela"],
            "Vendemos o que o cliente precisa — e o caminho para descobrir é explorar a dor dele.",
          ),
          multipla(
            "Como a cultura comercial da Open quer que o vendedor se posicione?",
            [
              "Como o fornecedor mais barato da região",
              "Como tirador de pedidos, rápido e sem perguntas",
              "Como solucionador estratégico, não apenas fornecedor",
              "Como especialista que decide pelo cliente",
            ],
            2,
            "Posicionamento de solucionador estratégico, atendimento com empatia e escuta ativa, e entregas de alto valor percebido.",
          ),
        ],
      },
      {
        id: "u1-l2",
        tip:
          "A venda não termina no pedido. Do primeiro contato ao pós-venda, cada etapa constrói valor, e o CRM guarda tudo o que foi combinado.",
        title: "Vendas 360º",
        questions: [
          multipla(
            "O que é a abordagem Vendas 360º?",
            [
              "Uma técnica para fechar a venda na primeira reunião",
              "Um ciclo completo que constrói valor em cada etapa, do primeiro contato ao pós-venda",
              "Um modelo em que o vendedor vende, produz e instala sozinho",
              "Uma tabela de descontos por volume de compra",
            ],
            1,
            "Vendas 360º enxerga o comercial como um ciclo integrado, com o cliente no centro — do primeiro contato à fidelização.",
          ),
          vf(
            "No modelo Vendas 360º, o uso do CRM é opcional para vendedores experientes.",
            false,
            "Uso obrigatório do CRM, sem exceções, e sempre atualizado: ele é uma ferramenta viva de informação.",
          ),
          ordenar(
            "Ordene o resumo do modelo Vendas 360º, do início ao fim do ciclo",
            [
              "Ouvir mais do que falar",
              "Fazer o diagnóstico antes da proposta",
              "Criar valor real para o cliente",
              "Entregar junto com toda a equipe",
              "Acompanhar com foco em relacionamento duradouro",
            ],
            "Ouvir, diagnosticar, criar valor, entregar em equipe e acompanhar. Esse é o ciclo completo.",
          ),
          cenario(
            "Fim de uma ligação com o gerente de uma clínica que pediu orçamento de sinalização interna.",
            "Beleza, fico no aguardo então.",
            "O que a rotina de vendas pede antes de encerrar o atendimento?",
            [
              "Agradecer e esperar o cliente chamar quando estiver pronto",
              "Mandar a tabela de preços para adiantar",
              "Combinar a próxima ação com data (“te apresento a proposta quinta às 10h”) e registrar a interação no CRM",
              "Registrar no CRM só se o cliente fechar",
            ],
            2,
            "Rotina e disciplina: registrar todas as interações e agendar a próxima ação antes de encerrar cada atendimento.",
          ),
          completar(
            "“Cliente satisfeito compra de novo e indica. Cliente encantado vira ___.”",
            ["embaixador"],
            ["concorrente", "devedor", "orçamento"],
            "A venda não termina no contrato: pós-venda ativo transforma cliente em embaixador da Open.",
          ),
        ],
      },
      {
        id: "u1-l3",
        tip:
          "Algumas palavras aparecem todo dia. Cross-selling é oferecer um complemento. Up-selling é oferecer uma versão melhor do que o cliente já quer.",
        title: "Palavras do dia a dia",
        questions: [
          multipla(
            "O que é cross-selling (venda cruzada)?",
            [
              "Oferecer uma versão superior do mesmo produto",
              "Dar desconto para fechar mais rápido",
              "Oferecer produtos ou serviços complementares ao que o cliente está comprando",
              "Dividir o pedido entre dois vendedores",
            ],
            2,
            "Cross-selling amplia a solução com itens complementares. Versão superior do mesmo item é up-selling.",
          ),
          multipla(
            "Quando falamos em “valor percebido”, estamos falando de…",
            [
              "O preço final já com desconto",
              "Como o cliente enxerga o benefício da solução em relação ao investimento",
              "O custo de produção mais a margem",
              "O preço do metro quadrado do material",
            ],
            1,
            "Valor percebido é a relação entre benefício e investimento na cabeça do cliente — é ele que a gente constrói na venda.",
          ),
          vf(
            "No-show é quando o cliente não comparece à reunião marcada, sem justificativa — e pede reagendamento com nova abordagem.",
            true,
            "Exato. Quando isso acontece, reagende logo e reforce por que a reunião vale a pena.",
          ),
          completar(
            "Gatilho de ___ cria um motivo real para decidir agora; prova ___ mostra que outras empresas confiaram na Open.",
            ["urgência", "social"],
            ["culpa", "técnica"],
            "Urgência = motivo real para decisão imediata (prazo, bônus, condição). Prova social = depoimentos, cases, antes e depois.",
          ),
          cenario(
            "Cliente pediu uma placa em ACM comum para área externa.",
            "É só essa placa mesmo.",
            "Qual destas falas é um exemplo de UP-selling?",
            [
              "Aproveitando, quer incluir a adesivação da frota?",
              "Se fechar hoje, consigo prioridade na produção.",
              "Conhece mais alguém que precise de placa?",
              "Quer ver uma opção em ACM Superbold? A diferença de valor é pequena, e a durabilidade externa e a garantia são maiores.",
            ],
            3,
            "Up-selling é a versão superior do que o cliente já quer. Adesivar a frota seria cross-selling; prioridade é urgência; a outra é indicação.",
          ),
        ],
      },
    ],
  },

  /* ------------------------------ Unidade 2 ------------------------------ */
  {
    id: "u2",
    number: 2,
    title: "Prospecção e preparação",
    description: "Leads, qualificação, abordagem inicial e o “antes de apresentar”",
    lessons: [
      {
        id: "u2-l1",
        tip:
          "Antes de abordar, pesquise: o segmento, o que a empresa está fazendo, que dor ela pode ter. Contato personalizado abre portas; mensagem genérica é ignorada.",
        title: "Prospecção e qualificação",
        questions: [
          ordenar(
            "Ordene a etapa de Prospecção e Qualificação da Open",
            [
              "Mapear o mercado por nichos e coletar contatos",
              "Estudar o segmento e as possíveis dores",
              "Fazer a abordagem inicial com linguagem estratégica",
              "Oferecer reunião ou visita",
              "Registrar no funil de vendas",
            ],
            "Identificar leads, pesquisar, abordar, oferecer reunião ou visita e registrar no funil.",
          ),
          multipla(
            "Chegou um contato novo. O que você avalia para saber se vale investir tempo nele?",
            [
              "Simpatia, cargo e tempo de empresa",
              "Perfil, orçamento, demanda e urgência",
              "Apenas o tamanho da empresa",
              "O preço que o concorrente cobrou",
            ],
            1,
            "Qualificar é entender se o contato tem potencial real: perfil, orçamento, demanda e urgência.",
          ),
          vf(
            "Leads da Open podem vir de indicações, redes sociais, eventos e prospecção ativa.",
            true,
            "Todas valem. E fica mais fácil prospectar por nicho: indústrias, clínicas, franquias etc.",
          ),
          cenario(
            "Você mapeou clínicas do bairro. Uma delas está reformando a recepção, segundo o Instagram.",
            "Oi, quem fala? Estou meio ocupada.",
            "Qual abordagem inicial é estratégica e personalizada?",
            [
              "Bom dia! A Open faz fachadas, banners, adesivos, placas, troféus… Quer orçamento de alguma coisa?",
              "Oi! Estamos com promoção de lona este mês, quer aproveitar?",
              "Oi, Dra. Paula! Sou da Open, comunicação visual. Vi que a clínica está reformando a recepção — posso passar aí quinta para entender o projeto e mostrar o que fizemos em outras clínicas?",
              "Tudo bem, ligo outra hora.",
            ],
            2,
            "Abordagem inicial com tom estratégico e personalizado, já oferecendo reunião ou visita. Pesquisa prévia faz a diferença.",
          ),
        ],
      },
      {
        id: "u2-l2",
        tip:
          "Reunião boa começa antes: agenda conferida, amostras prontas e uma ideia clara da dor desse cliente. Assim você mostra só o que importa para ele.",
        title: "Antes de apresentar",
        questions: [
          multipla(
            "O que faz parte do planejamento do dia antes de uma apresentação?",
            [
              "Decorar a tabela de preços para responder rápido",
              "Consultar a agenda, deixar amostras e slides prontos e, se for visita, reservar o carro da empresa",
              "Enviar a proposta antes da reunião para ganhar tempo",
              "Chegar e improvisar conforme o cliente",
            ],
            1,
            "Agenda conferida, materiais prontos, sala ou carro reservados e horários alinhados.",
          ),
          cenario(
            "Amanhã você apresenta para uma indústria que sofre com atraso em grandes volumes de adesivos.",
            "Meu problema é prazo. Preciso de volume, e rápido.",
            "Como o estudo do cliente deve orientar a sua apresentação?",
            [
              "Mostrar todo o portfólio, de troféus a tecidos, para ele conhecer tudo",
              "Começar pelo preço, porque indústria só olha custo",
              "Focar em fachadas em ACM, que têm o maior ticket",
              "Destacar a capacidade de produção e a mesa de corte automatizada, que reduz o tempo de produção e agiliza as entregas",
            ],
            3,
            "Você estudou a dor (prazo em grandes volumes) e destacou exatamente o que resolve essa dor.",
          ),
          vf(
            "Para reunião online, basta entrar no horário: checar conexão e apresentação antes é exagero.",
            false,
            "Preparação do ambiente: online, checar a conexão e a apresentação digital; presencial, organizar amostras e equipamentos.",
          ),
          completar(
            "Antes de apresentar, analise o ___ do cliente e identifique suas possíveis ___.",
            ["segmento", "dores"],
            ["salário", "férias"],
            "Estudo do cliente: segmento (indústria, comércio, serviços, alimentício, clínica) e dores específicas.",
          ),
          multipla(
            "A reunião presencial inclui apresentar o cliente à diretoria da Open. O que fazer antes?",
            [
              "Avisar a diretoria na hora em que o cliente chegar",
              "Verificar a agenda dos diretores e a disponibilidade da sala",
              "Nada: diretor sempre dá um jeito de aparecer",
              "Pedir que o cliente espere enquanto você procura alguém",
            ],
            1,
            "Planejamento do dia: confirmar sala e a agenda de quem vai receber o cliente. Pontualidade constrói confiança.",
          ),
        ],
      },
      {
        id: "u2-l3",
        tip:
          "O objetivo do primeiro contato não é vender: é conseguir a reunião ou a visita. Atenda o que o cliente pede, mas faça as suas perguntas.",
        title: "Abordagem e convite para a visita",
        questions: [
          cenario(
            "Primeiro contato por WhatsApp com o comprador de uma rede de lojas.",
            "Me manda só a tabela de preços.",
            "Qual a melhor resposta?",
            [
              "Claro, segue o PDF com todos os preços.",
              "Mando referências, sim. Como cada projeto é sob medida, me conta: é fachada, sinalização ou adesivo? Com isso já proponho uma visita para medir e orçar certo.",
              "Não trabalhamos com tabela. Só orçamos pessoalmente.",
              "Nosso preço é o melhor da região, pode confiar.",
            ],
            1,
            "Comunicação visual é sob medida: sem entender o projeto, preço vira chute. Atenda o pedido sem abrir mão das suas perguntas.",
          ),
          multipla(
            "O que é um bom roteiro (script) de abordagem?",
            [
              "Um texto para ler igual para todos os clientes",
              "A lista de descontos autorizados",
              "Um roteiro planejado para o primeiro contato — por ligação, WhatsApp, e-mail ou visita",
              "O contrato padrão da Open",
            ],
            2,
            "Roteiro planejado, não robótico: adapte ao segmento e à dor de cada cliente.",
          ),
          vf(
            "Depois da abordagem inicial, o lead deve ser registrado no funil de vendas, mesmo que ainda não tenha pedido orçamento.",
            true,
            "Registro no funil faz parte da abordagem inicial. Sem registro, não há follow-up.",
          ),
          cenario(
            "O cliente marcou reunião para hoje às 14h e não apareceu. Uma hora depois, ele escreve:",
            "Nossa, esqueci completamente da reunião!",
            "Como responder para não perder esse cliente?",
            [
              "Sem problema. Quando puder, me chama.",
              "Poxa, fiquei te esperando uma hora. Da próxima vez, avisa.",
              "Imprevistos acontecem! Podemos reagendar? Tenho três horários esta semana e quero muito te mostrar como nossa solução pode ajudar.",
              "Tudo bem, te mando a proposta por e-mail e você vê sozinho.",
            ],
            2,
            "No-show: reagendar prontamente, com empatia, três opções de horário e reforçando o valor da reunião.",
          ),
          ordenar(
            "Ordene um bom primeiro contato",
            [
              "Apresentar-se e dizer o motivo do contato",
              "Fazer perguntas rápidas para qualificar",
              "Oferecer reunião ou visita com dia e hora",
              "Registrar no funil e confirmar o agendamento",
            ],
            "Abordagem estratégica, oferta de reunião ou visita e registro no funil.",
          ),
        ],
      },
    ],
  },

  /* ------------------------------ Unidade 3 ------------------------------ */
  {
    id: "u3",
    number: 3,
    title: "Apresentação: venda inteligente",
    description: "Roteiro da reunião, apresentação da Open, soluções e cases",
    lessons: [
      {
        id: "u3-l1",
        tip:
          "Uma reunião tem ordem: você se apresenta, entende o cliente, mostra a solução e combina o próximo passo. Pular a parte de entender é chutar.",
        title: "Roteiro da reunião",
        questions: [
          ordenar(
            "Ordene o roteiro de reunião da Open",
            [
              "Apresentação pessoal e da Open",
              "Diagnóstico com perguntas direcionadas",
              "Apresentação das soluções mais adequadas",
              "Fechamento e próximos passos",
            ],
            "Apresentação, diagnóstico, solução e fechamento: a estrutura lógica da conversa.",
          ),
          multipla(
            "Como se apresentar no começo da reunião?",
            [
              "Com modéstia: fale o mínimo de você para não parecer arrogante",
              "Pulando direto para o preço, para não tomar tempo",
              "Com autoridade: destaque sua experiência no setor e que você se mantém atualizado, conectando isso ao propósito da Open",
              "Lendo o institucional completo da empresa, slide por slide",
            ],
            2,
            "Apresente-se com autoridade, mostre que acompanha inovações e tendências e conecte sua experiência ao propósito da empresa.",
          ),
          vf(
            "Um diferencial a destacar na apresentação da Open é o portfólio completo de soluções integradas, que evita múltiplos fornecedores.",
            true,
            "Tudo em um só lugar: mais praticidade, agilidade e padronização para o cliente.",
          ),
          cenario(
            "Abertura de reunião com o gerente de marketing de uma indústria.",
            "Vocês fazem o quê, exatamente? Já tenho quem faça minhas placas.",
            "Como você apresenta a Open aqui?",
            [
              "Fazemos de tudo um pouco, é só pedir.",
              "Atendemos toda a comunicação visual em um só lugar — de projetos para indústrias a fachadas em ACM, impressão digital e sinalização. Isso te dá praticidade, agilidade e padronização com um único parceiro.",
              "Somos mais baratos do que quem faz suas placas hoje.",
              "Nosso forte é fachada; placa a gente até faz, mas não é o foco.",
            ],
            1,
            "Apresente a Open pelo diferencial que resolve dor: soluções integradas, sem precisar de vários fornecedores.",
          ),
        ],
      },
      {
        id: "u3-l2",
        tip:
          "Na reunião, o foco é entender, não empurrar. E, na hora de mostrar a solução, exemplo concreto e foto de serviço feito valem mais do que promessa.",
        title: "Objetivo da reunião e soluções",
        questions: [
          multipla(
            "Qual deve ser o seu foco na reunião com o cliente?",
            [
              "Sair com o pedido assinado, custe o que custar",
              "Não é só vender: é entender as necessidades do cliente e se posicionar como parceiro estratégico",
              "Apresentar todos os produtos do catálogo",
              "Descobrir quanto o concorrente cobra",
            ],
            1,
            "O foco não é só vender, mas entender. Demonstre interesse genuíno pelos desafios do cliente.",
          ),
          cenario(
            "Início da reunião com o dono de uma rede de restaurantes.",
            "Então, o que vocês vieram me vender?",
            "Como declarar o objetivo da reunião?",
            [
              "Vim apresentar nossa promoção de fachadas deste mês.",
              "O que o senhor quiser comprar, a gente faz.",
              "Vim deixar nosso catálogo e a tabela de preços.",
              "Hoje quero entender seus desafios de comunicação visual e mostrar como nossa experiência pode contribuir. A ideia é construir uma parceria que gere valor para o seu negócio.",
            ],
            3,
            "Assim você deixa claro que veio entender os desafios dele e construir uma parceria, não empurrar produto.",
          ),
          vf(
            "Ao apresentar soluções, vale ser genérico para não se comprometer com detalhes.",
            false,
            "Traga exemplos concretos e evite ser genérico. Imagens e vídeos de serviços executados reforçam os benefícios.",
          ),
          completar(
            "Ao apresentar soluções, traga exemplos ___ e use ___ de serviços executados para reforçar os benefícios.",
            ["concretos", "fotos"],
            ["genéricos", "boletos"],
            "A pasta de fotos de serviços executados existe para isso: mostrar, não só contar.",
          ),
          multipla(
            "O cliente busca um fornecedor de sinalização. O que apresentar?",
            [
              "Todo o portfólio, na ordem do catálogo",
              "Só a lista de preços por placa",
              "Nossas soluções de sinalização, as tecnologias de impressão e aplicação e como elas beneficiam a empresa dele",
              "Os produtos de maior margem, mesmo que não sejam sinalização",
            ],
            2,
            "Adapte a apresentação à necessidade específica do cliente e mostre como a solução atende à dor dele.",
          ),
        ],
      },
      {
        id: "u3-l3",
        tip:
          "Cliente confia mais em resultado do que em discurso. Um bom case tem o problema, o que fizemos e o antes e depois, de preferência de alguém parecido com ele.",
        title: "Cases de sucesso",
        questions: [
          multipla(
            "O que torna um case forte na apresentação?",
            [
              "Ser do maior cliente da Open, não importa o segmento",
              "Mostrar o antes e depois do projeto e, se possível, o depoimento do cliente",
              "Ter o maior valor de contrato",
              "Ser contado bem rápido, sem imagens",
            ],
            1,
            "Antes e depois + depoimento de cliente satisfeito: é assim que o case vira prova social.",
          ),
          cenario(
            "Diretor de uma rede com várias filiais, em reunião de apresentação.",
            "Tenho 12 filiais e cada fachada está de um jeito. Vocês dão conta de padronizar?",
            "Qual resposta usa um case relevante?",
            [
              "Damos conta, sim. Pode confiar.",
              "Padronizar é fácil, é só repetir o mesmo arquivo.",
              "Depende de quanto você quer pagar por loja.",
              "Atendemos uma empresa do setor automotivo com o mesmo problema: homologamos acrílico e ACM na cor Pantone da marca e padronizamos as filiais com materiais de alta durabilidade. Posso te mostrar o antes e depois?",
            ],
            3,
            "Um case com problema, solução e resultado vale muito mais do que “pode confiar”.",
          ),
          vf(
            "Case é um exemplo real de cliente atendido com excelência e funciona como prova social.",
            true,
            "Prova social: depoimentos, cases, fotos e antes/depois mostram que outras empresas confiaram na Open.",
          ),
          completar(
            "Escolha cases ___ para o cliente: de preferência do mesmo segmento ou com a mesma ___.",
            ["relevantes", "dor"],
            ["aleatórios", "idade"],
            "“Cases de sucesso relevantes”: adapte o exemplo à necessidade de quem está na sua frente.",
          ),
        ],
      },
    ],
  },

  /* ------------------------------ Unidade 4 ------------------------------ */
  {
    id: "u4",
    number: 4,
    title: "Diagnóstico do cliente",
    description: "Canvas do Cliente, perguntas de diagnóstico e visita técnica",
    lessons: [
      {
        id: "u4-l1",
        tip:
          "Coloque-se no lugar do cliente: o que ele vê, ouve e sente? O que tira o sono dele (as dores) e o que o deixaria satisfeito (os ganhos)?",
        title: "Canvas do Cliente",
        questions: [
          multipla(
            "Para que serve o Canvas do Cliente (Mapa de Empatia)?",
            [
              "Para calcular a comissão da venda",
              "Para entender percepção, dores e expectativas do cliente e personalizar apresentação e proposta",
              "Para desenhar o layout da fachada",
              "Para registrar reclamações depois da entrega",
            ],
            1,
            "Ferramenta de empatia usada no diagnóstico. Quanto mais empático você for, mais soluções de valor entrega.",
          ),
          multipla(
            "No Canvas, a pergunta “O que tira o sono do cliente?” pertence a qual elemento?",
            ["Vê", "Ouve", "Dores", "Ganhos"],
            2,
            "Dores = o que tira o sono. Ganhos = o que deixaria o cliente satisfeito.",
          ),
          cenario(
            "Cliente de indústria que precisa padronizar fachadas em várias filiais.",
            "A diretoria me cobra todo mês. Quero resolver isso de forma definitiva — e não posso errar de fornecedor.",
            "No Canvas do Cliente, o que essa fala revela?",
            [
              "Que ele só quer o menor preço",
              "Que ainda não existe uma necessidade real",
              "Ouve cobranças da diretoria, sente pressão e medo de errar; o ganho é um parceiro confiável que resolva de vez",
              "Que ele não influencia a decisão",
            ],
            2,
            "Repare: ele ouve cobranças, sente pressão e diz que quer “resolver de forma definitiva”. Isso mostra o que pesa na decisão.",
          ),
          completar(
            "No Canvas do Cliente, ___ é o que tira o sono dele e ___ é o que o deixaria satisfeito.",
            ["Dores", "Ganhos"],
            ["Vê", "Ouve"],
            "Os seis elementos: Vê, Ouve, Sente, Diz e Faz, Dores e Ganhos.",
          ),
          vf(
            "O Canvas do Cliente só serve depois da venda, para medir a satisfação.",
            false,
            "Use o mapa como guia na preparação de apresentações e propostas — antes, portanto.",
          ),
        ],
      },
      {
        id: "u4-l2",
        tip:
          "Pergunta aberta faz o cliente falar. Comece pelo problema de hoje, passe pelo fornecedor atual e chegue ao que ele espera e aonde quer chegar.",
        title: "Perguntas de diagnóstico",
        questions: [
          multipla(
            "Qual destas perguntas ajuda mais a descobrir o problema do cliente?",
            [
              "Qual é o seu orçamento máximo?",
              "Vocês fecham hoje se eu der desconto?",
              "Quais são os maiores desafios que vocês enfrentam hoje na comunicação visual da empresa?",
              "Qual é o concorrente mais barato que vocês conhecem?",
            ],
            2,
            "Pergunta aberta, focada no desafio do cliente. É a primeira da lista de diagnóstico.",
          ),
          cenario(
            "Reunião de diagnóstico com a compradora de uma rede de farmácias.",
            "Já temos um fornecedor que faz nossos adesivos.",
            "O que você pergunta em seguida?",
            [
              "Ele deve ser bem mais caro do que a gente, né?",
              "Que bom! O que vocês mais gostam nele e o que gostariam de melhorar?",
              "Então não tenho como ajudar.",
              "Fornecedor pequeno sempre atrasa, cuidado.",
            ],
            1,
            "Perguntas sobre fornecedores e processos atuais revelam onde a Open pode agregar — sem falar mal de ninguém.",
          ),
          multipla(
            "Qual pergunta ajuda a descobrir a prioridade do cliente?",
            [
              "O que é mais importante para vocês: qualidade, preço ou prazo de entrega?",
              "Vocês pagam à vista ou a prazo?",
              "Quem é o dono da empresa?",
              "Vocês conhecem a Open há quanto tempo?",
            ],
            0,
            "Saber a prioridade (qualidade, preço ou prazo) orienta toda a proposta.",
          ),
          vf(
            "Antes de apresentar as soluções, é importante aprofundar o diagnóstico: isso deixa a apresentação mais personalizada.",
            true,
            "Diagnóstico primeiro. Entender dores, desafios e objetivos é o que personaliza a apresentação.",
          ),
          ordenar(
            "Ordene os blocos de perguntas do diagnóstico, do problema ao resultado",
            [
              "Problemas e desafios atuais",
              "Fornecedores e processos atuais",
              "Necessidades e expectativas",
              "Metas e resultados esperados",
              "Oportunidades de crescimento",
            ],
            "A conversa flui melhor assim: do problema de hoje até as oportunidades futuras.",
          ),
        ],
      },
      {
        id: "u4-l3",
        tip:
          "Na visita, não basta medir. Pergunte como o problema afeta o negócio: quando o cliente enxerga o prejuízo, a solução ganha valor.",
        title: "Diagnóstico na visita técnica",
        questions: [
          cenario(
            "Visita técnica a um restaurante que abre à noite.",
            "A fachada está apagada faz uns meses, queimaram algumas lâmpadas.",
            "Qual pergunta aprofunda o diagnóstico?",
            [
              "Trocar por LED resolve. Te mando o orçamento.",
              "Normal, lâmpada fluorescente queima mesmo.",
              "E como isso tem impactado o movimento? À noite, quem passa consegue ver que vocês estão abertos?",
              "Quantos metros tem a fachada?",
            ],
            2,
            "“Como a falta de uma solução eficiente tem impactado o seu negócio?” Quando o cliente enxerga o impacto, a solução ganha valor.",
          ),
          multipla(
            "Qual pergunta identifica oportunidades de crescimento?",
            [
              "Vocês conseguem pagar à vista?",
              "Além da demanda atual, existe algum projeto futuro em que poderíamos atuar juntos?",
              "Quem aprovou o fornecedor anterior?",
              "Vocês têm o arquivo do logotipo?",
            ],
            1,
            "Essas perguntas abrem a porta para novos projetos, cross-selling e soluções como LED e impressão UV.",
          ),
          cenario(
            "Lead de uma loja de móveis quer orçamento de fachada em ACM sem visita.",
            "Não precisa vir medir, a fachada tem uns 8 metros. Faz o orçamento por isso.",
            "Qual a melhor resposta?",
            [
              "Beleza, faço por 8 metros e depois a gente acerta a diferença.",
              "Sem medição não faço nem estimativa.",
              "Consigo te passar uma estimativa, mas para orçar certo e evitar retrabalho preciso medir e ver estrutura, energia e acesso. Posso passar aí amanhã às 9h ou quinta às 15h?",
              "Então me manda as medidas exatas por escrito e a responsabilidade é sua.",
            ],
            2,
            "Na Open a proposta depende da medição. Explique o porquê (orçamento certo, sem retrabalho) e ofereça dois horários.",
          ),
          vf(
            "Perguntar se o cliente já tem um projeto definido ou precisa de apoio para criar um faz parte do diagnóstico.",
            true,
            "Está na lista de Necessidades e Expectativas — e muda o escopo: só produção ou criação + produção.",
          ),
          completar(
            "Pergunte se o cliente tem uma ___ específica para o projeto e qual o ___ ideal para a implementação.",
            ["meta", "prazo"],
            ["mágoa", "brinde"],
            "Metas e resultados esperados: visibilidade da marca, sinalização interna, redução de custo de manutenção — e o prazo ideal.",
          ),
        ],
      },
    ],
  },

  /* ------------------------------ Unidade 5 ------------------------------ */
  {
    id: "u5",
    number: 5,
    title: "Proposta, cross e up-selling",
    description: "Proposta comercial com diferenciais e como ampliar a solução",
    lessons: [
      {
        id: "u5-l1",
        tip:
          "Proposta boa conta uma história: o que você entendeu, a solução, o benefício e só então o investimento. Preço sem contexto parece caro.",
        title: "Proposta comercial e diferenciais",
        questions: [
          ordenar(
            "Ordene os elementos essenciais da proposta comercial",
            [
              "Resumo das necessidades do cliente",
              "Detalhamento da solução: materiais, prazos e escopo",
              "Benefícios e impacto da solução",
              "Investimento e formas de pagamento",
              "Garantia e suporte",
            ],
            "Necessidades, solução, benefícios, investimento e garantia: o preço só aparece depois do valor.",
          ),
          multipla(
            "Por que a proposta começa com o resumo das necessidades do cliente?",
            [
              "Para a proposta ficar mais longa",
              "Para reforçar que entendemos o problema antes de falar da solução",
              "Porque o sistema exige esse campo",
              "Para justificar um preço mais alto",
            ],
            1,
            "O resumo reforça o entendimento do problema — e conecta cada item da solução a uma dor real.",
          ),
          cenario(
            "Você entrega a proposta pessoalmente ao dono de uma academia.",
            "Pode deixar a proposta aí que depois eu olho.",
            "Qual a melhor condução?",
            [
              "Claro, fico no aguardo.",
              "Então nem adianta deixar, né?",
              "Deixo, sim. Antes, podemos revisar juntos os pontos principais agora e alinhar os próximos passos? Leva cinco minutos.",
              "Se olhar ainda hoje, dou 10% de desconto.",
            ],
            2,
            "Entregou pessoalmente? Revise os pontos principais junto com o cliente e já alinhe os próximos passos.",
          ),
          vf(
            "A proposta deve focar na valorização da solução, evidenciando benefícios e diferenciais que justifiquem o investimento.",
            true,
            "Clara, objetiva e persuasiva: benefícios como redução de custos, durabilidade e eficiência vêm antes do investimento.",
          ),
          cenario(
            "Você já enviou duas versões do layout da fachada de uma hamburgueria.",
            "Gostei, mas faz mais umas cinco opções de layout pra eu escolher?",
            "Qual a melhor resposta?",
            [
              "Claro! Peço para a criação mandar mais cinco até amanhã.",
              "Não fazemos mais do que duas versões.",
              "Versão extra, só pagando à parte.",
              "Consigo ajustar, sim. Para acertar de primeira: o que você manteria e o que mudaria nessas duas? Com isso fecho uma versão final junto com a proposta.",
            ],
            3,
            "Versões sem critério viram retrabalho infinito. Volte ao diagnóstico — o que agradou, o que falta — e conduza para a versão final.",
          ),
        ],
      },
      {
        id: "u5-l2",
        tip:
          "Cross-selling é completar a solução: quem fez a fachada pode precisar da sinalização interna. Só ofereça o que faz sentido para aquele cliente.",
        title: "Cross-selling",
        questions: [
          multipla(
            "Quais são os bons momentos para oferecer um produto complementar (cross-selling)?",
            [
              "Só quando o cliente pedir desconto",
              "Apenas no primeiro contato, antes do diagnóstico",
              "Na apresentação da proposta, após o fechamento do pedido principal ou ao identificar novas necessidades no diagnóstico",
              "Somente depois de um ano de relacionamento",
            ],
            2,
            "Três momentos: na proposta, depois do fechamento do pedido principal e quando o diagnóstico revela novas necessidades.",
          ),
          cenario(
            "Uma concessionária acabou de aprovar a fachada.",
            "Fechado, pode fazer a fachada em ACM.",
            "Como oferecer algo a mais sem empurrar produto?",
            [
              "Perfeito, já mando o contrato. Obrigado!",
              "Aproveita e leva também troféus, uniformes e brindes, está tudo em oferta.",
              "Se quiser mais alguma coisa, é só chamar.",
              "Ótimo! Muitos clientes que fizeram fachada como a sua também pediram a sinalização interna para manter o padrão visual e evitar múltiplos fornecedores. Quer que eu inclua essa sugestão para análise?",
            ],
            3,
            "A sugestão faz sentido real para o cliente e vem apoiada no que outros clientes fizeram.",
          ),
          multipla(
            "Seu cliente é uma indústria. Qual oferta complementar faz mais sentido?",
            [
              "Neon LED decorativo para o refeitório",
              "Soluções de segurança visual: placas de orientação, sinalização de risco e etiquetas técnicas",
              "Troféus para a equipe de vendas",
              "Banners promocionais de vitrine",
            ],
            1,
            "Ofereça o que faz sentido real para o segmento: na indústria, segurança visual.",
          ),
          vf(
            "Cross-selling é empurrar o máximo de produtos enquanto o cliente está animado.",
            false,
            "“Cross-selling não é empurrar produto. É ampliar a solução com inteligência e cuidado.”",
          ),
          completar(
            "Cross-selling bem feito aumenta o ___ médio e entrega uma solução mais ___ ao cliente.",
            ["ticket", "completa"],
            ["desconto", "barata"],
            "Aumenta o ticket médio, melhora a experiência e fortalece a percepção de valor da Open.",
          ),
        ],
      },
      {
        id: "u5-l3",
        tip:
          "Up-selling é mostrar uma opção melhor do que a pedida, mais durável ou mais bonita, e deixar o cliente comparar. É vender o melhor, não o mais caro.",
        title: "Up-selling",
        questions: [
          multipla(
            "O que é up-selling?",
            [
              "Oferecer um produto complementar de outra categoria",
              "Oferecer uma versão mais completa, premium ou vantajosa do que o cliente já está considerando",
              "Cobrar a mais pela instalação",
              "Vender para a matriz depois de vender para a filial",
            ],
            1,
            "Quando bem-feito, o cliente percebe o up-selling como melhoria da solução, não como “vender a mais”.",
          ),
          cenario(
            "Escritório de contabilidade reformando a recepção.",
            "Quero só uma impressão simples para o painel da recepção.",
            "Como mostrar uma opção melhor sem forçar?",
            [
              "Impressão simples fica feio, não recomendo.",
              "Certo, impressão simples então.",
              "Faço, sim. Quer ver também uma opção com acabamento UV e corte especial? O impacto visual é bem maior e te mostro a diferença de valor lado a lado.",
              "Leve o projeto completo de ambientação, é o que todo mundo faz.",
            ],
            2,
            "Cliente pediu impressão simples? Sugira acabamento UV, corte especial ou relevo — comparando opções pelo valor agregado.",
          ),
          vf(
            "Up-selling é vender o melhor para o cliente, não necessariamente o mais caro.",
            true,
            "“É vender o melhor, e não o mais caro”: mais resultado com uma escolha mais inteligente.",
          ),
          multipla(
            "Como aplicar up-selling com inteligência?",
            [
              "Esconder a opção mais simples",
              "Mostrar o benefício de longo prazo da versão superior, comparar opções pelo valor agregado e usar provas sociais",
              "Dizer que a opção básica está em falta",
              "Oferecer só depois que o cliente pagar",
            ],
            1,
            "Benefício de longo prazo, comparação com foco em valor e exemplos reais.",
          ),
          cenario(
            "Escritório de advocacia mudando para uma sede nova.",
            "Sinalização interna básica já resolve.",
            "Qual oferta melhora o que ele já quer (up-selling)?",
            [
              "Adesivação da frota de veículos",
              "Um desconto de 10% na sinalização básica",
              "Um projeto completo de ambientação visual, com layout exclusivo e materiais de alto padrão",
              "Nenhuma: se ele pediu básico, é básico",
            ],
            2,
            "Sinalização básica → projeto completo de ambientação visual. Frota seria cross-selling.",
          ),
        ],
      },
    ],
  },

  /* ------------------------------ Unidade 6 ------------------------------ */
  {
    id: "u6",
    number: 6,
    title: "Quebra de objeções",
    description: "Como responder às resistências mais comuns do cliente",
    lessons: [
      {
        id: "u6-l1",
        tip:
          "“Está caro” quase nunca é sobre preço: é sobre um valor que ainda não ficou claro. Reforce o que o cliente ganha antes de falar em condição.",
        title: "“Está caro!”",
        questions: [
          cenario(
            "Dono de uma padaria olhando a proposta de fachada com letra caixa iluminada.",
            "Está caro! Passou do meu orçamento.",
            "Qual resposta reforça o valor agregado?",
            [
              "Consigo 15% de desconto agora mesmo.",
              "Entendo sua preocupação. Mas é um investimento: com a durabilidade do material e a qualidade da execução, você reduz manutenção e evita refazer. Já calculou quanto economiza sem retrabalho e substituições?",
              "Caro? Nosso preço é justo, pode pesquisar.",
              "Então vamos trocar tudo por lona, que é mais barato.",
            ],
            1,
            "Primeiro, valor: não é custo, é investimento que reduz manutenção e dá retorno a longo prazo.",
          ),
          cenario(
            "Gerente de uma loja de calçados comparando orçamentos.",
            "A gráfica rápida da esquina faz pela metade do preço.",
            "Como comparar com a alternativa mais barata?",
            [
              "Aquela gráfica só faz serviço ruim.",
              "Eu cubro o preço deles.",
              "Então fecha com eles e depois me conta.",
              "Já atendi empresas que escolheram a opção mais barata e, meses depois, precisaram refazer o projeto. Nosso diferencial está na qualidade, no acabamento e na durabilidade: vale investir um pouco mais agora para não gastar de novo depois.",
            ],
            3,
            "Compare com alternativas de menor qualidade sem atacar o concorrente: fale de quem precisou refazer.",
          ),
          multipla(
            "E se o investimento for mesmo o ponto crítico para o cliente?",
            [
              "Dar o desconto máximo logo de cara",
              "Encerrar a negociação",
              "Verificar com o gerente a possibilidade de um ajuste ou de uma condição de pagamento mais viável",
              "Reduzir a qualidade do material sem avisar",
            ],
            2,
            "Depois de reforçar valor, dá para oferecer condição especial — verificando com o gerente e mantendo a margem.",
          ),
          vf(
            "Preço é sempre relativo ao valor entregue: por isso, diante de “está caro”, o primeiro passo é reforçar o valor agregado.",
            true,
            "“Negociar não é brigar por preço. É alinhar valor percebido com a dor real.”",
          ),
          ordenar(
            "O cliente disse “está caro”. Em que ordem você conduz?",
            [
              "Ouvir com atenção e entender a raiz da objeção",
              "Reforçar o valor agregado: investimento, não custo",
              "Comparar com alternativas de menor qualidade",
              "Se preciso, verificar com o gerente uma condição especial",
            ],
            "Ouça, reforce valor, compare e só então fale de condição. Consultivo, não agressivo.",
          ),
        ],
      },
      {
        id: "u6-l2",
        tip:
          "“Vou pensar” costuma esconder uma dúvida. E, quando há sócio na decisão, o melhor é você mesmo apresentar para ele.",
        title: "“Vou pensar” e “preciso falar com meu sócio”",
        questions: [
          cenario(
            "Fim da apresentação da proposta para a dona de uma clínica de estética.",
            "Vou pensar e te retorno.",
            "Qual resposta descobre a verdadeira objeção?",
            [
              "Tudo bem, fico no aguardo.",
              "Pensar o quê? A proposta está ótima.",
              "Ótimo, faz todo sentido avaliar bem. Só para entender melhor: tem algo específico te deixando em dúvida? Assim eu esclareço e você toma a melhor decisão.",
              "Se não fechar agora, não garanto mais nada.",
            ],
            2,
            "“Vou pensar” costuma esconder uma dúvida. Valide e pergunte o que falta esclarecer.",
          ),
          multipla(
            "Que outra saída você tem para “vou pensar e te retorno”?",
            [
              "Parar de responder até o cliente voltar",
              "Lembrar que a condição especial vale até uma data e que dá para garantir agora o valor e a prioridade na produção",
              "Dizer que o preço vai dobrar amanhã",
              "Reenviar a mesma proposta, sem comentário",
            ],
            1,
            "São três saídas: criar senso de urgência com uma condição com data, descobrir a verdadeira objeção ou reforçar a experiência de outros clientes.",
          ),
          cenario(
            "Sócia de uma rede de óticas gostou do projeto de fachadas.",
            "Preciso falar com meu sócio antes de decidir.",
            "Como transformar a objeção em oportunidade?",
            [
              "Sem problema, me avisa quando ele decidir.",
              "Mas você não tem autonomia para decidir?",
              "Se ele demorar, vocês perdem a vaga na produção.",
              "Ótimo! Como é uma decisão importante, faz sentido envolver todos. Podemos marcar uma apresentação exclusiva para o seu sócio? Assim esclareço as dúvidas e ele vê o valor da solução.",
            ],
            3,
            "Proponha uma apresentação exclusiva para o sócio ou diretor: ninguém vende a sua solução melhor do que você.",
          ),
          multipla(
            "Se não for possível falar direto com o sócio, o que oferecer?",
            [
              "Um resumo com os principais benefícios e diferenciais, perguntando quais pontos o sócio mais consideraria",
              "Um desconto para ele decidir sozinho",
              "Nada: é só aguardar",
              "A proposta completa de novo, sem mudanças",
            ],
            0,
            "Antecipe as dúvidas: entregue um resumo e descubra o que pesa para quem decide.",
          ),
          vf(
            "Quando a decisão passa por mais uma pessoa, não dá para adiantar nada: o jeito é esperar.",
            false,
            "Dá para adiantar os detalhes, deixar tudo alinhado e até conversar com o sócio ou diretor sobre pontos técnicos.",
          ),
        ],
      },
      {
        id: "u6-l3",
        tip:
          "Cliente que já tem fornecedor não é porta fechada: pergunte o que poderia ser melhor. E, se não for o momento, combine quando retomar.",
        title: "“Já tenho fornecedor” e “agora não é o momento”",
        questions: [
          cenario(
            "Prospecção ativa em uma rede de supermercados.",
            "Já trabalho com outro fornecedor.",
            "Como você responde?",
            [
              "Mas a gente é melhor do que ele.",
              "Que bom, isso mostra que você valoriza a comunicação visual da empresa. Posso perguntar: há algo que poderia ser melhor no serviço que você recebe hoje?",
              "Entendi. Desculpa o incômodo.",
              "Quanto ele cobra? Eu faço por menos.",
            ],
            1,
            "Valorize a escolha do cliente e pergunte o que poderia ser melhor. O objetivo é agregar, não substituir à força.",
          ),
          multipla(
            "Qual é um bom jeito de entrar em um cliente que já tem fornecedor?",
            [
              "Pedir exclusividade logo no primeiro pedido",
              "Propor um projeto menor, para ele conhecer nossa qualidade e atendimento na prática",
              "Oferecer o primeiro serviço de graça",
              "Esperar o fornecedor atual errar",
            ],
            1,
            "Teste ou solução complementar: começar pequeno e deixar a qualidade abrir a parceria.",
          ),
          cenario(
            "Construtora adiando a sinalização de um empreendimento.",
            "Agora não é o melhor momento.",
            "Qual resposta descobre o real motivo?",
            [
              "Tudo bem, te procuro no ano que vem.",
              "Mas o momento é agora, depois fica mais caro!",
              "Então vou cancelar a proposta.",
              "Entendo! Posso perguntar o que faz com que este não seja o momento ideal? Talvez dê para ajustar algo para a solução fazer sentido agora.",
            ],
            3,
            "Descubra o motivo real antes de qualquer coisa; depois dá para mostrar o custo da inação.",
          ),
          multipla(
            "Se realmente não for o momento, qual é o seu próximo passo?",
            [
              "Insistir todos os dias até o cliente mudar de ideia",
              "Marcar o lead como perdido",
              "Deixar um planejamento pronto e combinar quando retomar a conversa",
              "Baixar o preço até ele aceitar",
            ],
            2,
            "Crie um plano futuro: “quando faria mais sentido retomar?” — e registre a data no CRM.",
          ),
          completar(
            "Para quebrar objeções, seja ___, não agressivo: ajude o cliente a enxergar a melhor ___.",
            ["consultivo", "decisão"],
            ["insistente", "desculpa"],
            "Ouvir antes de responder, usar perguntas estratégicas, reforçar valor e criar urgência — sempre consultivo.",
          ),
        ],
      },
    ],
  },

  /* ------------------------------ Unidade 7 ------------------------------ */
  {
    id: "u7",
    number: 7,
    title: "Follow-up, urgência e fechamento",
    description: "Cadência dia 1, 3 e 7, urgência sem pressão e o “sim” formal",
    lessons: [
      {
        id: "u7-l1",
        tip:
          "A maioria das vendas fecha no acompanhamento. Um ritmo que funciona: no dia 1, confirmar o recebimento; no dia 3, reforçar o valor; no dia 7, dar um motivo para decidir.",
        title: "Follow-up estruturado",
        questions: [
          ordenar(
            "Ordene o follow-up estruturado depois de enviar a proposta",
            [
              "Dia 1: confirmar o recebimento da proposta",
              "Dia 3: reforçar o valor e oferecer ajustes",
              "Dia 7: senso de urgência com benefício adicional",
            ],
            "Dia 1 confirmação, dia 3 reforço, dia 7 urgência. Consistência e personalização são a chave.",
          ),
          multipla(
            "Em quais momentos vale fazer follow-up?",
            [
              "Só quando o cliente pedir retorno",
              "Após envio de proposta, reunião com dúvidas em aberto, objeção apresentada ou no-show",
              "Apenas no fim do mês, para bater a meta",
              "Somente depois da entrega do pedido",
            ],
            1,
            "A maioria das vendas não fecha no primeiro contato: é no acompanhamento que o cliente amadurece a decisão.",
          ),
          cenario(
            "Dia 3 após o envio da proposta de sinalização para uma escola.",
            "Recebi, sim. Ainda não consegui olhar com calma.",
            "Qual mensagem você manda?",
            [
              "E aí, alguma novidade?",
              "Preciso de uma resposta hoje, por favor.",
              "Sem problema! Posso te ajudar com alguma dúvida ou ajuste para facilitar sua decisão? Te mando também o antes e depois de um projeto parecido.",
              "Tudo bem. Quando decidir, me avisa.",
            ],
            2,
            "Dia 3 é reforço de valor e oferta de ajustes. Uma boa dica: envie um case, depoimento ou vídeo que ajude a decidir.",
          ),
          vf(
            "Um bom follow-up não é insistente, é útil: reforça o valor da proposta, tira dúvidas e demonstra interesse genuíno.",
            true,
            "É uma das etapas mais negligenciadas — e uma das mais poderosas.",
          ),
          cenario(
            "Orçamento de fachada enviado há 20 dias, parado no CRM (Holdprint) sem próxima tarefa. Você liga.",
            "Ah, acabei deixando pra depois.",
            "Como retomar?",
            [
              "Poxa, o orçamento já venceu. Vai ter que pedir outro.",
              "Sem problema! Mudou alguma coisa no projeto? Te mando um case de fachada parecida e, se fizer sentido, atualizo a proposta. Posso te ligar amanhã às 10h?",
              "Se fechar hoje ainda, mantenho o preço antigo.",
              "Ok, vou encerrar o orçamento então.",
            ],
            1,
            "Retome gerando valor, atualize a proposta e nunca deixe um orçamento sem próxima ação agendada no CRM.",
          ),
        ],
      },
      {
        id: "u7-l2",
        tip:
          "Urgência boa é um benefício real por decidir agora: uma condição com data, um prazo de entrega garantido. Pressão só afasta.",
        title: "Geração de urgência",
        questions: [
          multipla(
            "Gerar urgência do jeito certo é…",
            [
              "Pressionar: “tem que fechar agora”",
              "Mostrar um benefício real de fechar naquele momento, como condição especial ou prazo garantido",
              "Ligar várias vezes ao dia até o cliente decidir",
              "Dizer que o material vai acabar, mesmo que não vá",
            ],
            1,
            "Urgência não significa pressionar: é mostrar um benefício real de decidir agora.",
          ),
          cenario(
            "A empresa ainda não atingiu o ponto de equilíbrio (P.E.) do mês.",
            "Gostei da proposta, mas não tenho pressa.",
            "Como você cria urgência aqui, sem pressionar?",
            [
              "Tem que fechar agora, senão perde.",
              "Sem pressa. Quando quiser, me chama.",
              "Amanhã o preço sobe 30%.",
              "Se fecharmos até sexta-feira, consigo garantir um desconto exclusivo de 10% e prioridade na produção, o que antecipa a sua entrega.",
            ],
            3,
            "Antes do P.E., a Open trabalha com condição com data: desconto exclusivo e prioridade na produção para quem fecha até sexta.",
          ),
          multipla(
            "Depois que a empresa atingiu o P.E., como fica o desconto?",
            [
              "Pode dar 10% livremente até sexta",
              "É proibido falar em qualquer condição",
              "Não é automático: depende de liberação do gerente e só vale se o cliente der o OK para fechar hoje",
              "O vendedor decide sozinho qualquer desconto abaixo da margem",
            ],
            2,
            "Após o P.E., desconto abaixo da margem é exceção: você busca a liberação com o gerente, condicionada ao fechamento no dia.",
          ),
          vf(
            "O gatilho de escassez se baseia na limitação de tempo ou de quantidade para incentivar uma decisão rápida.",
            true,
            "Isso mesmo. Só vale com limite real, em tom consultivo: urgência sem parecer forçado.",
          ),
          completar(
            "Para reforçar a urgência sem forçar, inclua um ___ adicional, como prazo de entrega diferenciado ou ___ facilitado.",
            ["benefício", "pagamento"],
            ["susto", "silêncio"],
            "Prazo de entrega diferenciado ou pagamento facilitado reforçam a exclusividade da condição.",
          ),
        ],
      },
      {
        id: "u7-l3",
        tip:
          "Na hora de fechar, pergunte com naturalidade: “faz sentido avançarmos?” ou “começamos esta semana ou na próxima?”. Depois, oficialize pelo link de aprovação.",
        title: "Fechamento e aceite formal",
        questions: [
          multipla(
            "Qual destas é uma pergunta de sinalização de fechamento?",
            [
              "Você quer comprar ou não?",
              "Faz sentido para você avançarmos com essa solução?",
              "Posso te ligar no mês que vem?",
              "Quer que eu refaça o orçamento do zero?",
            ],
            1,
            "Perguntas de fechamento guiam o cliente: “Faz sentido avançarmos?”, “Você vê algum obstáculo para o próximo passo?”",
          ),
          multipla(
            "O que é a Técnica da Escolha?",
            [
              "Deixar o cliente escolher o desconto",
              "Perguntar qual opção o cliente prefere, em vez de “você quer comprar?”",
              "Escolher pelo cliente para ganhar tempo",
              "Oferecer só uma opção para não confundir",
            ],
            1,
            "“Prefere a versão A ou B?” “Iniciamos a produção esta semana ou na próxima?” Tira a pressão da decisão.",
          ),
          cenario(
            "Cliente de uma franquia de açaí, quase decidindo.",
            "Gostei, só estou na dúvida sobre o prazo de instalação.",
            "Que pergunta ajuda o cliente a decidir agora?",
            [
              "Fica tranquilo, prazo a gente vê depois.",
              "Então pensa mais um pouco e me fala.",
              "Se eu resolver esse último ponto, podemos fechar agora?",
              "Prazo é com a produção, não comigo.",
            ],
            2,
            "Diante da hesitação, isole o último ponto: “Se eu resolver isso, podemos fechar agora?”",
          ),
          cenario(
            "Cliente aprovou verbalmente o projeto de letreiro.",
            "Fechado! Como faço pra confirmar?",
            "Como oficializar o fechamento?",
            [
              "Pode deixar, sua palavra basta. Já mando produzir.",
              "Me manda um áudio dizendo que aprovou.",
              "Semana que vem eu passo aí pra gente formalizar.",
              "Pra dar início à produção, preciso que você aprove a proposta no link que te enviei. Assim que confirmar, seu serviço já entra na programação.",
            ],
            3,
            "Aceite formal: o cliente aprova o orçamento direto no sistema, pelo link. Só então entra na programação da produção.",
          ),
          vf(
            "Em empresas grandes, o aceite formal pode exigir identificar o setor de compras e pedir a formalização por pedido oficial.",
            true,
            "Identifique o setor de compras e solicite o pedido oficial — com modelo, quando necessário.",
          ),
        ],
      },
    ],
  },

  /* ------------------------------ Unidade 8 ------------------------------ */
  {
    id: "u8",
    number: 8,
    title: "Gestão de crise e indicação",
    description: "Cliente insatisfeito, crises públicas, avaliações e indicações",
    lessons: [
      {
        id: "u8-l1",
        tip:
          "Quando algo dá errado, o cliente quer ser ouvido e saber o que vai acontecer. Chame pelo nome e diga como, quando e quem vai resolver.",
        title: "Quando o cliente está insatisfeito",
        questions: [
          cenario(
            "João, cliente de uma autopeças, liga irritado depois da instalação.",
            "Vocês erraram a cor do meu letreiro! Isso é um absurdo!",
            "Qual resposta segue a gestão de crise da Open?",
            [
              "Se acalme, senhor, vamos resolver.",
              "João, entendo totalmente o impacto disso. Me deixa cuidar disso contigo agora, da melhor forma possível.",
              "Foi a produção que errou, não fui eu.",
              "Isso nunca aconteceu antes aqui.",
            ],
            1,
            "Escute com atenção e use sempre o nome do cliente. As outras três são frases proibidas.",
          ),
          multipla(
            "Qual destas frases é PROIBIDA na gestão de crise?",
            [
              "Independente de onde foi a falha, estou aqui contigo pra resolver isso agora.",
              "Entendo sua frustração. Já estamos agindo pra resolver o quanto antes.",
              "Estamos fazendo o possível.",
              "Sua nova peça entra em produção amanhã às 9h.",
            ],
            2,
            "“Estamos fazendo o possível” soa genérico e vazio. O cliente quer saber como, quando e quem.",
          ),
          vf(
            "Se o cliente gritar ou ultrapassar os limites do respeito, o vendedor deve sustentar a conversa sozinho até o fim.",
            false,
            "Você não precisa manter uma conversa agressiva sozinho: acione um gestor ou a liderança, com calma, para continuar o atendimento.",
          ),
          multipla(
            "O que é um plano de ação claro e realista?",
            [
              "“Vamos resolver o mais rápido possível.”",
              "“Estamos vendo isso internamente.”",
              "“O que você quer que eu faça agora?”",
              "“Sua nova peça entra em produção amanhã às 9h e segue até quinta; assim que despachar, te envio o rastreio.”",
            ],
            3,
            "Não diga só “vamos resolver”: diga como, quando e quem vai resolver.",
          ),
          multipla(
            "O novo prazo prometido não vai ser cumprido. O que fazer?",
            [
              "Esperar o cliente cobrar para explicar",
              "Avisar antes, com humildade e clareza, já com o novo plano e acompanhamento pessoal",
              "Pedir para outra pessoa dar a notícia",
              "Entregar atrasado sem comentar",
            ],
            1,
            "Nunca espere o cliente cobrar: antecipe o aviso, seja transparente e reforce o acompanhamento.",
          ),
        ],
      },
      {
        id: "u8-l2",
        tip:
          "Em reclamação pública, respire: nunca responda no impulso nem peça para apagar. Avise a liderança, registre tudo e resolva de verdade.",
        title: "Boa vontade e crises públicas",
        questions: [
          multipla(
            "Depois de uma falha nossa, o que é um bom “gesto de boa vontade”?",
            [
              "Um desconto no próximo pedido",
              "Uma demonstração de valorização — brinde, frete grátis, item extra sem custo ou cartão de desculpas",
              "Devolver todo o valor pago",
              "Um pedido formal de desculpas da diretoria",
            ],
            1,
            "Não se trata de dar desconto: é sobre demonstrar valorização e respeito à confiança do cliente.",
          ),
          multipla(
            "Um cliente deixou 1 estrela no Google. Qual é o primeiro passo?",
            [
              "Responder na hora explicando que ele está errado",
              "Pedir que ele apague a avaliação",
              "Copiar o link e enviar ao gestor imediatamente",
              "Ignorar: avaliação ruim some com o tempo",
            ],
            2,
            "Mantenha a calma, acione um responsável e documente. A resposta pública deve ser madura e empática.",
          ),
          vf(
            "Depois de resolver o problema, vale pedir com jeitinho que o cliente apague o comentário negativo.",
            false,
            "Nunca peça para apagar: soa como censura. Resolva a dor de verdade — o cliente pode atualizar a avaliação espontaneamente.",
          ),
          cenario(
            "Marina, cliente de uma loja de decoração, escreve no WhatsApp após um atraso.",
            "Vou processar vocês e acabar com a reputação dessa empresa!",
            "Como você responde a Marina?",
            [
              "Pode até processar, mas estamos certos.",
              "Calma, não precisa disso tudo.",
              "Então vou apagar essa conversa e encerramos por aqui.",
              "Marina, entendo sua insatisfação e lamento que tenhamos chegado a esse ponto. Já estou registrando seu caso e um responsável direto da empresa vai entrar em contato para resolvermos da melhor maneira.",
            ],
            3,
            "Tom consultivo, nunca jurídico. Registre, acione a liderança e nunca apague mensagens.",
          ),
          completar(
            "Em uma crise pública, nunca reaja no ___; documente tudo com prints e mantenha o tom ___, nunca jurídico.",
            ["impulso", "consultivo"],
            ["prazo", "irônico"],
            "Mais importante do que estar certo é ser lembrado como alguém que resolveu com respeito e profissionalismo.",
          ),
        ],
      },
      {
        id: "u8-l3",
        tip:
          "O melhor momento para pedir indicação é quando o cliente elogia. Aproveite e peça também a avaliação no Google.",
        title: "Indicação e avaliações",
        questions: [
          multipla(
            "Quando pedir uma indicação?",
            [
              "No primeiro contato, antes de apresentar a Open",
              "Durante a negociação de preço",
              "Após feedback positivo, elogio espontâneo ou conclusão bem-sucedida de um projeto",
              "Logo depois de uma reclamação resolvida pela metade",
            ],
            2,
            "Peça quando o cliente demonstra satisfação: clientes satisfeitos e leais indicam mais.",
          ),
          cenario(
            "Uma semana após a instalação da fachada de uma pet shop.",
            "Ficou lindo! Todo mundo está elogiando a fachada nova.",
            "Qual é o melhor próximo passo?",
            [
              "Que bom! Qualquer coisa, estamos aí.",
              "Que bom, fico muito feliz! Conhece mais alguém que poderia se beneficiar de uma solução assim? E, se puder avaliar nosso trabalho no Google, ajuda muito — leva menos de 1 minuto.",
              "Ótimo. Então já posso mandar o orçamento da frota?",
              "Obrigado! Posta e marca a gente, senão não vale.",
            ],
            1,
            "Elogio espontâneo é a hora certa: “Conhece mais alguém que poderia se beneficiar?” + pedido de avaliação no Google.",
          ),
          ordenar(
            "Ordene a coleta de avaliação no Google",
            [
              "Concluir a entrega do projeto",
              "Confirmar que o cliente está satisfeito",
              "Enviar o link direto com uma mensagem amigável",
              "Relembrar com cordialidade após 3 dias sem avaliação",
            ],
            "Só peça a avaliação depois de confirmar a satisfação; se não vier em 3 dias, relembre com tom cordial.",
          ),
          vf(
            "Ao receber uma indicação, registre quem indicou e quem foi indicado — e agradeça e retribua.",
            true,
            "Registro e acompanhamento fecham o ciclo da indicação.",
          ),
          multipla(
            "Como incentivar o cliente a indicar a Open?",
            [
              "Cobrando a indicação como condição da garantia",
              "Com brinde, desconto ou prioridade em pedidos futuros",
              "Pedindo a lista de contatos do cliente",
              "Não incentivando: indicação tem que ser espontânea",
            ],
            1,
            "Recompensas, descontos ou brindes motivam o cliente a indicar.",
          ),
        ],
      },
    ],
  },
];

/**
 * Versão da trilha. SUBA este valor sempre que adicionar unidades ou lições
 * (ex.: "consultiva-2025.2"): quando o vendedor concluir a nova última
 * unidade, um novo aviso de conclusão é enviado ao gestor para essa versão.
 */
export const TRAIL_VERSION = "vendas-produtos-2026.2";

/* ------------------------------ Montagem ---------------------------------- */

/** Desafio da unidade: 2 questões de cada lição, alternando as posições */
const buildChallenge = (unit: UnitSeed): Lesson => {
  // unidades longas contribuem com 1 questão por lição, para o desafio não ficar extenso
  const perLesson = unit.lessons.length > 4 ? 1 : 2;
  const questions: Question[] = unit.lessons.flatMap((lesson, i) =>
    lesson.questions.filter((_, qi) => qi % 2 === i % 2).slice(0, perLesson),
  );
  return {
    id: `${unit.id}-desafio`,
    title: `Desafio da unidade ${unit.number}`,
    tip: "Hora de juntar o que você praticou nesta unidade. Vale errar: cada explicação é uma dica para a próxima visita.",
    kind: "desafio",
    questions,
  };
};

const buildUnits = (list: UnitSeed[]): Unit[] =>
  list.map((seed) => ({
    ...seed,
    // todas as unidades usam o rosa Open (tokens farol.accent / accent-dark)
    color: "#ff0084",
    shade: "#c4006a",
    lessons: [
      ...seed.lessons.map((l) => ({ ...l, kind: "licao" as const })),
      buildChallenge(seed),
    ],
  }));

/**
 * Ordem da trilha: as unidades de produto (m…) ficam intercaladas com as de
 * venda (u…), para o vendedor aprender a técnica e o produto juntos.
 * Para mudar a ordem ou incluir uma unidade nova, edite esta lista.
 */
const ORDEM = ["u1", "u2", "m1", "u3", "u4", "m2", "u5", "u6", "m3", "u7", "u8", "m4"];

const todas: UnitSeed[] = [
  ...seeds.map((u) => ({ ...u, tema: "vendas" as const })),
  ...materiaisSeeds.map((u) => ({ ...u, tema: "produto" as const })),
];

const emOrdem: UnitSeed[] = [
  ...ORDEM.flatMap((id) => todas.filter((u) => u.id === id)),
  // unidade nova que ainda não entrou em ORDEM vai para o fim, em vez de sumir
  ...todas.filter((u) => !ORDEM.includes(u.id)),
].map((u, i) => ({ ...u, number: i + 1 }));

/** Unidades da trilha, já na ordem e numeradas */
const baseUnits: Unit[] = buildUnits(emOrdem);
export const units: Unit[] = [...baseUnits];

/** Linhas de treino disponíveis (hoje, uma só, com vendas e produto intercalados) */
export const linhas: Linha[] = [
  {
    id: "consultiva",
    title: "Vendas e Produtos",
    description:
      "Aprenda a vender praticando: técnica de venda e conhecimento de produto lado a lado, com situações reais de comunicação visual, em lições de 3 minutos.",
    fontes: [
      "Playbook Vendas Open 2025",
      "venda consultiva e SPIN Selling (onde o playbook é silencioso)",
      "conhecimento técnico geral de comunicação visual, com revisão da produção pendente",
    ],
    units,
  },
];

/** Linha principal: é a conclusão dela que avisa o gestor */
export const linhaAtual = linhas[0]!;

const lessonsOf = (linha: Linha) =>
  linha.units.flatMap((unit) => unit.lessons.map((lesson) => ({ lesson, unit })));

/** Lições da linha principal, em ordem de desbloqueio */
export const allLessons: { lesson: Lesson; unit: Unit }[] = lessonsOf(linhaAtual);

/** Lições de cada linha, em ordem de desbloqueio (cada linha desbloqueia por conta própria) */
export const lessonsByLinha: Record<string, { lesson: Lesson; unit: Unit }[]> =
  Object.fromEntries(linhas.map((l) => [l.id, lessonsOf(l)]));

/** Todas as lições de todas as linhas */
export const everyLesson = Object.values(lessonsByLinha).flat();

/** Lista (linha) à qual uma lição pertence */
export const lessonListOf = (lessonId: string) =>
  Object.values(lessonsByLinha).find((list) => list.some((l) => l.lesson.id === lessonId)) ??
  allLessons;

export const findLesson = (id: string) =>
  everyLesson.find(({ lesson }) => lesson.id === id);

/* ------------------- Unidades criadas pelo gestor no painel ------------------- */

/** Unidade como o gestor edita e o servidor guarda */
export type UnidadeGestor = {
  id: string;
  title: string;
  description: string;
  tema: "vendas" | "produto";
  publicada: boolean;
  lessons: { id: string; title: string; tip?: string; questions: Question[] }[];
};

/** mínimo de questões para uma lição entrar na trilha */
export const MIN_QUESTOES = 3;

const prontas = (u: UnidadeGestor) => u.lessons.filter((l) => l.questions.length >= MIN_QUESTOES);

const montar = (lista: UnidadeGestor[], primeiroNumero: number): Unit[] =>
  buildUnits(
    lista.map((u, i) => ({
      id: u.id,
      number: primeiroNumero + i,
      title: u.title,
      description: u.description,
      tema: u.tema,
      lessons: prontas(u).map((l) => ({ id: l.id, title: l.title, tip: l.tip || undefined, questions: l.questions })),
    })),
  );

/** inclusive rascunhos: usado só para o gestor testar uma lição antes de publicar */
let rascunhos: { lesson: Lesson; unit: Unit }[] = [];

/**
 * Recebe as unidades do gestor e as coloca no FIM da trilha (só as publicadas
 * e com lições completas). As listas exportadas são atualizadas no lugar, para
 * todas as telas enxergarem o conteúdo novo.
 */
export const setUnidadesGestor = (lista: UnidadeGestor[]) => {
  const publicadas = lista.filter((u) => u.publicada && prontas(u).length > 0);
  units.splice(0, units.length, ...baseUnits, ...montar(publicadas, baseUnits.length + 1));
  allLessons.splice(0, allLessons.length, ...lessonsOf(linhaAtual));
  for (const linha of linhas) {
    const alvo = lessonsByLinha[linha.id]!;
    alvo.splice(0, alvo.length, ...lessonsOf(linha));
  }
  everyLesson.splice(0, everyLesson.length, ...Object.values(lessonsByLinha).flat());
  rascunhos = montar(lista.filter((u) => prontas(u).length > 0), baseUnits.length + 1).flatMap((unit) =>
    unit.lessons.map((lesson) => ({ lesson, unit })),
  );
};

/** como findLesson, mas enxerga também o que ainda é rascunho */
export const findLessonComRascunho = (id: string) =>
  findLesson(id) ?? rascunhos.find(({ lesson }) => lesson.id === id);

const idsBase = new Set(baseUnits.flatMap((u) => u.lessons.map((l) => l.id)));

/**
 * Endereço de uma lição. As da trilha original têm página própria; as criadas
 * pelo gestor usam uma página única, porque não existem na hora de publicar o app.
 */
export const lessonHref = (id: string) =>
  idsBase.has(id) ? `/farol/licao/${id}` : `/farol/praticar?id=${encodeURIComponent(id)}`;
