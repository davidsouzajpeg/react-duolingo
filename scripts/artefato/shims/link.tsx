import type { ComponentProps } from "react";
import { navigate } from "./router-core";
const Link = ({ href, onClick, ...rest }: ComponentProps<"a"> & { href: string }) => (
  <a
    href={href}
    {...rest}
    onClick={(e) => {
      onClick?.(e);
      e.preventDefault();
      navigate(href);
    }}
  />
);
export default Link;
