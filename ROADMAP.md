# Roadmap - Teams Integration Microserviço

## 📌 Contexto da Solução

**Objetivo Final:** Disponibilizar um componente/microserviço independente na Azure, consumido pelo FlakeFlow via API REST, que integre com o Microsoft Teams (mensagens reativas e proativas).

**Problema Identificado**
- Autenticação com Client Secret apresenta limitação cross-tenant (401) quando o backend não está na Azure.
- Managed Identity resolve o problema de autenticação cross-tenant, porém requer hospedagem do serviço na Azure.
- O monolito FlakeFlow não precisa estar na Azure e deve continuar onde está.

Para decisões técnicas detalhadas (Bot Framework vs Graph API, Managed Identity, hospedagem, contratos REST, storage), consulte `ARCHITECTURE.md`.

**Arquitetura-Alvo (Visão Resumida)**

FlakeFlow Backend (on-prem/anywhere)
  ↓ HTTP REST
Teams Integration Module (Azure App Service + Managed Identity)
  ↓ Bot Framework Protocol
Microsoft Teams

**Benefícios**
- ✅ Resolve autenticação cross-tenant com Managed Identity
- ✅ FlakeFlow permanece fora da Azure
- ✅ Desacoplamento limpo e escalabilidade independente
- ✅ Custo estimado: R$ 50-70/mês (App Service B1)

---

## 📊 Estado Atual (Atualizado em 29/10/2025)

- ✅ ÉPICO 1 concluído (1.1–1.4)
- ✅ 2.1 Bot Adapter implementado
- 🔜 Próximos passos: 2.2 Handlers e 2.3 Proactive Service

**Status Geral:** Avançando no ÉPICO 2

**Metas de Sucesso (Definition of Done Global)**
- Sucesso 1: Código deployado em produção na Azure e acessível publicamente
- Sucesso 2: Enviar mensagem no Teams e vê-la refletida no sistema (logs/eventos)
- Sucesso 3: Envio proativo a partir de comando do sistema (FlakeFlow → API → Teams)

---

## 🔁 Referências ao FlakeFlow para Migração

Para acelerar a migração e reaproveitar o que já foi implementado no monolito, usar como base:
- Código do bot no backend:
  - `C:\Users\guilherme_viana\Desktop\PRAIA\FlakeFlow\apps\back\src\services\teams-bot\index.ts`
- Documentação e credenciais:
  - `C:\Users\guilherme_viana\Desktop\PRAIA\FlakeFlow\apps\back\docs\teams\BOT_SETUP.md`
  - `C:\Users\guilherme_viana\Desktop\PRAIA\FlakeFlow\apps\back\docs\teams\CREDENTIALS_REFERENCE.md`
  - `C:\Users\guilherme_viana\Desktop\PRAIA\FlakeFlow\apps\back\docs\teams\CLIENT_INSTALLATION.md`
  - `C:\Users\guilherme_viana\Desktop\PRAIA\FlakeFlow\apps\back\docs\teams\README.md`
- Roadmap atual do FlakeFlow (estado/MI):
  - `C:\Users\guilherme_viana\Desktop\PRAIA\FlakeFlow\MICROSOFT_TEAMS_ROADMAP.md`

Observação: manter `botId` e pacote de app do Teams existentes; atualizar apenas o `Messaging Endpoint` para o novo domínio do microserviço.

## 🚀 ÉPICO 1: Setup Projeto Base

**Contexto:** Criar estrutura inicial do microserviço independente em `C:\Users\guilherme_viana\Desktop\PRAIA\teams-integration-module`.

**Dependências:** Nenhuma

#### Funcionalidades

##### 1.1 Estrutura de Diretórios e Git ✅
- **Status:** Concluída
- **Implementação:** 
  - Estrutura criada: `src/{bot,api,storage,config}`, `tests`, `docs`
  - Git inicializado e `.gitignore` adicionado
- **Commit:** `feat: estrutura inicial e .gitignore - Funcionalidade 1.1`

##### 1.2 Package.json e Dependências Base ✅
- **Status:** Concluída
- **Implementação:** 
  - `package.json` com scripts (`dev`, `build`, `start`, `test`) e dependências base
  - Dependências instaladas com sucesso (`node_modules` presente)
- **Commit:** `feat: adiciona package.json e dependências base - Funcionalidade 1.2`

