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

## 📊 Estado Atual

**Filosofia:** Implementação incremental focada em testar continuamente - fazer o mínimo necessário de cada vez, validar que funciona, depois avançar.

- ✅ ÉPICO 1 concluído (1.1–1.4): Setup base
- ✅ Handlers implementados (src/bot/handlers.ts com storage em memória)
- 🔜 Próximo: ÉPICO 2 - Bot conversacional funcional

**Status Geral:** Pronto para implementar servidor Express e wiring dos handlers

**Metas de Sucesso Incrementais**
- Meta 1: Bot responde no Teams (echo funcional) + deploy Azure
- Meta 2: Envio proativo básico via API funciona
- Meta 3: Features adicionais conforme necessidade

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

## 🤖 ÉPICO 2: Bot Conversacional Funcional

**Contexto:** Criar servidor Express básico, conectar handlers do bot e fazer deploy na Azure para bot responder no Teams.

**Dependências:** ÉPICO 1 completo

**Meta:** Bot responde no Teams + deploy na Azure funcionando

#### Funcionalidades

##### 2.1 Express Server + Bot Endpoint
- **Descrição:** Criar servidor Express mínimo com endpoint do Bot Framework.
- **Critérios de Aceite:**
  - ✅ `src/server.ts` criado
  - ✅ Express server na porta do env (default 3000)
  - ✅ Middleware `express.json()`
  - ✅ Endpoint `POST /bot/messages` usando adapter
  - ✅ Wire com handlers: `onMessage` e `onConversationUpdate`
  - ✅ Logs básicos de requisições
- **Validação:**
  
      npm run dev
      # Em outro terminal, simular chamada do Bot Framework
      Invoke-WebRequest -Uri "http://localhost:3000/bot/messages" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body '{}'
- **Nota:** Usar código do FlakeFlow como referência (`apps/back/src/services/teams-bot/index.ts`)

##### 2.2 Echo Básico Funcional
- **Descrição:** Testar que bot responde mensagens no Teams.
- **Critérios de Aceite:**
  - ✅ Bot instalado no Teams (usar `flakeflow-teams-app.zip` existente)
  - ✅ Mensagem enviada no Teams aparece nos logs
  - ✅ Bot responde "You said: {texto}"
  - ✅ Logs mostram `tenantId`, `userId`, texto recebido
- **Validação:**
  - Instalar app no Teams (chat pessoal)
  - Enviar "teste" para o bot
  - Verificar logs local + resposta no Teams

##### 2.3 Health Check
- **Descrição:** Endpoint simples para verificar se serviço está rodando.
- **Critérios de Aceite:**
  - ✅ `GET /health` retorna 200 OK
  - ✅ JSON: `{ status: "ok", timestamp: "..." }`
- **Validação:**
  
      Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET

##### 2.4 Deploy Azure
- **Descrição:** Publicar código na Azure e validar funcionamento.
- **Critérios de Aceite:**
  - ✅ Criar App Service na Azure (ou usar existente)
  - ✅ Deploy do código (zip ou runtime direto)
  - ✅ Health check responde em produção
  - ✅ Atualizar Messaging Endpoint do Bot Service
  - ✅ Bot continua respondendo no Teams
- **Validação:**
  
      Invoke-WebRequest -Uri "https://flakeflow-teams-api.azurewebsites.net/health" -Method GET
      # Enviar mensagem no Teams e verificar resposta

---

## 🔔 ÉPICO 3: Envio Proativo Básico

**Contexto:** Implementar envio proativo de mensagens via API REST.

**Dependências:** ÉPICO 2 completo

**Meta:** Conseguir enviar mensagem proativa para usuário no Teams via chamada API

#### Funcionalidades

##### 3.1 Storage Conversation References
- **Descrição:** Manter conversation references dos usuários que instalaram o bot.
- **Critérios de Aceite:**
  - ✅ Storage em memória (Map) implementado nos handlers existentes
  - ✅ On `conversationUpdate`: salvar reference no Map
  - ✅ Função `getConversationReference(tenantId, userId)` retorna reference
  - ✅ Log quando reference é salvo
- **Nota:** Já implementado em `src/bot/handlers.ts` - conversar sobre fazer persistência após validação

##### 3.2 Proactive Message Endpoint
- **Descrição:** Endpoint para envio proativo de mensagem de texto.
- **Critérios de Aceite:**
  - ✅ `POST /api/send-message`
  - ✅ Payload: `{ userId, tenantId, message }`
  - ✅ Busca conversation reference do storage
  - ✅ Usa `adapter.continueConversation()` para enviar
  - ✅ Retorna sucesso/erro claro
  - ✅ Log de envio
