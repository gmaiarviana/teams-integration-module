# Implementation Guidelines

## Visão Geral

Este documento define como implementar funcionalidades do roadmap.

**Entrada:** Funcionalidade documentada no roadmap (ex: Funcionalidade 1.2)  
**Saída:** Código implementado, testado e commitado incrementalmente

**Seu papel:** Quebrar funcionalidade em tarefas, implementar incrementalmente, validar e commitar.

---

## Ambiente e Restrições

### Ambiente de Desenvolvimento
- **Sistema:** Windows PowerShell - NUNCA usar comandos Linux
- **Stack:** Node.js + Express + React + PostgreSQL via Docker
- **Validação:** `docker-compose up -d` + testar em `http://localhost:3000`

### Comandos Válidos
✅ PowerShell: `docker-compose up`, `Get-Content`, `Select-String`, `Invoke-WebRequest`  
✅ Git específico: `git add arquivo.js arquivo2.css`

### Comandos Proibidos
❌ Linux: `&&`, `|`, `grep`, `curl`, `sleep`  
❌ Git genérico: `git add .`, `git commit -am`

---

## Processo de Implementação

### 1. RECEBIMENTO DA FUNCIONALIDADE
- Recebe funcionalidade do roadmap
- Realiza reflexão técnica obrigatória (ver seção abaixo)

### 2. FUNCIONALIDADE → LISTA DE TAREFAS
- Quebra funcionalidade em tarefas por **complexidade** (quantidade de ações)
- Ordena por dependência técnica
- Propõe lista COMPLETA de tarefas
- Aguarda validação

### 3. LISTA → IMPLEMENTAÇÃO INCREMENTAL
Para cada tarefa:
1. Declara: "Vamos implementar a Tarefa N: [nome]"
2. Implementa a tarefa
3. Fornece comandos PowerShell para validação
4. Aguarda confirmação de validação
5. Orienta commit específico
6. Passa para próxima tarefa

---

## Reflexão Técnica Obrigatória

Antes de quebrar funcionalidade em tarefas, analise:

**1. ARQUITETURA**
- Onde a funcionalidade se encaixa? (frontend/backend/database)
- Quais componentes/APIs serão afetados?
- Há dependências com código existente?

**2. DADOS**
- Precisa criar/alterar tabelas no PostgreSQL?
- Quais endpoints da API serão necessários?
- Como os dados fluem (frontend ↔ backend ↔ database)?

**3. COMPLEXIDADE**
- Quantas ações distintas por tarefa? (criar arquivo, modificar função, adicionar rota, etc)
- Como ordenar do simples ao complexo?
- Quais tarefas dependem de outras?

**4. VALIDAÇÃO**
- Como testar cada tarefa isoladamente?
- Quais comandos PowerShell são necessários?
- Quais comportamentos verificar no browser?

**5. RISCOS**
- Há riscos de quebrar funcionalidade existente?
- Precisa de dados de teste específicos?
- Há pontos críticos que exigem atenção extra?

---

## Critérios para Tarefas

**Tarefa bem definida:**
- ✅ Ações específicas: "Criar arquivo X.jsx com componente Y"
- ✅ Arquivos explícitos: "Modificar src/components/Summary.jsx"
- ✅ Validação clara: Comandos PowerShell + critérios de aceite
- ✅ Independente: Pode ser testada isoladamente
- ✅ Complexidade adequada: 3-5 ações por tarefa

**Exemplos de ações:**
- Criar novo arquivo
- Modificar função existente
- Adicionar rota no backend
- Criar tabela no database
- Adicionar botão no componente
- Implementar validação de dados

---

## Template de Tarefa

```markdown
TAREFA N: Nome Específico

**Ações:**
1. [Ação específica - arquivo e o que fazer]
2. [Ação específica - arquivo e o que fazer]

**Validação PowerShell:**
```powershell
docker-compose up -d
# Comandos específicos para testar
```

**Critérios de Aceite:**
✅ Deve: [comportamento esperado]
❌ NÃO deve: [comportamento indesejado]
```

---

## Validação e Commits

### Validação Obrigatória

Após implementar tarefa:
1. Forneça comandos PowerShell específicos para teste
2. Inclua critérios claros de aceite
3. Aguarde confirmação antes de prosseguir

**Nota:** Ao fim de cada tarefa, o Cursor executará automaticamente o(s) comando(s) de teste informado(s) para verificar o resultado, especialmente em tarefas de backend.

**Exemplo:**
```powershell
docker-compose up -d
Invoke-WebRequest -Uri "http://localhost:3000/api/entries" -Method GET
# Abrir browser em http://localhost:3000/entry/new
```

**Critérios:**
- ✅ API retorna status 200
- ✅ Botão "Baixar PDF" visível na página
- ❌ Console não deve mostrar erros

### Commits Específicos

Após validação bem-sucedida:
```powershell
git add src/components/Summary.jsx src/api/reports.js
git commit -m "feat: adiciona botão download PDF - Funcionalidade 1.2"
```

**Regras:**
- 1 commit por tarefa validada
- Sempre especificar arquivos modificados
- Mensagem: `feat/fix: descrição - Funcionalidade X.Y`
- Nunca usar `git add .` ou `git commit -am`

---

## Conclusão de Funcionalidade

Uma funcionalidade está completa quando:
1. ✅ Todas tarefas implementadas e commitadas
2. ✅ Validação end-to-end realizada
3. ✅ Sistema funcionando corretamente
4. ✅ Documentação atualizada (se necessário)
5. ✅ **Roadmap atualizado** (obrigatório)

