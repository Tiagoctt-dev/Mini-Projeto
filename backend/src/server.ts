import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`API do Portal de Solicitações rodando na porta ${env.port}`);
});
