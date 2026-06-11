---
title: Arquitetura // Monorepo Blueprint
description: O mapa técnico do ecossistema The Goy Company.
---

O monorepo da The Goy Company é gerido utilizando **pnpm workspaces**. Está desenhado para entrega de alta performance através da rede Edge da Cloudflare.

## Estrutura do Projeto

### `/apps`
Interfaces de utilizador e serviços de backend.
- **`fe-corporate`**: (@goy-co/fe-corporate) O portal público (Astro 5). Focado em entrega estática de alta velocidade e presença corporativa.
- **`fe-identity`**: (@goy-co/fe-identity) O dashboard "GoyID". Uma SPA em Svelte 5 embebida em Astro, focada em gestão de identidade em tempo real e controlo de ativos.
- **`docs`**: (@goy-co/docs) O hub central de documentação (Astro Starlight).
- **`be-api`**: (@goy-co/be-api) O sistema nervoso central. Um Cloudflare Worker que gere lookups de Identidade Híbrida, integração Better Auth e base de dados D1. Inclui:
  - **NostrAgent**: Um Durable Object que gere uplinks WebSocket em tempo real para telemetria e mensagens descentralizadas.

### `/packages`
Lógica partilhada e componentes UI sob o scope `@goy-co/`.
- **`nostr`**: (@goy-co/nostr) Implementação core do protocolo, lógica de assinatura e helpers para interação com relays.
- **`ui`**: (@goy-co/ui) Design tokens partilhados e componentes primitivos seguindo a spec Brutalist Luxury.
- **`design-system`**: (@goy-co/design-system) A especificação mestre e tokens de design.
- **`types`**: (@goy-co/types) Definições TypeScript comuns.
- **`config-ts`**: (@goy-co/config-ts) Configurações TypeScript partilhadas.
- **`config-eslint`**: (@goy-co/config-eslint) Configurações ESLint partilhadas.

## Fluxo de Identidade
1. **Entrada**: O utilizador seleciona Portal Access (Email) ou Sync Access (Nostr).
2. **Agregador**: A `be-api` recebe o pedido e executa um lookup multi-camada (D1 para utilizadores tradicionais, Nostr relays para soberanos).
3. **Uplink**: O Durable Object `NostrAgent` cria um link WebSocket em tempo real para sincronizar o dashboard instantaneamente.

## Camada de Persistência
- **Cloudflare D1**: Base de dados SQL relacional para dados de utilizador tradicionais e cache de metadados soberanos.
- **Cloudflare R2**: Armazenamento de ativos para avatars, banners e artefactos digitais.
- **Nostr Relays**: A fonte da verdade para todos os metadados de entidades soberanas.
