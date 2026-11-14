/**
 * Avatar e loja do Vendê.
 * - O visual base do avatar (pele, cabelo, camisa) é livre.
 * - Os itens abaixo são comprados com moedas e equipados por espaço (slot).
 */

export const skinTones = ["#f6d3b8", "#e8b48c", "#c98c62", "#9a623f", "#6b4027"] as const;
export const hairColors = ["#1f1a17", "#5a3a22", "#a8672f", "#d9b25f", "#c0392b", "#9aa0aa"] as const;
export const shirtColors = ["#ff0084", "#3fcf86", "#f5b331", "#4f8cff", "#ffffff", "#2d2f36"] as const;

export const hairStyles = [
  { id: "curto", label: "Curto" },
  { id: "longo", label: "Longo" },
  { id: "coque", label: "Coque" },
  { id: "cacheado", label: "Cacheado" },
  { id: "careca", label: "Careca" },
] as const;

export type HairStyle = (typeof hairStyles)[number]["id"];

export type ItemSlot = "chapeu" | "oculos" | "acessorio" | "fundo";

export const slotLabels: Record<ItemSlot, string> = {
  chapeu: "Chapéus",
  oculos: "Óculos",
  acessorio: "Acessórios",
  fundo: "Fundos",
};

export type ShopItem = {
  id: string;
  slot: ItemSlot;
  name: string;
  price: number;
};

export const shopItems: ShopItem[] = [
  { id: "bone", slot: "chapeu", name: "Boné rosa", price: 80 },
  { id: "capacete", slot: "chapeu", name: "Capacete de instalação", price: 150 },
  { id: "coroa", slot: "chapeu", name: "Coroa de fechamento", price: 400 },
  { id: "oculos-redondo", slot: "oculos", name: "Óculos redondos", price: 60 },
  { id: "oculos-escuro", slot: "oculos", name: "Óculos escuros", price: 100 },
  { id: "cracha", slot: "acessorio", name: "Crachá", price: 70 },
  { id: "gravata", slot: "acessorio", name: "Gravata", price: 90 },
  { id: "headset", slot: "acessorio", name: "Headset", price: 120 },
  { id: "fundo-verde", slot: "fundo", name: "Fundo farol verde", price: 50 },
  { id: "fundo-rosa", slot: "fundo", name: "Fundo rosa", price: 50 },
  { id: "fundo-feixe", slot: "fundo", name: "Fundo feixe do farol", price: 200 },
  { id: "fundo-ouro", slot: "fundo", name: "Fundo dourado", price: 300 },
];

export const findItem = (id: string) => shopItems.find((i) => i.id === id);

export type AvatarConfig = {
  skin: string;
  hair: HairStyle;
  hairColor: string;
  shirt: string;
  equipped: Partial<Record<ItemSlot, string>>;
};

export const defaultAvatar: AvatarConfig = {
  skin: skinTones[1],
  hair: "curto",
  hairColor: hairColors[1],
  shirt: shirtColors[0],
  equipped: {},
};

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]!;

export const randomAvatar = (): AvatarConfig => ({
  skin: pick(skinTones),
  hair: pick(hairStyles).id,
  hairColor: pick(hairColors),
  shirt: pick(shirtColors),
  equipped: {},
});
