// Tipos y utilidades de traducción compartidas entre servidor y cliente.
// Sin "server-only" ni "use client": lo importan ambos lados.
import { es } from "@/i18n/dictionaries/es";
import { en } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";

export type Dictionary = typeof es;

export const DICTIONARIES: Record<Locale, Dictionary> = { es, en };

type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : DotPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = DotPaths<Dictionary>;

function readPath(dictionary: Dictionary, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>((node, segment) => (node as Record<string, unknown>)?.[segment], dictionary);

  if (typeof value !== "string") {
    // No debería pasar: `en.ts` usa `satisfies typeof es`, así que las claves
    // siempre existen en ambos diccionarios. Si ocurre, delata un typo en el key.
    return key;
  }

  return value;
}

/** Interpola `{variable}` dentro del string traducido. */
export function translate(
  dictionary: Dictionary,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const template = readPath(dictionary, key);
  if (!vars) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export type TFunction = (key: TranslationKey, vars?: Record<string, string | number>) => string;
