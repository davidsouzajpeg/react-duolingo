import type { NextPage } from "next";
import { useRouter } from "next/router";
import { LessonScreen } from "./licao/[id]";

/**
 * Lições criadas pelo gestor no painel. Elas não existem quando o app é
 * publicado, então usam esta página única: /farol/praticar?id=<lição>
 * (com &teste=1 o gestor joga um rascunho, sem gravar progresso).
 */
const PraticarPage: NextPage = () => {
  const { query } = useRouter();
  return (
    <LessonScreen
      id={typeof query.id === "string" ? query.id : ""}
      preview={query.teste === "1"}
    />
  );
};

export default PraticarPage;
