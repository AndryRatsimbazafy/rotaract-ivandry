// Commandes HTML natives (Invoker Commands) : un bouton ouvre ou ferme un
// <dialog> sans script. React les transmet telles quelles au DOM, mais ses
// types ne les connaissent pas encore.
import "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- même signature que React.
  interface ButtonHTMLAttributes<T> {
    command?: "show-modal" | "close" | "request-close" | (string & {});
    commandfor?: string;
  }
}
