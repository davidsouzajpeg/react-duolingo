import type { NextPage } from "next";
import { useState } from "react";
import { Avatar } from "~/farol/components/Avatar";
import { FarolLayout } from "~/farol/components/FarolLayout";
import { CoinIcon, ShieldIcon } from "~/farol/components/Icons";
import { OfensivaCard } from "~/farol/components/Ofensiva";
import { useSounds } from "~/farol/hooks";
import { Button, Eyebrow, card } from "~/farol/components/ui";
import {
  type ItemSlot,
  beardStyles,
  bodyTypes,
  eyeColors,
  faceMarks,
  faceShapes,
  hairColors,
  hairStyles,
  moods,
  outfitTypes,
  randomAvatar,
  shirtColors,
  shopItems,
  skinTones,
  slotLabels,
} from "~/farol/shop";
import {
  MAX_STREAK_FREEZES,
  STREAK_FREEZE_COST,
  useFarolStore,
} from "~/farol/store";

const Swatches = ({
  label,
  colors,
  value,
  onPick,
}: {
  label: string;
  colors: readonly string[];
  value: string;
  onPick: (color: string) => void;
}) => (
  <fieldset>
    <legend className="text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">{label}</legend>
    <div className="mt-2 flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`${label} ${color}`}
          aria-pressed={value === color}
          onClick={() => onPick(color)}
          className={`h-9 w-9 rounded-full border-2 transition ${
            value === color ? "scale-110 border-farol-accent" : "border-farol-line"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  </fieldset>
);

const Price = ({ value }: { value: number }) => (
  <span className="flex items-center gap-1 font-num font-extrabold tabular-nums">
    <CoinIcon className="h-4 w-4" /> {value}
  </span>
);

const slots: ItemSlot[] = ["chapeu", "oculos", "acessorio", "fundo"];

type Tab = "avatar" | "itens" | "ofensiva";

const tabs: { id: Tab; label: string }[] = [
  { id: "avatar", label: "Avatar" },
  { id: "itens", label: "Itens" },
  { id: "ofensiva", label: "Chama" },
];

const Choice = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
      active
        ? "border-farol-accent bg-farol-accent-soft text-farol-ink"
        : "border-farol-line text-farol-muted hover:bg-farol-surface2"
    }`}
  >
    {children}
  </button>
);