- **Validação:**
  
      $body = @{ userId = "29:1Bwj..."; tenantId = "17c50773-..."; message = "Teste proativo" } | ConvertTo-Json
      Invoke-WebRequest -Uri "http://localhost:3000/api/send-message" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
  - Verificar que mensagem aparece no Teams do usuário

##### 3.3 API Key Authentication
- **Descrição:** Proteger endpoint com autenticação básica via API Key.
- **Critérios de Aceite:**
  - ✅ Middleware verifica header `X-API-Key`
  - ✅ Compara com `API_KEY` do env
  - ✅ Retorna 401 se inválido
- **Validação:**
  
      # Sem API key (deve falhar)
      Invoke-WebRequest -Uri "http://localhost:3000/api/send-message" -Method POST
      
      # Com API key válida (deve funcionar)
      Invoke-WebRequest -Uri "http://localhost:3000/api/send-message" -Method POST -Headers @{ "X-API-Key" = "sua-api-key" }

##### 3.4 Teste End-to-End
- **Descrição:** Validar fluxo completo de envio proativo.
- **Critérios de Aceite:**
  - ✅ Instalar bot no Teams
  - ✅ Fazer POST para `/api/send-message`
  - ✅ Mensagem chega no Teams do usuário
  - ✅ Logs mostram sucesso
- **Script PowerShell de Teste:**
  
      # 1. Pegar conversation reference dos logs após instalar bot
      # 2. Usar userId e tenantId no POST
      $body = @{
          userId = "29:xxxxx"
          tenantId = "xxxxx"
          message = "Teste de envio proativo!"
      } | ConvertTo-Json
      
      Invoke-RestMethod -Uri "http://localhost:3000/api/send-message" -Method POST -Headers @{ "Content-Type" = "application/json"; "X-API-Key" = "sua-key" } -Body $body

---

## 📈 ÉPICO 4: Robustez e Features (Opcional - Conforme Necessidade)

**Contexto:** Adicionar funcionalidades e melhorias conforme necessidade real.

**Dependências:** ÉPICO 3 completo

**Observação:** Estes itens podem ser implementados conforme demanda real. Priorizar baseado em feedback de uso.

#### Possíveis Funcionalidades Futuras

##### 4.1 Persistência Conversation References
- **Quando:** Quando precisa sobreviver reinicializações
- **Opções:** Redis, PostgreSQL, Cosmos DB
- **Complexidade:** Média

##### 4.2 Adaptive Cards
- **Quando:** Precisar aprovação interativa no Teams
- **Implementação:** Endpoint `/api/send-card` + processamento de ações
- **Complexidade:** Média-Alta

##### 4.3 Integração FlakeFlow
- **Quando:** Quiser disparar notificações do workflow FlakeFlow
- **Implementação:** Cliente HTTP no FlakeFlow + hooks nos nós de aprovação
- **Complexidade:** Alta (cross-project)

##### 4.4 Dashboard de Logs
- **Quando:** Precisar monitorar envios de mensagens
- **Implementação:** Página web simples ou logs estruturados no App Service
- **Complexidade:** Baixa-Média

##### 4.5 Retry Logic e Error Handling
- **Quando:** Detectar falhas temporárias no envio
- **Implementação:** Lógica de retry com exponential backoff
- **Complexidade:** Baixa-Média

##### 4.6 Testes Automatizados
- **Quando:** Quiser garantir qualidade do código
- **Implementação:** Jest + testes de integração
- **Complexidade:** Média

---

## 📌 Definition of Done por Meta Incremental

- **Meta 1: Bot Conversacional Funcional (ÉPICO 2)**
  - ✅ Servidor Express rodando com endpoint `/bot/messages`
  - ✅ Bot instalado no Teams via app package
  - ✅ Mensagem no Teams recebida e logada
  - ✅ Bot responde echo básico no Teams
  - ✅ Health check `/health` funcional
  - ✅ Deploy na Azure concluído

- **Meta 2: Envio Proativo Funcional (ÉPICO 3)**
  - ✅ Conversation references sendo salvos em memória
  - ✅ Endpoint `/api/send-message` implementado
  - ✅ POST com userId/tenantId envia mensagem para o Teams
  - ✅ API Key authentication funcionando
  - ✅ Logs mostram envio com sucesso/erro

- **Meta 3: Pronto para Uso (Opcional - ÉPICO 4)**
  - Conforme necessidade real surgir
  - Exemplos: persistência, adaptive cards, retry logic, etc.

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


