# Identificadores e Referências (sem segredos)

> Documento versionado — não incluir segredos aqui.

## Azure App Registration
- Nome: FlakeFlow Teams Bot
- Application (client) ID: `a1dc1605-eb6b-4c3a-8070-86e7c71e6f4e`
- Directory (tenant) ID: `199cd63d-d06d-42c6-8976-6588f48ff6f8`

## Managed Identity (User-Assigned)
- Nome: flakeflow-teams-bot-identity
- Client ID: `7b383354-8b9f-4394-8724-e6e7fff5f258`

## Azure Bot Service
- Nome: flakeflow-teams-bot-v4
- Microsoft App ID: `a1dc1605-eb6b-4c3a-8070-86e7c71e6f4e`
- Messaging Endpoint (atual): `https://a718a8c9e801.ngrok-free.app/bot/messages`
- Messaging Endpoint (produção - a atualizar): `https://flakeflow-teams-api.azurewebsites.net/bot/messages`

## Azure App Service (Produção)
- Resource Group: `teams-integration-rg`
- Região: Brazil South
- App Service Plan: `teams-integration-plan` (SKU B1, Linux)
- Web App: `flakeflow-teams-api`
- URL: `https://flakeflow-teams-api.azurewebsites.net`
- Runtime: Node.js 20 LTS (Linux)

## Túnel público (dev)
- URL atual: `https://a718a8c9e801.ngrok-free.app`

## Observações
- Em desenvolvimento local, use Client Secret no `.env` (arquivo separado não versionado).
- Em produção (Azure), use Managed Identity (sem secret).
- Managed Identity `flakeflow-teams-bot-identity` ainda não foi vinculada ao Web App (pendente).