Ao finalizar a funcionalidade, revisar `README.md`, `ROADMAP.md` e `ARCHITECTURE.md` para garantir consistência entre código e documentação.

**Documentação que pode precisar atualização:**
- `frontend/README_FRONTEND.md`: componentes, rotas, bibliotecas
- `backend/README_BACKEND.md`: APIs, autenticação, endpoints
- `backend/DATABASE.md`: schema, tabelas, relacionamentos

---

## Atualização do Roadmap

**OBRIGATÓRIO:** Ao concluir uma funcionalidade, atualizar o roadmap de forma **sucinta e enxuta**.

### Formato de Atualização

Substituir a seção da funcionalidade completa por:

```markdown
##### X.Y Nome da Funcionalidade ✅
- **Status:** Concluída
- **Implementação:** 
  - [Resumo objetivo do que foi feito - 1 linha]
  - [Principal mudança técnica - 1 linha]
  - [Tratamentos/validações adicionadas - 1 linha se relevante]
- **Commit:** `tipo: descrição - Funcionalidade X.Y`
```

### Exemplos

**Antes:**
```markdown
##### 1.1 Correção do Token Dinâmico
- **Descrição:** Remover token hardcoded...
- **Critérios de Aceite:**
  - ✅ Deve remover constante TOKEN...
  - ✅ Deve obter token via...
  [10+ linhas de critérios]
```

**Depois:**
```markdown
##### 1.1 Correção do Token Dinâmico ✅
- **Status:** Concluída
- **Implementação:** 
  - Removido token hardcoded de `apps/back/src/services/ms-teams/index.ts`
  - Criado método `getAccessToken()` que obtém token via `azureService.getApplicationAccessToken()`
  - Adicionado tratamento de erro e log com timestamp
- **Commit:** `feat: substitui token hardcoded por token dinâmico - Funcionalidade 1.1`
```

### Regras

- ✅ **Máximo 3-4 linhas** na seção "Implementação"
- ✅ Adicionar **emoji ✅** no título da funcionalidade
- ✅ Manter apenas informações essenciais: o que mudou e onde
- ✅ Incluir nome exato do commit
- ❌ **NÃO** manter critérios de aceite originais
- ❌ **NÃO** incluir detalhes de validação
- ❌ **NÃO** adicionar contexto técnico extenso

### Benefícios

- 📌 Histórico claro do que foi implementado
- 🔍 Facilita encontrar commits específicos
- 🚀 Mantém roadmap limpo e navegável
- ✅ Rastreabilidade entre roadmap e código

---

## Princípios de Qualidade

**PowerShell-First**
- Comandos testados no Windows PowerShell
- Nunca assumir ambiente Linux

**Docker-First**
- Sistema sempre via container
- Dados em volumes persistentes
- Porta 3000 para acesso

**Incremental**
- Sistema funcionando após cada tarefa
- Validação obrigatória antes de prosseguir
- 1 commit por tarefa

**Simples e Funcional**
- Foco em funcionalidade sobre otimização
- Evitar complexidade prematura
- Código claro e direto

---

## Exemplo de Fluxo

**Dev:** "Vamos implementar a Funcionalidade 1.2: Relatório Individual de Entrada"

**Cursor:**
```
Analisando a funcionalidade...

Reflexão técnica:
- ARQUITETURA: Frontend (componente SummaryEntry) + Backend (API /api/reports/entry/:id)
- DADOS: Usa dados existentes, sem alteração de schema
- COMPLEXIDADE: 3 tarefas principais
- VALIDAÇÃO: Testar botão + download PDF + conteúdo do arquivo
- RISCOS: Garantir que dados do projeto são incluídos no PDF

Proposta de tarefas:

TAREFA 1.2.1: Criar API de Geração de PDF de Entrada
- Ações: 3 (criar rota, implementar função, configurar biblioteca)

TAREFA 1.2.2: Adicionar Botão no Componente SummaryEntry  
- Ações: 2 (adicionar botão, conectar com API)

TAREFA 1.2.3: Validação End-to-End
- Ações: 2 (testar fluxo completo, verificar conteúdo PDF)

Esta quebra faz sentido?
```

**Dev:** "Sim, pode implementar"

**Cursor:**
```
Vamos implementar a Tarefa 1.2.1: Criar API de Geração de PDF de Entrada

[implementa o código]

Validação PowerShell:
```powershell
docker-compose up -d
Invoke-WebRequest -Uri "http://localhost:3000/api/reports/entry/1" -Method GET -OutFile test.pdf
Get-Item test.pdf | Select-Object Name, Length
```

Critérios de Aceite:
✅ Deve: API retornar arquivo PDF válido
✅ Deve: Arquivo ter tamanho > 0 bytes
❌ NÃO deve: Retornar erro 500

Execute a validação e confirme se passou.
```

**Dev:** "Validação passou"

**Cursor:**
```
Ótimo! Agora vamos commitar:

```powershell
git add backend/routes/reports.js backend/services/pdfGenerator.js
git commit -m "feat: adiciona API de geração PDF de entrada - Funcionalidade 1.2"
```

Tarefa 1.2.1 concluída. Posso prosseguir para Tarefa 1.2.2?
```

**Dev:** "Sim"

[... implementa todas as tarefas ...]

**Cursor:**
```
Funcionalidade 1.2 completa! Atualizando roadmap...

[atualiza ROADMAP.md de forma sucinta]

✅ Roadmap atualizado.
Próxima funcionalidade: 1.3
```