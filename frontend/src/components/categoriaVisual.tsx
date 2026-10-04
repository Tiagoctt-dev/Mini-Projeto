import { BriefcaseIcon, MonitorIcon, ShoppingCartIcon, WalletIcon, WrenchIcon } from "./icons";
import type { Categoria } from "../types";

export const CATEGORIA_VISUAL: Record<Categoria, { Icone: typeof MonitorIcon; classe: string }> = {
  TI: { Icone: MonitorIcon, classe: "cat-ti" },
  RH: { Icone: BriefcaseIcon, classe: "cat-rh" },
  COMPRAS: { Icone: ShoppingCartIcon, classe: "cat-compras" },
  FINANCEIRO: { Icone: WalletIcon, classe: "cat-financeiro" },
  INFRAESTRUTURA: { Icone: WrenchIcon, classe: "cat-infraestrutura" },
};
