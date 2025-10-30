# Teams Integration Module

Microserviço responsável por integrar o FlakeFlow com o Microsoft Teams via Bot Framework. Expõe uma API REST para envio de mensagens reativas e proativas e será hospedado na Azure com Managed Identity.

## Sumário
- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Setup Local](#setup-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts NPM](#scripts-npm)
- [Execução](#execução)
- [Endpoints](#endpoints)
- [Boas Práticas de Contribuição](#boas-práticas-de-contribuição)
- [Deploy na Azure (recomendado)](#deploy-na-azure-recomendado)
- [Deploy com Docker (opcional)](#deploy-com-docker-opcional)
- [Troubleshooting](#troubleshooting)
 - [Documentos Relacionados](#documentos-relacionados)

## Visão Geral
- Componente independente consumido pelo FlakeFlow via HTTP.
- Autenticação com o Bot Framework usando Managed Identity em produção (Azure).
- Localmente, o desenvolvimento roda com Node.js, usando `.env` para configuração.

Para a visão arquitetural detalhada e decisões técnicas, veja `ARCHITECTURE.md`. Para o planejamento e migração a partir do FlakeFlow, veja `ROADMAP.md`.

## Pré-requisitos
- Node.js 20.x e npm 10+
- PowerShell (Windows) ou terminal compatível
- Azure CLI (`az`) autenticado para operações de deploy
- Acesso ao repositório GitHub
- Bot Service e App Registration já configurados (IDs disponíveis)

## Setup Local
1) Clonar o repositório

```powershell
git clone git@github.com:gmaiarviana/teams-integration-module.git
cd teams-integration-module
```

2) Instalar dependências

```powershell
npm install
```

3) Criar `.env` baseado no `.env.example`

```powershell
Copy-Item .env.example .env
# Preencha os valores conforme seu ambiente
```

## Variáveis de Ambiente
Crie um arquivo `.env` local com as chaves abaixo:

```
TEAMS_BOT_ID=
TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID=
API_KEY=
PORT=3000
```

Notas:
- Em produção (Azure), o App Service usará Managed Identity automaticamente; localmente, mantenha os IDs consistentes.
- `API_KEY` será usada pelos clientes (ex.: FlakeFlow) via header `X-API-Key`.

## Scripts NPM
Estado atual dos scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node build/index.js",
    "test": "echo \"(tests pendentes)\""
  }
}
```

## Execução
Ambiente de desenvolvimento (hot-reload):

```powershell
npm run dev
```

Build + execução (produção local):

```powershell
npm run build
npm run start
```

Nota: os endpoints HTTP (health e bot) serão introduzidos no Épico 2 (`src/server.ts`). A API REST proativa será implementada no Épico 3. No estado atual, o entrypoint apenas valida a configuração/compilação.

## Endpoints
- `GET /health` — Health check do serviço
- `POST /bot/messages` — Webhook do Bot Framework (Teams → serviço)
- `POST /api/send-message` — Envio proativo de texto
  - Header: `X-API-Key: <API_KEY>`
  - Body:
    ```json
    {
      "userId": "29:1Bwj...",
      "tenantId": "17c50773-...",
      "message": "texto"
    }
    ```
- `POST /api/send-card` — Envio proativo de Adaptive Card
  - Header: `X-API-Key: <API_KEY>`
  - Body: `{ userId, tenantId, card }` (JSON do Adaptive Card)

## Boas Práticas de Contribuição
- Branches: feature/<nome>, fix/<nome>, chore/<nome>
- Commits: mensagens claras e pequenas
- Lint/Testes: execute antes do push (quando configurados)
- PRs: descreva contexto, alterações, validação e riscos
- Logs: use logs estruturados (tenantId, userId, correlationId quando aplicável)

## Deploy na Azure (recomendado)
Recomendamos App Service (Linux) com runtime Node 20 e Managed Identity:

### Pré-requisito: Azure CLI

**Instalação:**
```powershell
winget install -e --id Microsoft.AzureCLI
```

**Configuração do PATH (se `az` não for reconhecido):**

O Azure CLI pode não estar no PATH após instalação. Para adicionar **permanentemente**:

```powershell
# Adicionar ao PATH do usuário (permanente)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin", [EnvironmentVariableTarget]::User)
```

**Importante:** Após executar o comando acima, **feche e abra um novo terminal PowerShell** para que a alteração tenha efeito.

**Solução temporária (para sessão atual):**
```powershell
# Adicionar apenas para a sessão atual
$env:Path += ";C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin"
```

### Processo de Deploy

1) Autenticar
```powershell
az login
```

2) Criar/validar recursos
```powershell
# Verificar se Resource Group existe
az group show --name teams-integration-rg

# Se não existir, criar (região: Brazil South)
az group create --name teams-integration-rg --location "Brazil South"

# Verificar App Service Plan
az appservice plan show --name teams-integration-plan --resource-group teams-integration-rg

# Se não existir, criar
az appservice plan create --name teams-integration-plan --resource-group teams-integration-rg --sku B1 --is-linux

# Verificar Web App
az webapp show --name flakeflow-teams-api --resource-group teams-integration-rg

# Se não existir, criar
az webapp create --name flakeflow-teams-api --resource-group teams-integration-rg --plan teams-integration-plan --runtime "NODE:20-lts"
```

3) Atribuir Managed Identity (se necessário)
```powershell
az webapp identity assign --name flakeflow-teams-api --resource-group teams-integration-rg --identities /subscriptions/.../managedIdentities/flakeflow-teams-bot-identity
```

4) App settings
```powershell
az webapp config appsettings set --name flakeflow-teams-api --resource-group teams-integration-rg --settings \
  TEAMS_BOT_ID=<bot-id> \
  TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID=<mi-client-id> \
  API_KEY=<api-key> \
  PORT=3000
```

5) Deploy do código
```powershell
az webapp up --name flakeflow-teams-api --resource-group teams-integration-rg --runtime "NODE|20-lts"
# ou use build local + zip deploy/CI
```

6) Verificar health
```powershell
Invoke-WebRequest -Uri "https://flakeflow-teams-api.azurewebsites.net/health" -Method GET
```

7) Atualizar Messaging Endpoint no Bot Service
- `https://flakeflow-teams-api.azurewebsites.net/bot/messages`

## Deploy com Docker (opcional)
Se preferir containerizar, use Dockerfile multi-stage (Node 20 Alpine) e publique a imagem em ACR ou Docker Hub, configurando o App Service para rodar em container.

Passos gerais:
```powershell
docker build -t teams-integration-module:prod .
docker run -p 3000:3000 teams-integration-module:prod
# Publicar em ACR e apontar o Web App para a imagem
```

Benefícios do Docker: imutabilidade do ambiente e portabilidade. Custo/complexidade geralmente maior do que runtime Node direto.

## Troubleshooting
- 401 ao responder/enviar no Teams: verifique Managed Identity e `TEAMS_BOT_ID`.
- 403/500 no webhook: confira `Messaging Endpoint` do Bot Service e logs do App Service.
- 401 na API REST: confirme `X-API-Key` e valor em appsettings.
- Timeout: valide conectividade e portas (3000) e se o serviço está respondendo no `/health`.

---

## Documentos Relacionados
- `ARCHITECTURE.md` — decisões técnicas, desenho e topologia de deploy
- `ROADMAP.md` — plano de migração, épicos e referências ao FlakeFlow


## Testes com túnel (ngrok) para Teams

Para testar no Microsoft Teams usando um endpoint público (ex.: ngrok):

1. Inicie o túnel apontando para sua porta local (3000):
   ```powershell
   # Exemplo: já possui o túnel ativo
   # URL pública: https://<seu-tunel>.ngrok-free.app
   ```
2. No Azure Bot Service, configure o Messaging Endpoint para:
   - `https://<seu-tunel>.ngrok-free.app/bot/messages`
3. Garanta que o `.env` local contenha os identificadores reais do seu bot:
   ```env
   TEAMS_BOT_ID=<Application (client) ID do App Registration>
   # Opcional (fallback): se usar Client Secret localmente
   TEAMS_BOT_PASSWORD=<client secret>
   PORT=3000
   ```
4. Rode a aplicação localmente:
   ```powershell
   npm run dev
   ```
5. No Teams (chat pessoal), envie uma mensagem ao bot e verifique no console o log e a resposta (echo).

Observações:
- Se ocorrer `401 Invalid AppId passed on token`, verifique se o `TEAMS_BOT_ID` do `.env` é exatamente o mesmo `Application (client) ID` configurado no Azure Bot Service.
- Para testes com o Bot Framework Emulator local (sem Teams), você pode apontar para `http://localhost:3000/bot/messages` e desabilitar autenticação no Emulator.