##### 1.3 TypeScript Configuration ✅
- **Status:** Concluída
- **Implementação:** 
  - `tsconfig.json` (ES2020, commonjs, outDir `build`, rootDir `src`, strict `true`)
  - `src/index.ts` adicionando entrypoint mínimo e build ok
- **Commit:** `feat: configura TypeScript e entrypoint - Funcionalidade 1.3`

##### 1.4 Environment Variables Setup ✅
- **Status:** Concluída
- **Implementação:** 
  - `src/config/env.ts` com Zod validando `TEAMS_BOT_ID`, `TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID`, `API_KEY`, `PORT`
  - `.env.example` criado
- **Commit:** `feat: validação de env e exemplo de variáveis - Funcionalidade 1.4`

---

## 🤖 ÉPICO 2: Migração Código Bot

**Contexto:** Migrar código do bot do monolito FlakeFlow para o microserviço.

**Dependências:** ÉPICO 1 completo

#### Funcionalidades

##### 2.1 Bot Adapter com Managed Identity ✅
- **Status:** Concluída
- **Implementação:** 
  - `src/bot/adapter.ts` com `BotFrameworkAdapter`, `DefaultAzureCredential`, `onTurnError`, `trustServiceUrl()`
- **Commit:** `feat: cria BotFrameworkAdapter com MI-ready e error handler - Funcionalidade 2.1`

##### 2.2 Message Handlers
- **Descrição:** Handlers para processar mensagens recebidas do Teams.
- **Critérios de Aceite:**
  - ✅ `src/bot/handlers.ts` criado
  - ✅ `onMessage` (echo básico)
  - ✅ `onConversationUpdate` (captura instalação)
  - ✅ Conversation reference salvo (memória; persistência no ÉPICO 3)
  - ✅ Logs estruturados com timestamp e `tenantId`
- **Validação PowerShell:**
  
      npm run build
      Test-Path -Path "build/bot/handlers.js"
      Get-Content src/bot/handlers.ts | Select-String "onMessage"
      Get-Content src/bot/handlers.ts | Select-String "onConversationUpdate"

##### 2.3 Proactive Messaging Service
- **Descrição:** Serviço para envios proativos.
- **Critérios de Aceite:**
  - ✅ `src/bot/proactive.ts` criado
  - ✅ `sendProactiveMessage(userId, tenantId, message)`
  - ✅ `sendProactiveCard(userId, tenantId, card)`
  - ✅ Busca conversation reference do storage
  - ✅ Usa `adapter.continueConversation()`
  - ✅ Erro claro se reference inexistente
- **Validação PowerShell:**
  
      npm run build
      Test-Path -Path "build/bot/proactive.js"
      Get-Content src/bot/proactive.ts | Select-String "sendProactiveMessage"
      Get-Content src/bot/proactive.ts | Select-String "continueConversation"

---

## 🌐 ÉPICO 3: API REST Microserviço

**Contexto:** Expor API REST para o FlakeFlow consumir.

**Dependências:** ÉPICO 2 completo

#### Funcionalidades

##### 3.1 Express Server Base
- **Descrição:** Servidor Express com middlewares básicos.
- **Critérios de Aceite:**
  - ✅ `src/server.ts` criado
  - ✅ Porta do env (default 3000)
  - ✅ Middlewares: `express.json()`, `cors()`, `helmet()`
  - ✅ Health check `GET /health`
  - ✅ Logs de inicialização
- **Validação PowerShell:**
  
      cd C:\Users\guilherme_viana\Desktop\PRAIA\teams-integration-module
      npm run dev
      # Em outro terminal:
      Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET

##### 3.2 Bot Webhook Endpoint
- **Descrição:** Endpoint para processar atividades do Bot Framework.
- **Critérios de Aceite:**
  - ✅ `POST /bot/messages`
  - ✅ Usa adapter do ÉPICO 2
  - ✅ Retorna 200 OK após processar
  - ✅ Logs de atividades com `tenantId`
  - ✅ Error handling 500 em falhas
- **Validação Esperada:**
  - Bot responde "You said: teste" no Teams
  - Logs mostram atividade recebida com `tenantId`