const Loja = () => {
  const avatar = useFarolStore((s) => s.avatar);
  const coins = useFarolStore((s) => s.coins);
  const owned = useFarolStore((s) => s.ownedItems);
  const freezes = useFarolStore((s) => s.streakFreezes);
  const name = useFarolStore((s) => s.name);
  const { setAvatar, buyItem, equipItem, buyStreakFreeze } = useFarolStore.getState();
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("avatar");
  const sounds = useSounds();

  return (
    <div className="flex flex-col gap-6">
      {/* Palco: o avatar fica preso no topo enquanto as opções rolam por baixo */}
      <section className={`${card} sticky top-[4.6rem] z-10 overflow-hidden shadow-[0_12px_24px_-8px_rgba(0,0,0,.6)] md:top-4`}>
        <div className="flex items-center gap-4 bg-farol-lamp p-3 sm:p-4">
          <Avatar config={avatar} round={false} animated interactive className="h-32 w-32 sm:h-44 sm:w-44" />
          <div className="min-w-0 grow">
            <Eyebrow className="text-farol-accent">Escolha o seu visual</Eyebrow>
            <h1 className="mt-1 truncate font-display text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">
              {name || "Consultor"}
            </h1>
            <p className="mt-2 flex w-fit items-center gap-1.5 rounded-full border border-farol-line bg-farol-bg px-3 py-1 font-num text-base font-extrabold tabular-nums text-farol-warn">
              <CoinIcon className="h-5 w-5" /> {coins}
            </p>
            <button
              type="button"
              onClick={() => setAvatar(randomAvatar())}
              className="mt-2 block text-xs font-semibold uppercase tracking-[.09em] text-farol-accent hover:brightness-125"
            >
              Sortear visual
            </button>
            <p className="mt-1 hidden text-xs text-farol-muted sm:block">Toque no avatar para um tchau</p>
          </div>
        </div>
        <div className="flex border-t border-farol-line" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 border-b-4 py-3 font-display text-sm font-extrabold uppercase tracking-wide transition ${
                tab === t.id
                  ? "border-farol-accent text-farol-accent"
                  : "border-transparent text-farol-muted hover:text-farol-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {message && (
        <p className="rounded-xl bg-farol-ok-soft px-4 py-2 font-semibold text-farol-ok" role="status">
          {message}
        </p>
      )}

      {tab === "avatar" && (
        <section className={`${card} flex flex-col gap-5 p-5`}>
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">Corpo</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {bodyTypes.map((b) => (
                <Choice key={b.id} active={(avatar.body ?? "medio") === b.id} onClick={() => setAvatar({ body: b.id })}>
                  {b.label}
                </Choice>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">Rosto</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {faceShapes.map((f) => (
                <Choice key={f.id} active={(avatar.face ?? "oval") === f.id} onClick={() => setAvatar({ face: f.id })}>
                  {f.label}
                </Choice>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">Detalhe do rosto</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {faceMarks.map((f) => (
                <Choice key={f.id} active={(avatar.marks ?? "nenhum") === f.id} onClick={() => setAvatar({ marks: f.id })}>
                  {f.label}
                </Choice>
              ))}
            </div>
          </fieldset>
          <Swatches label="Pele" colors={skinTones} value={avatar.skin} onPick={(skin) => setAvatar({ skin })} />
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">Expressão</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {moods.map((m) => (
                <Choice key={m.id} active={(avatar.mood ?? "neutro") === m.id} onClick={() => setAvatar({ mood: m.id })}>
                  {m.label}
                </Choice>
              ))}
            </div>
          </fieldset>
          <Swatches label="Olhos" colors={eyeColors} value={avatar.eyes ?? eyeColors[0]} onPick={(eyes) => setAvatar({ eyes })} />
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">Cabelo</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {hairStyles.map((h) => (
                <Choice key={h.id} active={avatar.hair === h.id} onClick={() => setAvatar({ hair: h.id })}>
                  {h.label}
                </Choice>
              ))}
            </div>
          </fieldset>
          <Swatches label="Cor do cabelo" colors={hairColors} value={avatar.hairColor} onPick={(hairColor) => setAvatar({ hairColor })} />
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">Barba</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {beardStyles.map((b) => (
                <Choice
                  key={b.id}
                  active={(avatar.beard ?? "nenhuma") === b.id}
                  onClick={() => setAvatar({ beard: b.id })}
                >
                  {b.label}
                </Choice>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">Roupa</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {outfitTypes.map((o) => (
                <Choice key={o.id} active={(avatar.outfit ?? "camiseta") === o.id} onClick={() => setAvatar({ outfit: o.id })}>
                  {o.label}
                </Choice>
              ))}
            </div>
          </fieldset>
          <Swatches label="Cor da roupa" colors={shirtColors} value={avatar.shirt} onPick={(shirt) => setAvatar({ shirt })} />
        </section>
      )}

      {tab === "ofensiva" && (
        <section className="flex flex-col gap-3">
          <div className={`${card} flex items-center gap-3 p-4 sm:gap-4`}>
            <ShieldIcon className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
            <div className="min-w-0 grow">
              <p className="font-semibold">Protetor de chama</p>
              <p className="text-sm text-farol-muted">
                Mantém a sua chama acesa se você ficar um dia sem praticar. É usado
                sozinho quando precisa. Equipados: {freezes}/{MAX_STREAK_FREEZES}.
              </p>
            </div>
            <Button
              className="shrink-0 px-4 py-2 text-sm"
              disabled={freezes >= MAX_STREAK_FREEZES || coins < STREAK_FREEZE_COST}
              onClick={() => {
                if (!buyStreakFreeze()) return;
                sounds.coin();
                setMessage("Protetor de chama equipado!");
              }}
            >
              <Price value={STREAK_FREEZE_COST} />
            </Button>
          </div>
          <OfensivaCard showShopLink={false} />
        </section>
      )}

      {tab === "itens" &&
        slots.map((slot) => (
          <section key={slot}>
            <h2 className="mb-3 font-display text-xl font-extrabold tracking-tight">{slotLabels[slot]}</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shopItems
                .filter((item) => item.slot === slot)
                .map((item) => {
                  const isOwned = owned.includes(item.id);
                  const isEquipped = avatar.equipped[slot] === item.id;
                  return (
                    <li
                      key={item.id}
                      className={`${card} flex flex-col items-center gap-2 overflow-hidden p-3 text-center ${
                        isEquipped ? "border-farol-accent" : ""
                      }`}
                    >
                      <Avatar
                        config={{ ...avatar, equipped: { ...avatar.equipped, [slot]: item.id } }}
                        round={false}
                        className="h-28 w-28"
                        label={`Prévia: ${item.name}`}
                      />
                      <p className="text-sm font-semibold leading-tight">{item.name}</p>
                      {isOwned ? (
                        <Button
                          variant={isEquipped ? "ghost" : "success"}
                          className="w-full px-2 py-1.5 text-xs"
                          onClick={() => equipItem(slot, isEquipped ? null : item.id)}
                        >
                          {isEquipped ? "Tirar" : "Equipar"}
                        </Button>
                      ) : (
                        <Button
                          className="flex w-full justify-center px-2 py-1.5 text-xs"
                          disabled={coins < item.price}
                          onClick={() => {
                            if (!buyItem(item.id)) return;
                            sounds.coin();
                            setMessage(`${item.name} comprado e equipado!`);
                          }}
                        >
                          <Price value={item.price} />
                        </Button>
                      )}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}

      <p className="text-center text-sm text-farol-muted">
        Você ganha moedas concluindo lições, fazendo lições perfeitas e subindo de divisão.
      </p>
    </div>
  );
};

const LojaPage: NextPage = () => (
  <FarolLayout title="Loja">
    <Loja />
  </FarolLayout>
);

export default LojaPage;
