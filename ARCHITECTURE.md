# Arquitetura - Teams Integration Module

Este documento descreve a arquitetura, decisões técnicas e topologia de deploy do microserviço que integra o FlakeFlow com o Microsoft Teams.

## Objetivo
Disponibilizar um componente/microserviço independente (Azure App Service) consumido pelo FlakeFlow via API REST, responsável por receber atividades do Bot Framework (mensagens reativas) e enviar mensagens/Adaptive Cards proativamente para usuários no Teams.

## Visão Arquitetural

Fluxo alto nível:

FlakeFlow Backend (on-prem/anywhere)
  ↓ HTTP REST (API Key)
Teams Integration Module (Azure App Service + Managed Identity)
  ↓ Bot Framework Protocol (OAuth com MI)
Microsoft Teams

Componentes principais:
- API REST (Express): `POST /api/send-message`, `POST /api/send-card`, `GET /health`
- Webhook do Bot: `POST /bot/messages` (recebe atividades do Teams)
- Adapter do Bot Framework: autenticação via Managed Identity em produção
- Serviço Proativo: reenvio via `adapter.continueConversation()` usando conversation references
- Storage (futuro): persistência de conversation references por `tenantId`/`userId`

## Decisões Técnicas

1) Bot Framework vs Graph API
- Graph API: restrito a single-tenant para chat 1:1 sem consentimentos complexos; não atende cross-tenant facilmente
- Bot Framework: nativo para multi-tenant, suporta Adaptive Cards e interações ricas
- Decisão: Bot Framework

2) Autenticação: Client Secret vs Managed Identity
- Client Secret: funciona localmente, mas enfrenta 401 cross-tenant quando backend não está na Azure
- Managed Identity: funciona em produção quando o serviço está na Azure; elimina gestão de segredo e resolve 401 cross-tenant
- Decisão: Managed Identity em produção; manter suporte local para desenvolvimento

3) Hospedagem
- Azure App Service (Linux, Node 20) sem container como caminho padrão (simplicidade, custo)
- Alternativa Docker: útil para portabilidade/CI, porém maior complexidade operacional
- Decisão: App Service sem Docker como padrão; Docker opcional

4) Contratos REST e Segurança
- Autenticação por `X-API-Key` entre FlakeFlow → Microserviço
- Payloads mínimos contendo `userId` (Teams), `tenantId`, `message` ou `card`
- Logging estruturado com `tenantId`, `userId`, `correlationId`

5) Persistência de Conversation References
- Fase 1: armazenamento em memória para validação
- Fase 2: persistência em storage (Redis/DB) para produção

## Topologia de Deploy (Produção)
- Azure Resource Group: `teams-integration-rg` (Região: Brazil South)
- App Service Plan: `teams-integration-plan` (SKU B1, Linux)
- Web App: `flakeflow-teams-api` (Node 20, Linux)
- User-Assigned Managed Identity: `flakeflow-teams-bot-identity`
- Bot Service: vinculado ao App Registration do bot
- App Settings:
  - `TEAMS_BOT_ID`
  - `TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID`
  - `API_KEY`
  - `PORT` = 3000
- Messaging Endpoint (Bot Service): `https://flakeflow-teams-api.azurewebsites.net/bot/messages`

## Sequências

Mensagens reativas (usuário → bot):
1. Usuário envia mensagem no Teams
2. Teams → Bot Service → Webhook `POST /bot/messages`
3. Adapter processa atividade e handlers respondem (ex.: echo)
4. Logs registram `tenantId`, `userId`

Mensagens proativas (FlakeFlow → usuário):
1. FlakeFlow chama `POST /api/send-message` com `X-API-Key`
2. Serviço busca conversation reference por `tenantId`/`userId`
3. `adapter.continueConversation()` envia ao Teams
4. Logs de sucesso/erro com contexto

## Referências ao FlakeFlow (reuso/migração)
Código e docs no monolito a serem reaproveitados e/ou migrados:
- Código do bot (adaptar para este microserviço):
  - `FlakeFlow/apps/back/src/services/teams-bot/index.ts`
- Documentação base (para alinhar termos/credenciais):
  - `FlakeFlow/apps/back/docs/teams/BOT_SETUP.md`
  - `FlakeFlow/apps/back/docs/teams/CREDENTIALS_REFERENCE.md`
  - `FlakeFlow/apps/back/docs/teams/CLIENT_INSTALLATION.md`
  - `FlakeFlow/apps/back/docs/teams/README.md`
- Roadmap existente (pontos de estado atual e MI):
  - `FlakeFlow/MICROSOFT_TEAMS_ROADMAP.md`

Observação: a migração deve preservar o `botId` e o pacote do Teams app; apenas o Messaging Endpoint mudará para o do microserviço.

## Operação e Observabilidade
- Logs estruturados com `tenantId`, `userId`, `activityId` (quando aplicável)
- Health check `GET /health`
- Monitoramento pelo App Service (Log Stream, App Insights opcional)

## Riscos e Mitigações
- 401/403 no envio: verificar Managed Identity vinculada e `TEAMS_BOT_ID`
- Ausência de conversation reference: exigir instalação prévia do bot e registrar no `conversationUpdate`
- Quotas/limites do App Service (B1): escalar plano se necessário

## Próximos Passos
- Implementar storage persistente para conversation references
- Adicionar testes automatizados de contrato dos endpoints
- Integrar App Insights para telemetria