##### 3.3 Send Message Endpoint
- **Descrição:** Endpoint para envio proativo de mensagem de texto.
- **Critérios de Aceite:**
  - ✅ `POST /api/send-message`
  - ✅ Autenticação via API Key (`X-API-Key`)
  - ✅ Payload válido:
    
        {
          "userId": "29:1Bwj...",
          "tenantId": "17c50773-...",
          "message": "texto"
        }
  
  - ✅ Chama `sendProactiveMessage()`
  - ✅ Resposta clara de sucesso/erro
- **Validação PowerShell:**
  
      $body = @{ userId = "29:1Bwj5..."; tenantId = "17c50773-..."; message = "Test" } | ConvertTo-Json
      $headers = @{ "Content-Type" = "application/json"; "X-API-Key" = "test-key-123" }
      Invoke-WebRequest -Uri "http://localhost:3000/api/send-message" -Method POST -Headers $headers -Body $body

##### 3.4 Send Card Endpoint
- **Descrição:** Endpoint para envio de Adaptive Cards.
- **Critérios de Aceite:**
  - ✅ `POST /api/send-card`
  - ✅ Autenticação via API Key
  - ✅ Payload com `card` (JSON do Adaptive Card)
  - ✅ Chama `sendProactiveCard()`
  - ✅ Resposta clara de sucesso/erro
- **Validação PowerShell:**
  
      $card = @{ type = "AdaptiveCard"; version = "1.4"; body = @(@{ type = "TextBlock"; text = "Aprovação Pendente"; weight = "Bolder"; size = "Large" }); actions = @(@{ type = "Action.Submit"; title = "Aprovar"; data = @{ action = "approve" } }) }
      $body = @{ userId = "29:1Bwj..."; tenantId = "17c50773-..."; card = $card } | ConvertTo-Json -Depth 10
      Invoke-WebRequest -Uri "http://localhost:3000/api/send-card" -Method POST -Headers $headers -Body $body

---

## ☁️ ÉPICO 4: Deploy Azure + Managed Identity

**Contexto:** Publicar o microserviço na Azure com Managed Identity.

**Dependências:** ÉPICO 3 completo

#### Funcionalidades

##### 4.1 Dockerfile Production-Ready
- **Descrição:** Dockerfile otimizado para produção.
- **Critérios de Aceite:**
  - ✅ Dockerfile na raiz
  - ✅ `.dockerignore` (node_modules, .env, .git, tests)
  - ✅ Multi-stage (recomendado)
  - ✅ Base `node:20-alpine`
  - ✅ Build TypeScript dentro do container
  - ✅ Expor porta 3000
- **Validação PowerShell:**
  
      cd C:\Users\guilherme_viana\Desktop\PRAIA\teams-integration-module
      docker build -t teams-integration-module:test .
      docker images | Select-String "teams-integration-module"

##### 4.2 Azure Resource Group e App Service
- **Descrição:** Criar recursos via Azure CLI.
- **Critérios de Aceite:**
  - ✅ `az login`
  - ✅ Resource Group: `teams-integration-rg`
  - ✅ App Service Plan: `teams-integration-plan` (B1, Linux)
  - ✅ Web App: `flakeflow-teams-api` (Node 20)
- **Validação PowerShell:**
  
      az group show --name teams-integration-rg
      az appservice plan show --name teams-integration-plan --resource-group teams-integration-rg
      az webapp show --name flakeflow-teams-api --resource-group teams-integration-rg

##### 4.3 Managed Identity Configuration
- **Descrição:** Habilitar User-Assigned Managed Identity no Web App.
- **Critérios de Aceite:**
  - ✅ Identidade atribuída ao Web App
  - ✅ Comando executado:
    
        az webapp identity assign --name flakeflow-teams-api --resource-group teams-integration-rg --identities /subscriptions/.../managedIdentities/flakeflow-teams-bot-identity
  
- **Validação PowerShell:**
  
      az webapp identity show --name flakeflow-teams-api --resource-group teams-integration-rg

##### 4.4 Environment Variables Azure
- **Descrição:** Configurar variáveis de ambiente no Web App.
- **Critérios de Aceite:**
  - ✅ `TEAMS_BOT_ID`
  - ✅ `TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID`
  - ✅ `API_KEY`
  - ✅ `PORT` (3000)
- **Validação PowerShell:**
  
      az webapp config appsettings list --name flakeflow-teams-api --resource-group teams-integration-rg

