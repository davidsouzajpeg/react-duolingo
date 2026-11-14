import { cenario, completar, multipla, ordenar, vf, type UnitSeed } from "./autoria";

/**
 * LINHA DE TREINO "MATERIAIS E PRODUTOS" — comunicação visual
 *
 * SOBRE O CONTEÚDO
 * - Ensina o que o vendedor precisa saber dos materiais para indicar a
 *   solução certa: chapas, impressão e tintas, mídias, acabamento e luz.
 * - Foi escrito com conhecimento técnico geral do setor. As durabilidades
 *   variam por fabricante, tinta, acabamento e exposição: por isso o texto
 *   fala em curto, médio e longo prazo, sem prometer anos.
 * - PENDENTE: revisão da produção da Open, para trocar o genérico pelos
 *   materiais, marcas, garantias e prazos que a Open realmente pratica.
 */
export const materiaisSeeds: UnitSeed[] = [
  /* ------------------------------ Unidade 1 ------------------------------ */
  {
    id: "m1",
    number: 1,
    title: "ACM e chapas",
    description: "O que é ACM, quando ele vale a pena e as outras chapas do dia a dia",
    lessons: [
      {
        id: "m1-l1",
        title: "O que é ACM",
        tip:
          "ACM é um “sanduíche”: duas lâminas finas de alumínio com um miolo plástico no meio. Por isso é leve, plano e rígido, ótimo para fachadas.",
        questions: [
          multipla(
            "Do que é feito o ACM?",
            [
              "Uma chapa maciça de alumínio",
              "Duas lâminas de alumínio com um núcleo de polietileno no meio",
              "PVC revestido com tinta metálica",
              "Aço galvanizado com pintura",
            ],
            1,
            "ACM é material composto de alumínio: duas lâminas finas e um miolo, em geral de polietileno. Isso dá leveza com rigidez.",
          ),
          vf(
            "Uma das vantagens do ACM em fachadas é ficar bem plano, sem ondular como uma chapa fina comum.",
            true,
            "O miolo dá estrutura: a fachada fica lisa e com cara de acabamento de alto padrão.",
          ),
          cenario(
            "Dono de uma loja de móveis, olhando amostras.",
            "Esse ACM não é só uma chapa de alumínio pintada? Por que custa mais?",
            "Como você explica?",
            [
              "É a mesma coisa, só muda a marca.",
              "É alumínio dos dois lados com um miolo no meio. Fica leve, bem plano e resiste ao tempo, então a fachada continua bonita por muito mais tempo.",
              "É caro porque é importado.",
              "Não sei dizer, mas todo mundo usa.",
            ],
            1,
            "Explique a construção em uma frase e traduza para o que ele ganha: fachada plana, leve e durável.",
          ),
          completar(
            "O ACM é ___ e ___, o que facilita a instalação e deixa a fachada lisa.",
            ["leve", "rígido"],
            ["pesado", "mole"],
            "Leveza e rigidez juntas: é isso que faz do ACM o material mais usado em fachadas.",
          ),
        ],
      },
      {
        id: "m1-l2",
        title: "ACM para fora e para dentro",
        tip:
          "Nem todo ACM é igual. A pintura muda tudo: a PVDF aguenta sol e chuva por muito mais tempo; a de poliéster é para áreas internas ou uso de menor duração.",
        questions: [
          multipla(
            "Para uma fachada externa que pega sol o dia todo, qual pintura de ACM é a mais indicada?",
            [
              "Poliéster, porque é mais barata",
              "PVDF, que resiste melhor ao sol e ao tempo",
              "Tanto faz, o alumínio protege",
              "Nenhuma: ACM não pode ficar em área externa",
            ],
            1,
            "A pintura PVDF segura a cor e o brilho na área externa por muito mais tempo. A de poliéster é para interior ou curta duração.",
          ),
          vf(
            "Usar ACM de pintura para área interna em uma fachada externa pode fazer a cor desbotar bem antes do esperado.",
            true,
            "É uma das causas mais comuns de fachada desbotada: o material errado para a exposição.",
          ),
          cenario(
            "Cliente comparando dois orçamentos de fachada em ACM.",
            "O outro orçamento também é ACM e está bem mais barato.",
            "Qual pergunta técnica ajuda a comparar de forma justa?",
            [
              "ACM é tudo igual, deve ser promoção deles.",
              "O orçamento deles informa a pintura e a espessura da chapa? ACM para área externa e ACM para interior têm durabilidades bem diferentes.",
              "O deles deve ser de má qualidade.",
              "Então cubro o preço deles.",
            ],
            1,
            "Compare especificação com especificação: pintura, espessura e garantia explicam boa parte da diferença de preço.",
          ),
          multipla(
            "Em um prédio que exige mais segurança contra fogo, o que vale verificar no ACM?",
            [
              "Se a cor é clara",
              "Se o núcleo é do tipo resistente ao fogo, conforme a exigência do projeto",
              "Se a chapa é mais fina",
              "Nada: todo ACM é igual nesse ponto",
            ],
            1,
            "Existem chapas com núcleo resistente ao fogo. Em obras com essa exigência, confirme com o projeto e com a produção antes de orçar.",
          ),
        ],
      },
      {
        id: "m1-l3",
        title: "PVC expandido, acrílico e PS",
        tip:
          "Cada chapa tem o seu lugar. PVC expandido é leve e ótimo para dentro. Acrílico é o que brilha e deixa a luz passar. PS é a opção econômica para uso interno.",
        questions: [
          multipla(
            "Qual chapa é a mais indicada para letras e painéis que vão ser iluminados por dentro?",
            ["PVC expandido", "Acrílico", "MDF", "Papelão ondulado"],
            1,
            "O acrílico deixa a luz passar de forma uniforme e tem acabamento brilhante: por isso aparece em letreiros luminosos.",
          ),
          vf(
            "PVC expandido é uma boa escolha para placas de sinalização interna, por ser leve e fácil de fixar.",
            true,
            "Dentro do ambiente ele dura bem. Exposto ao sol forte por muito tempo, tende a amarelar e a empenar.",
          ),
          cenario(
            "Gerente de uma loja quer placas de promoção para trocar todo mês.",
            "Quero algo barato, é para ficar dentro da loja por pouco tempo.",
            "Qual indicação faz mais sentido?",
            [
              "ACM com pintura PVDF, que dura décadas.",
              "Acrílico espesso com iluminação.",
              "Uma chapa econômica para uso interno, como PS ou PVC expandido, já que a troca é mensal.",
              "Tanto faz o material.",
            ],
            2,
            "Material certo para o uso: se é interno e de curta duração, não faz sentido cobrar por uma durabilidade que ele não vai usar.",
          ),
          completar(
            "Para área ___ e de longa duração, prefira ACM; para uso ___ e de curta duração, chapas como PS resolvem.",
            ["externa", "interno"],
            ["úmida", "noturno"],
            "A primeira pergunta técnica é sempre onde a peça vai ficar e por quanto tempo.",
          ),
        ],
      },
    ],
  },

  /* ------------------------------ Unidade 2 ------------------------------ */
  {
    id: "m2",
    number: 2,
    title: "Impressão e tintas",
    description: "Solvente, ecossolvente, UV, látex, sublimação, DTF e DTF UV",
    lessons: [
      {
        id: "m2-l1",
        title: "Solvente e ecossolvente",
        tip:
          "As tintas à base de solvente são as clássicas da comunicação visual externa: aderem bem em lona e vinil e aguentam o tempo. A ecossolvente é a versão mais suave, com menos cheiro.",
        questions: [
          multipla(
            "Para que tipo de trabalho a impressão solvente ou ecossolvente é mais usada?",
            [
              "Camisetas de algodão",
              "Lonas e adesivos, inclusive para área externa",
              "Impressão direta em vidro e madeira",
              "Canecas e squeezes",
            ],
            1,
            "É a impressão do dia a dia em lona e vinil adesivo: banners, faixas, adesivos de vitrine e de frota.",
          ),
          vf(
            "A impressão ecossolvente tem menos cheiro do que a solvente tradicional, por isso é mais usada em peças para ambientes internos.",
            true,
            "Menos cheiro e boa definição: funciona bem para adesivos e peças que ficam perto das pessoas.",
          ),
          cenario(
            "Cliente pede um adesivo de vitrine com entrega para o mesmo dia e laminação.",
            "Imprime e já lamina na hora, preciso disso hoje à tarde.",
            "O que você precisa alinhar?",
            [
              "Pode deixar, sai em uma hora.",
              "Dependendo da tinta, a impressão precisa de um tempo de secagem antes de laminar, para não dar bolha nem descolar. Vou confirmar o prazo certo com a produção agora.",
              "Laminação não precisa, tira para ganhar tempo.",
              "Hoje é impossível, só semana que vem.",
            ],
            1,
            "Tintas à base de solvente precisam descansar antes da laminação. Prometer sem confirmar gera retrabalho e cliente insatisfeito.",
          ),
          completar(
            "Impressão solvente em lona e vinil é indicada para área ___, porque resiste bem ao ___.",
            ["externa", "tempo"],
            ["interna", "preço"],
            "Resistência ao tempo é o ponto forte dessa família de tintas.",
          ),
        ],
      },
      {
        id: "m2-l2",
        title: "UV e látex",
        tip:
          "Na impressão UV a tinta seca na hora com luz ultravioleta, o que permite imprimir direto em chapas rígidas. No látex a tinta é à base de água e sai seca e sem cheiro.",
        questions: [
          multipla(
            "Qual é a grande vantagem da impressão UV?",
            [
              "Só funciona em tecido",
              "Imprime direto em materiais rígidos, como ACM, acrílico, PVC e madeira",
              "É a mais barata para lona",
              "Não precisa de arquivo em boa resolução",
            ],
            1,
            "A cura por luz UV fixa a tinta na hora, direto na chapa, sem precisar adesivar depois.",
          ),
          vf(
            "A impressão UV pode usar tinta branca e verniz, o que permite efeitos como relevo e impressão em materiais transparentes ou escuros.",
            true,
            "O branco é o que faz a cor aparecer em acrílico transparente ou em material escuro. O verniz cria brilho localizado e relevo.",
          ),
          cenario(
            "Clínica pediátrica quer adesivar as paredes dos consultórios.",
            "Não pode ficar cheiro forte, tem criança o dia inteiro aqui.",
            "Que característica de impressão você destaca?",
            [
              "Qualquer adesivo serve, o cheiro some em uma semana.",
              "Indico uma impressão à base de água, como o látex, que sai seca e sem cheiro forte: dá para aplicar e já usar o ambiente.",
              "O melhor é pintar a parede em vez de adesivar.",
              "Cheiro é normal, é só abrir a janela.",
            ],
            1,
            "Para saúde, escolas e ambientes fechados, impressão sem cheiro é um benefício real, não um detalhe.",
          ),
          multipla(
            "O cliente quer a logomarca impressa direto em uma placa de acrílico transparente. Qual processo é o indicado?",
            ["Sublimação", "Impressão UV", "Serigrafia em tecido", "Impressão solvente em lona"],
            1,
            "Impressão UV direto na chapa, com branco por trás da cor para ela aparecer no transparente.",
          ),
        ],
      },
      {
        id: "m2-l3",
        title: "Sublimação, DTF e DTF UV",
        tip:
          "Para tecido e brindes: sublimação é para poliéster e peças claras; DTF funciona em quase todo tecido, inclusive algodão; DTF UV é um adesivo resistente para objetos rígidos.",
        questions: [
          multipla(
            "O cliente quer estampar camisetas 100% algodão, coloridas. Qual processo atende?",
            [
              "Sublimação",
              "DTF, que transfere a estampa com calor para vários tecidos, inclusive algodão",
              "DTF UV",
              "Impressão UV direto na camiseta",
            ],
            1,
            "Sublimação precisa de poliéster e base clara. O DTF resolve algodão e tecido escuro.",
          ),
          vf(
            "A sublimação funciona melhor em tecidos de poliéster claros, porque a tinta entra na fibra.",
            true,
            "Por entrar na fibra, não deixa toque na estampa e dura muito. Em algodão puro, não fixa.",
          ),
          cenario(
            "Empresa quer personalizar 200 coolers e garrafas térmicas com a logo.",
            "Dá pra colocar nossa logo nesses coolers? Não pode sair lavando.",
            "Qual solução você indica?",
            [
              "Sublimação, igual à de camiseta.",
              "Um adesivo de papel comum.",
              "DTF UV: um adesivo de transferência para superfícies rígidas, com boa resistência ao uso e à lavagem.",
              "Não tem como personalizar objeto rígido.",
            ],
            2,
            "DTF UV é feito para objetos rígidos e curvos, sem precisar de prensa quente.",
          ),
          ordenar(
            "Ordene do tecido para o objeto rígido",
            [
              "Sublimação: tecido de poliéster claro",
              "DTF: tecidos em geral, inclusive algodão",
              "DTF UV: objetos rígidos, como copos e coolers",
            ],
            "Poliéster claro, tecidos em geral e, por fim, superfícies rígidas.",
          ),
        ],
      },
    ],
  },

  /* ------------------------------ Unidade 3 ------------------------------ */
  {
    id: "m3",
    number: 3,
    title: "Mídias, acabamento e luz",
    description: "Lona, vinil adesivo, laminação e iluminação em LED",
    lessons: [
      {
        id: "m3-l1",
        title: "Lona e vinil adesivo",
        tip:
          "Lona front é iluminada pela frente; a back é translúcida, para luminosos. No vinil, o monomérico é para curto prazo e superfície plana; o polimérico dura mais; o fundido molda em curvas.",
        questions: [
          multipla(
            "Para um luminoso com luz por trás da imagem, qual lona é a indicada?",
            [
              "Lona front, que é opaca",
              "Lona backlight, que é translúcida",
              "Qualquer lona, a luz atravessa todas",
              "Tecido de algodão",
            ],
            1,
            "A backlight deixa a luz passar de forma uniforme. A front é para luz que vem da frente.",
          ),
          cenario(
            "Empresa quer envelopar a frota de vans, com curvas e frisos na lataria.",
            "Usa o adesivo mais em conta, é só colar.",
            "O que você explica?",
            [
              "Pode ser o mais barato mesmo, cola igual.",
              "Em curvas e frisos o adesivo comum tende a encolher e soltar. Para envelopamento, o indicado é o vinil fundido, que molda na lataria e dura muito mais.",
              "Van não pode ser adesivada.",
              "É melhor pintar a van inteira.",
            ],
            1,
            "Vinil fundido acompanha curvas e rebites. O monomérico é para superfície plana e uso de curta duração.",
          ),
          vf(
            "Vinil monomérico é uma boa opção para adesivos promocionais de curta duração em superfícies planas.",
            true,
            "Material certo para o uso certo: promoção de vitrine não precisa de vinil de longa duração.",
          ),
          ordenar(
            "Ordene os vinis da menor para a maior durabilidade",
            ["Monomérico", "Polimérico", "Fundido (cast)"],
            "Monomérico para curto prazo, polimérico para médio e fundido para longo prazo e superfícies curvas.",
          ),
        ],
      },
      {
        id: "m3-l2",
        title: "Laminação e durabilidade",
        tip:
          "Laminação é um filme transparente por cima da impressão. Ela protege do sol, de riscos e da limpeza, e é o que mais aumenta a vida útil de um adesivo.",
        questions: [
          multipla(
            "Para que serve a laminação em um adesivo impresso?",
            [
              "Só para deixar mais brilhante",
              "Para proteger a impressão do sol, de riscos e da limpeza, aumentando a durabilidade",
              "Para o adesivo colar mais forte",
              "Para a impressão secar mais rápido",
            ],
            1,
            "Além do acabamento (brilho ou fosco), a laminação é proteção: por isso entra em frota, piso e área externa.",
          ),
          cenario(
            "Supermercado quer adesivos no chão indicando os corredores.",
            "É só um adesivo no piso, né? Faz o mais simples.",
            "O que não pode faltar?",
            [
              "Adesivo comum, sem proteção.",
              "Laminação própria para piso, antiderrapante, para não soltar com o tráfego e não causar escorregões.",
              "Imprimir em papel e colar com fita.",
              "Laminação brilhante comum, que fica mais bonita.",
            ],
            1,
            "Adesivo de piso é questão de segurança: precisa de laminação antiderrapante, feita para tráfego.",
          ),
          vf(
            "A durabilidade de uma peça depende do conjunto: material, tinta, acabamento e onde ela fica exposta.",
            true,
            "Por isso não existe “dura X anos” sem saber o uso. Sol direto, maresia e limpeza pesada mudam tudo.",
          ),
          completar(
            "Para falar de durabilidade com segurança, pergunte ___ a peça vai ficar e por quanto ___ ela precisa durar.",
            ["onde", "tempo"],
            ["quando", "preço"],
            "Com essas duas respostas você indica o material certo e combina a expectativa certa.",
          ),
        ],
      },
      {
        id: "m3-l3",
        title: "Iluminação em LED",
        tip:
          "LED gasta menos energia, dura mais e dá menos manutenção do que as lâmpadas antigas. Em fachada, luz é o que faz a loja aparecer à noite.",
        questions: [
          multipla(
            "Qual é o principal argumento do LED em um letreiro?",
            [
              "É mais barato na compra do que qualquer lâmpada",
              "Consome menos energia, dura mais e exige menos manutenção",
              "Funciona sem energia elétrica",
              "Só serve para área interna",
            ],
            1,
            "O ganho aparece ao longo do tempo: conta de luz menor e menos visitas para trocar lâmpada queimada.",
          ),
          vf(
            "Letra caixa é uma letra em volume (3D), que pode ser iluminada pela frente ou por trás, criando um contorno de luz na parede.",
            true,
            "A iluminação por trás cria o efeito de halo, muito usado em fachadas de alto padrão.",
          ),
          cenario(
            "Restaurante que abre só à noite quer reformar a fachada.",
            "Luz encarece muito. Faz sem iluminação mesmo.",
            "Como você argumenta?",
            [
              "Tudo bem, sem luz fica mais barato.",
              "Como vocês abrem à noite, a fachada sem luz não aparece justamente no horário de movimento. Com LED o consumo é baixo e a manutenção é pequena. Posso te mostrar as duas opções lado a lado?",
              "Sem luz ninguém vai entrar, vai falir.",
              "Então coloco uma lâmpada comum na frente.",
            ],
            1,
            "Ligue a característica (luz) ao resultado (ser visto no horário em que ele vende) e ofereça a comparação.",
          ),
          multipla(
            "O que é um painel backlight?",
            [
              "Um painel pintado à mão",
              "Uma imagem em material translúcido iluminada por trás",
              "Uma lona opaca com refletor na frente",
              "Um adesivo recortado",
            ],
            1,
            "A luz vem de trás e atravessa a imagem: é o princípio dos luminosos e das caixas de luz.",
          ),
        ],
      },
    ],
  },

  /* ------------------------------ Unidade 4 ------------------------------ */
  {
    id: "m4",
    number: 4,
    title: "Indicando a solução certa",
    description: "Do pedido do cliente ao material certo, sem prometer o que não dá",
    lessons: [
      {
        id: "m4-l1",
        title: "Perguntas técnicas que não podem faltar",
        tip:
          "Antes de indicar material, quatro perguntas resolvem quase tudo: fica dentro ou fora? Por quanto tempo? Em que superfície? Precisa de luz?",
        questions: [
          ordenar(
            "Ordene as perguntas técnicas antes de indicar um material",
            [
              "A peça fica em área interna ou externa?",
              "Por quanto tempo ela precisa durar?",
              "Em que superfície será instalada?",
              "Precisa de iluminação?",
            ],
            "Local, duração, superfície e luz: com isso você já elimina a maioria das opções erradas.",
          ),
          cenario(
            "Cliente manda mensagem pedindo orçamento.",
            "Quanto fica um adesivo de 2 metros por 1?",
            "O que você pergunta antes de passar valor?",
            [
              "Nada, passo o preço do metro quadrado.",
              "Onde ele vai ser aplicado e por quanto tempo precisa durar? Parede, vidro, veículo e piso pedem materiais diferentes.",
              "Qual é o seu orçamento máximo?",
              "Você já tem a arte pronta em alta resolução?",
            ],
            1,
            "O mesmo tamanho pode ser quatro produtos diferentes. O uso define o material, e o material define o preço.",
          ),
          vf(
            "Saber a superfície de aplicação (parede lisa, textura, vidro, lataria) faz parte do diagnóstico técnico.",
            true,
            "Parede com textura ou tinta fosca, por exemplo, pode pedir um adesivo com cola diferente.",
          ),
          multipla(
            "O cliente não sabe dizer qual material quer. O que fazer?",
            [
              "Mandar a tabela com todos os materiais",
              "Escolher o mais caro",
              "Fazer as perguntas de uso e indicar você mesmo a opção certa, explicando o porquê",
              "Pedir que ele pesquise e volte depois",
            ],
            2,
            "O especialista é você. O cliente sabe o que precisa resolver, não o nome do material.",
          ),
        ],
      },
      {
        id: "m4-l2",
        title: "Da característica ao benefício",
        tip:
          "Cliente não compra PVDF nem vinil fundido: compra fachada que não desbota e adesivo que não solta. Sempre termine a explicação técnica com “o que significa que…”.",
        questions: [
          multipla(
            "Qual frase traduz melhor “ACM com pintura PVDF” para o cliente?",
            [
              "É um ACM com fluoreto de polivinilideno.",
              "É o ACM próprio para área externa: a cor da sua fachada continua viva por muito mais tempo.",
              "É o ACM mais caro que existe.",
              "É uma pintura diferente.",
            ],
            1,
            "Nome técnico em uma palavra, benefício em uma frase.",
          ),
          completar(
            "“Usamos vinil fundido na sua frota, o que ___ que o adesivo acompanha as curvas e não ___ com o tempo.”",
            ["significa", "solta"],
            ["impede", "brilha"],
            "A ponte “o que significa que” transforma característica em benefício.",
          ),
          cenario(
            "Compradora de uma rede de lojas, sem tempo para detalhes técnicos.",
            "Não entendo dessas siglas. Só me diz qual é o melhor.",
            "Como responder?",
            [
              "O melhor é o UV com verniz localizado em PVC expandido de 5 mm.",
              "Para as suas vitrines, que trocam todo mês, indico um adesivo de curta duração: sai mais em conta e é fácil de retirar. Para a fachada, um material de longa duração. Faz sentido?",
              "Depende do que você quiser gastar.",
              "Todos são bons.",
            ],
            1,
            "Fale pelo uso e pelo ganho de cada peça, sem siglas, e confirme o entendimento.",
          ),
          vf(
            "Explicar o porquê da indicação técnica ajuda o cliente a entender a diferença de preço para um concorrente.",
            true,
            "Quando ele entende o que está comprando, deixa de comparar só o número final.",
          ),
        ],
      },
      {
        id: "m4-l3",
        title: "Prometer só o que dá para cumprir",
        tip:
          "Prazo e durabilidade dependem da produção e do uso. Na dúvida, confirme antes de prometer: uma promessa errada custa mais caro do que um “vou confirmar e já te respondo”.",
        questions: [
          cenario(
            "Cliente prestes a fechar uma fachada.",
            "Essa fachada dura quantos anos? Me garante dez?",
            "Como responder com segurança?",
            [
              "Garanto dez anos, pode confiar.",
              "A durabilidade depende do material e da exposição. Para a sua fachada indiquei material de longa duração para área externa, e te passo por escrito a garantia que a Open oferece para ele.",
              "Ninguém sabe quanto dura.",
              "Dura para sempre.",
            ],
            1,
            "Explique do que depende, mostre que indicou o material certo e formalize a garantia que a empresa realmente oferece.",
          ),
          vf(
            "É melhor dizer “vou confirmar com a produção e te respondo em uma hora” do que prometer um prazo de que você não tem certeza.",
            true,
            "Prazo descumprido vira crise. Confirmar leva minutos e protege a confiança do cliente.",
          ),
          multipla(
            "O cliente quer usar um material interno em área externa para economizar. O que fazer?",
            [
              "Fazer como ele pediu, sem comentar",
              "Recusar o pedido",
              "Explicar o risco de desbotar ou empenar, oferecer a opção correta e registrar a escolha dele",
              "Cobrar mais caro pelo risco",
            ],
            2,
            "A decisão é dele, mas a orientação é sua. Deixe o risco claro e registrado para não virar reclamação depois.",
          ),
          completar(
            "Antes de prometer prazo ou durabilidade, ___ com a produção e passe a garantia por ___.",
            ["confirme", "escrito"],
            ["discuta", "telefone"],
            "Confirmar e formalizar: duas atitudes que evitam a maior parte das crises.",
          ),
        ],
      },
    ],
  },
];
