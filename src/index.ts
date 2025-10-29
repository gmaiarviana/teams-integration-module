import { createServer } from "./server";
import { env } from "./config/env";

const app = createServer();
const port = env.PORT;

app.listen(port, () => {
  console.log(`Teams Integration Module listening on port ${port}`);
});

export {};