##### 4.5 Deploy e Messaging Endpoint Update
- **Descrição:** Deploy do código e atualização do Messaging Endpoint.
- **Critérios de Aceite:**
  - ✅ Deploy via `az webapp up` ou `az webapp deploy` (zip/container)
  - ✅ App acessível: `https://flakeflow-teams-api.azurewebsites.net`
  - ✅ Health: `GET /health` retorna 200
  - ✅ Bot Service com Messaging Endpoint: `https://flakeflow-teams-api.azurewebsites.net/bot/messages`
  - ✅ Status "Valid" no Portal
- **Validação PowerShell:**
  
      Invoke-WebRequest -Uri "https://flakeflow-teams-api.azurewebsites.net/health" -Method GET

---

## 🔗 ÉPICO 5: Integração FlakeFlow Client

**Contexto:** FlakeFlow consumir o microserviço via REST.

**Dependências:** ÉPICO 4 completo

#### Funcionalidades

##### 5.1 Configuração do Cliente HTTP
- **Descrição:** Criar cliente com `baseURL` e `X-API-Key`.
- **Critérios de Aceite:**
  - ✅ Variável `TEAMS_API_BASE_URL` no FlakeFlow
  - ✅ Variável `TEAMS_API_KEY` no FlakeFlow
  - ✅ Teste de conexão (health)

##### 5.2 Envio de Mensagens do Workflow
- **Descrição:** Invocar `/api/send-message` e `/api/send-card` quando apropriado.
- **Critérios de Aceite:**
  - ✅ Envio condicionado a preferências do usuário
  - ✅ Logs de sucesso/falha
  - ✅ Não bloquear o workflow em caso de falha

##### 5.3 Observabilidade Mínima
- **Descrição:** Logs estruturados no FlakeFlow para requisições ao microserviço.
- **Critérios de Aceite:**
  - ✅ Correlation ID por requisição
  - ✅ Latência e status code
  - ✅ Payload mínimo (sem dados sensíveis)

---

## ✅ ÉPICO 6: Testes End-to-End

**Contexto:** Validar ponta-a-ponta: FlakeFlow → API → Teams → Logs.

**Dependências:** ÉPICO 5 completo

#### Funcionalidades

##### 6.1 Testes de Mensagens Reativas
- **Critérios de Aceite:**
  - ✅ Mensagem enviada no Teams aparece no log do microserviço
  - ✅ Bot responde echo básico

##### 6.2 Testes de Mensagens Proativas
- **Critérios de Aceite:**
  - ✅ Chamada ao `/api/send-message` entrega mensagem ao usuário
  - ✅ Chamada ao `/api/send-card` exibe Adaptive Card com ação
  - ✅ Logs capturam sucesso/erro com `tenantId`

---

## 📌 Definition of Done por Meta de Sucesso

- **Sucesso 1 (Deploy Azure):**
  - Health check responde 200 em produção
  - Identity atribuída e appsettings configurados
  - Messaging Endpoint do Bot válido

- **Sucesso 2 (Mensagem vista no sistema):**
  - Logs mostram recebimento de atividade do Teams com `tenantId`
  - Resposta echo visível no chat do usuário

- **Sucesso 3 (Envio proativo por comando do sistema):**
  - FlakeFlow aciona `/api/send-message` com sucesso 200
  - Mensagem chega ao Teams do destinatário
  - Log de envio persistido (mínimo: status, tenantId, userId, timestamp)

---

## 📚 Referências

### Bot Framework
- `https://learn.microsoft.com/en-us/azure/bot-service/javascript/bot-builder-javascript-quickstart`
- `https://learn.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message`
- `https://learn.microsoft.com/en-us/azure/bot-service/`
- `https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-connector-api-reference`

### Teams Apps
- `https://learn.microsoft.com/en-us/microsoftteams/platform/bots/what-are-bots`
- `https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema`
- `https://learn.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration`
- `https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/apps-upload`

### Adaptive Cards
- `https://adaptivecards.io/`
- `https://adaptivecards.io/designer/`
- `https://learn.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/design-effective-cards`
- `https://learn.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/universal-actions-for-adaptive-cards/overview`

### Azure
- `https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app`
- `https://learn.microsoft.com/en-us/entra/identity-platform/howto-convert-app-to-be-multi-tenant`


