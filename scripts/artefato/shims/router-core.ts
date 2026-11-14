/** Roteador em memória para o artefato (substitui o roteador do Next) */
let current = "/farol";
const listeners = new Set<() => void>();
export const getPath = () => current;
export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const navigate = (href: string) => {
  const path = href.split("#")[0]!.split("?")[0]!.replace(/\/+$/, "") || "/farol";
  current = path.startsWith("/farol") ? path : "/farol";
  listeners.forEach((fn) => fn());
  window.scrollTo(0, 0);
};
