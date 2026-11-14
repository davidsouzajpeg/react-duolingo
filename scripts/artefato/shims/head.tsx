import type { ReactNode } from "react";
import { Children, isValidElement, useEffect } from "react";
/** No artefato só o <title> importa; fontes e metas já estão na página */
const Head = ({ children }: { children?: ReactNode }) => {
  let title = "";
  Children.forEach(children, (child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === "title") {
      title = String(child.props.children ?? "");
    }
  });
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
  return null;
};
export default Head;
