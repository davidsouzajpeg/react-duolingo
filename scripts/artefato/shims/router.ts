import { useSyncExternalStore } from "react";
import { getPath, navigate, subscribe } from "./router-core";
export const useRouter = () => {
  const path = useSyncExternalStore(subscribe, getPath, getPath);
  const lesson = /^\/farol\/licao\/(.+)$/.exec(path);
  return {
    pathname: lesson ? "/farol/licao/[id]" : path,
    query: lesson ? { id: lesson[1] } : {},
    isReady: true,
    push: (href: string) => {
      navigate(href);
      return Promise.resolve(true);
    },
  };
};
