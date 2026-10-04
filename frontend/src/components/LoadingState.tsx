export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="estado-carregando">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
