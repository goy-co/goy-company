# Goy OS // O Sistema Operativo Soberano

O **Goy OS** é a base de confiança para todo o ecossistema de hardware da The Goy Company. Ele não é apenas um sistema operativo; é uma fortaleza digital desenhada para proteger a chave privada (`nsec`) do utilizador e garantir que o hardware serve o dono, e não o fabricante ou terceiros.

## 1. O Conceito: Trusted Execution Environment (TEE)

Ao contrário do Android ou iOS, que dependem de kernels proprietários e telemetria constante, o Goy OS é construído sobre uma base Hardened Linux (inspirada em GrapheneOS) com modificações profundas de segurança.

*   **Permissões Criptográficas:** O acesso ao hardware (câmara, microfone, GPS) é gerido por permissões assinadas via [[Goy ID]]. Nenhuma aplicação pode aceder a sensores sem que o utilizador assine um desafio criptográfico temporário.
*   **Encapsulamento de Chaves:** A chave mestra nunca toca a memória principal (RAM). Ela reside num módulo de segurança de hardware (HSM) isolado, sendo acedida apenas pelo kernel do Goy OS para assinatura de eventos Nostr ou transações Lightning.

## 2. Goy App Store: Distribuição Sem Censura

A loja de aplicações do Goy OS utiliza o protocolo Nostr como backend de distribuição.

*   **Curadoria via WoT:** Em vez de moderadores centrais, a visibilidade das apps é ditada pelo [[Goy Score]] dos programadores e pelas avaliações da sua rede de confiança.
*   **Assinatura de Código:** Todas as apps são assinadas digitalmente. O utilizador pode verificar o hash do código fonte (Open Source) antes da instalação, garantindo que o que executa é exatamente o que foi auditado.

## 3. Experiência de Utilizador (UX Soberana)

*   **Zero Telemetria:** O sistema não comunica com servidores centrais. As atualizações são descarregadas via [[Goy Relay]] e validadas localmente.
*   **Privacy-by-Default:** VPN nativa ligada ao teu [[Goy Cloud|Goy Node]], DNS cifrado e isolamento de processos (Sandboxing) em nível militar.

## 4. Integração com a Grid Goy

O Goy OS fornece as APIs de sistema que alimentam o resto da stack:
*   **NFC Stack:** Comunicação direta com o **Goy Card** e **Goy Tags**.
*   **Lightning Daemon:** Serviço de sistema sempre ativo para liquidação imediata via [[Goy Pay]].
*   **Identity Service:** Gestor de `npub` que centraliza o login em todos os serviços sem passwords.

---
[[The Goy Company|Início]] | [[Goy ID]], [[Goy Node]], [[Goy Hardware]]
