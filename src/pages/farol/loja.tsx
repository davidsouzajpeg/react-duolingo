import type { NextPage } from "next";
import { useState } from "react";
import { Avatar } from "~/farol/components/Avatar";
import { FarolLayout } from "~/farol/components/FarolLayout";
import { CoinIcon, ShieldIcon } from "~/farol/components/Icons";
import { OfensivaCard } from "~/farol/components/Ofensiva";
import { Button, Eyebrow, Feixe, card } from "~/farol/components/ui";
import {
  type ItemSlot,
  hairColors,
  hairStyles,
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

const Loja = () => {
  const avatar = useFarolStore((s) => s.avatar);
  const coins = useFarolStore((s) => s.coins);
  const owned = useFarolStore((s) => s.ownedItems);
  const freezes = useFarolStore((s) => s.streakFreezes);
  const name = useFarolStore((s) => s.name);
  const { setAvatar, buyItem, equipItem, buyStreakFreeze } = useFarolStore.getState();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {/* Avatar */}
      <section className={`${card} relative overflow-hidden p-5 sm:p-6`}>
        <Feixe />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Eyebrow className="text-farol-accent">Seu avatar</Eyebrow>
              <h1 className="mt-1 font-display text-3xl font-extrabold leading-none tracking-tight">
                {name || "Consultor"}
              </h1>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-farol-line bg-farol-lamp px-3 py-1.5 font-num text-lg font-extrabold tabular-nums text-farol-warn">
              <CoinIcon className="h-6 w-6" /> {coins}
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3">
              <Avatar config={avatar} className="h-40 w-40 rounded-full border-4 border-farol-accent" />
              <button
                type="button"
                onClick={() => setAvatar(randomAvatar())}
                className="text-sm font-semibold uppercase tracking-[.09em] text-farol-accent hover:brightness-125"
              >
                Sortear visual
              </button>
            </div>
            <div className="flex w-full flex-col gap-4">
              <Swatches label="Pele" colors={skinTones} value={avatar.skin} onPick={(skin) => setAvatar({ skin })} />
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">Cabelo</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hairStyles.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      aria-pressed={avatar.hair === h.id}
                      onClick={() => setAvatar({ hair: h.id })}
                      className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                        avatar.hair === h.id
                          ? "border-farol-accent bg-farol-accent-soft text-farol-ink"
                          : "border-farol-line text-farol-muted hover:bg-farol-surface2"
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Swatches label="Cor do cabelo" colors={hairColors} value={avatar.hairColor} onPick={(hairColor) => setAvatar({ hairColor })} />
              <Swatches label="Camisa" colors={shirtColors} value={avatar.shirt} onPick={(shirt) => setAvatar({ shirt })} />
            </div>
          </div>
        </div>
      </section>

      {message && (
        <p className="rounded-xl bg-farol-ok-soft px-4 py-2 font-semibold text-farol-ok" role="status">
          {message}
        </p>
      )}

      {/* Bloqueio de ofensiva */}
      <section>
        <h2 className="mb-3 font-display text-xl font-extrabold tracking-tight">Ofensiva</h2>
        <div className="flex flex-col gap-3">
          <div className={`${card} flex items-center gap-3 p-4 sm:gap-4`}>
            <ShieldIcon className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
            <div className="min-w-0 grow">
              <p className="font-semibold">Bloqueio de ofensiva</p>
              <p className="text-sm text-farol-muted">
                Mantém a sua ofensiva se você ficar um dia sem praticar. É usado
                sozinho quando precisa. Equipados: {freezes}/{MAX_STREAK_FREEZES}.
              </p>
            </div>
            <Button
              className="shrink-0 px-4 py-2 text-sm"
              disabled={freezes >= MAX_STREAK_FREEZES || coins < STREAK_FREEZE_COST}
              onClick={() => buyStreakFreeze() && setMessage("Bloqueio de ofensiva equipado!")}
            >
              <Price value={STREAK_FREEZE_COST} />
            </Button>
          </div>
          <OfensivaCard showShopLink={false} />
        </div>
      </section>

      {/* Itens do avatar */}
      {slots.map((slot) => (
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
                    className={`${card} flex flex-col items-center gap-2 p-3 text-center ${
                      isEquipped ? "border-farol-accent" : ""
                    }`}
                  >
                    <Avatar
                      config={{ ...avatar, equipped: { ...avatar.equipped, [slot]: item.id } }}
                      className="h-20 w-20 rounded-full"
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
                        onClick={() => buyItem(item.id) && setMessage(`${item.name} comprado e equipado!`)}
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
