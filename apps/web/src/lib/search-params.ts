/** Un filtre n'accepte qu'une valeur : la première si l'adresse en répète une. */
export function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
