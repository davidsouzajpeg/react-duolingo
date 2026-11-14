/**
 * PRESENTES DA TRILHA
 *
 * No meio de cada unidade há um "e-mail" de um cliente fictício agradecendo
 * o atendimento, com um presente: faíscas, moedas ou um item da loja.
 * O presente libera quando o vendedor conclui a lição anterior a ele e só
 * pode ser recebido uma vez.
 *
 * Para criar um presente novo, acrescente um item com o id da unidade.
 */

export type GiftReward =
  | { kind: "moedas"; amount: number }
  | { kind: "faiscas"; amount: number }
  | { kind: "item"; itemId: string };

export type Gift = {
  /** id da unidade em que o presente aparece */
  unitId: string;
  from: { nome: string; empresa: string; emoji: string };
  subject: string;
  body: string;
  reward: GiftReward;
};

/** o presente fica depois desta lição da unidade (0 = primeira) */
export const GIFT_AFTER_LESSON = 1;

export const gifts: Gift[] = [
  {
    unitId: "u1",
    from: { nome: "Carla", empresa: "Bela Trama Modas", emoji: "👩‍💼" },
    subject: "Obrigada por me ouvir",
    body: "Fui a três lugares pedir orçamento e você foi o único que perguntou o que eu precisava antes de falar de preço. Fez diferença. Um mimo de agradecimento!",
    reward: { kind: "moedas", amount: 30 },
  },
  {
    unitId: "u2",
    from: { nome: "Dra. Paula", empresa: "Clínica Vida Leve", emoji: "👩‍⚕️" },
    subject: "Você fez a lição de casa",
    body: "Gostei de ver que você já sabia da reforma da recepção quando me procurou. Dá para perceber quem se prepara. Aqui vai um incentivo.",
    reward: { kind: "faiscas", amount: 15 },
  },
  {
    unitId: "m1",
    from: { nome: "Rogério", empresa: "Casa & Estilo Móveis", emoji: "🧔" },
    subject: "A fachada ficou lisinha",
    body: "Agora entendi por que você insistiu no ACM certo para área externa. Ficou plana, bonita, e os clientes comentam. Mandei um presente para você usar no trabalho.",
    reward: { kind: "item", itemId: "cracha" },
  },
  {
    unitId: "u3",
    from: { nome: "Marcos", empresa: "Metalforte Indústria", emoji: "👷" },
    subject: "Reunião objetiva, do jeito que eu gosto",
    body: "Você se apresentou, entendeu a nossa demanda e mostrou um case parecido com o nosso. Sem enrolação. Segue um agradecimento.",
    reward: { kind: "moedas", amount: 40 },
  },
  {
    unitId: "u4",
    from: { nome: "Helena", empresa: "Restaurante Fogo de Chão Baiano", emoji: "👩‍🍳" },
    subject: "Suas perguntas me fizeram pensar",
    body: "Eu só queria trocar as lâmpadas. Foi a sua pergunta sobre o movimento à noite que me fez ver o tamanho do problema. Obrigada pela conversa!",
    reward: { kind: "faiscas", amount: 20 },
  },
  {
    unitId: "m2",
    from: { nome: "Bia", empresa: "Clínica Pequenos Passos", emoji: "👩‍🍼" },
    subject: "Sem cheiro nenhum!",
    body: "Aplicaram os adesivos de manhã e à tarde já estávamos atendendo as crianças. Obrigada por indicar a impressão certa para o nosso caso.",
    reward: { kind: "item", itemId: "oculos-redondo" },
  },
  {
    unitId: "u5",
    from: { nome: "Júlio", empresa: "Rota Veículos", emoji: "🧑‍💼" },
    subject: "A sinalização interna foi uma ótima ideia",
    body: "Eu só tinha pedido a fachada. Ainda bem que você sugeriu padronizar o showroom: ficou tudo com a mesma cara e resolvi com um fornecedor só.",
    reward: { kind: "moedas", amount: 50 },
  },
  {
    unitId: "u6",
    from: { nome: "Vanessa", empresa: "Padaria Trigo de Ouro", emoji: "👩‍🦰" },
    subject: "Entendi por que não era caro",
    body: "Quando você comparou com o custo de refazer em um ano, a conta fechou. Obrigada por explicar em vez de só baixar o preço.",
    reward: { kind: "faiscas", amount: 25 },
  },
  {
    unitId: "m3",
    from: { nome: "Tiago", empresa: "Expresso Serra Azul", emoji: "🚐" },
    subject: "Os adesivos das vans estão firmes",
    body: "Seis meses de estrada e lavagem, e nenhum canto soltou. O adesivo próprio para curvas valeu cada centavo. Um presente pela indicação!",
    reward: { kind: "item", itemId: "fundo-verde" },
  },
  {
    unitId: "u7",
    from: { nome: "Rogério", empresa: "Clínica Sorriso Certo", emoji: "🧑‍⚕️" },
    subject: "Fechamos com vocês",
    body: "Minha sócia gostou da apresentação e de você ter voltado no dia combinado. Aprovei a proposta pelo link. Bora produzir!",
    reward: { kind: "moedas", amount: 60 },
  },
  {
    unitId: "u8",
    from: { nome: "João", empresa: "Auto Peças Ferraz", emoji: "😊" },
    subject: "Obrigado por resolver",
    body: "Eu estava bravo, você sabe. Mas você assumiu, deu prazo e cumpriu. O letreiro ficou certo para a inauguração. Esse presente é exclusivo: não se compra na loja.",
    reward: { kind: "item", itemId: "fundo-gala" },
  },
  {
    unitId: "m4",
    from: { nome: "Paula", empresa: "Rede Pulso Academias", emoji: "👩‍💻" },
    subject: "Indiquei vocês para dois colegas",
    body: "Você me explicou cada material sem sigla e sem promessa exagerada. Passei o seu contato para dois colegas de outras redes. Sucesso!",
    reward: { kind: "moedas", amount: 80 },
  },
];

export const giftOfUnit = (unitId: string) => gifts.find((g) => g.unitId === unitId);
