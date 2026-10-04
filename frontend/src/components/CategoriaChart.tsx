import { CATEGORIA_VISUAL } from "./categoriaVisual";
import { CATEGORIAS } from "../types";
import type { Categoria } from "../types";

interface CategoriaChartProps {
  dados: { categoria: Categoria; total: number }[];
}

export function CategoriaChart({ dados }: CategoriaChartProps) {
  const maior = Math.max(1, ...dados.map((d) => d.total));

  return (
    <div className="grafico-categorias-corpo">
      {dados.map((item) => {
        const { Icone, classe } = CATEGORIA_VISUAL[item.categoria];
        const label = CATEGORIAS.find((c) => c.value === item.categoria)?.label ?? item.categoria;
        const percentual = (item.total / maior) * 100;

        return (
          <div
            key={item.categoria}
            className={`grafico-categoria-linha ${classe}`}
            title={`${label}: ${item.total} solicitação${item.total === 1 ? "" : "ões"}`}
          >
            <span className="grafico-categoria-icone">
              <Icone className="icone" />
            </span>
            <span className="grafico-categoria-rotulo">{label}</span>
            <span className="grafico-categoria-trilha">
              <span className="grafico-categoria-barra" style={{ width: `${percentual}%` }} />
            </span>
            <span className="grafico-categoria-valor">{item.total}</span>
          </div>
        );
      })}
    </div>
  );
}
