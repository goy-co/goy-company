# Goy Mail // Comunicação Assíncrona Autenticada

O **Goy Mail** é a ferramenta definitiva para o setor empresarial e para o utilizador que exige soberania na sua comunicação oficial. Em vez de "consertar" o email tradicional (SMTP), o Goy Mail utiliza o protocolo Nostr para criar um sistema de mensagens assíncronas autenticadas, mantendo a compatibilidade com o "mundo velho" através de gateways inteligentes.

## 1. O Conceito: Email sem Servidor Central
Ao contrário do Gmail ou Outlook, onde os teus dados pertencem à Big Tech:
*   **Identidade Soberana:** O teu endereço é a tua `npub`. As mensagens são eventos Nostr (NIP-17) dirigidos a ti.
*   **Descentralização Total:** O histórico vive nos relays, não num servidor proprietário. Se um fornecedor de interface cair, mudas de app e os teus emails continuam lá.

## 2. Funcionalidades Anti-Big Tech
*   **Inbox Inteligente (WoT):** Utilização do [[Goy ID|Goy Score]] para triagem. Emails de entidades fora da tua rede de confiança exigem um **Micro-Zap** (ex: 100 sats) para entrar na Inbox principal. Isto elimina o spam por via económica.
*   **Encriptação Nativa:** Todas as comunicações são cifradas de ponta-a-ponta. A Goy Company armazena o tráfego, mas nunca consegue ler o conteúdo.
*   **Phishing-Proof:** Todas as mensagens devem ser assinadas digitalmente. A interface valida a `npub` do remetente (ex: o teu banco), tornando o phishing tecnicamente impossível.

## 3. Interface e Produtividade
*   **Anexos via [[Goy Drive]]:** Envio de links cifrados em vez de ficheiros pesados, otimizando o armazenamento e a segurança.
*   **UX Familiar:** Organização em threads, pastas e snoozing, mas com a robustez da criptografia por baixo.

## 4. Integração Híbrida (A Ponte SMTP)
Como comunicar com endereços `@gmail.com` ou `@outlook.com`:
*   **Goy Gateway:** O servidor da Goy Co. atua como tradutor. Emails SMTP recebidos são convertidos em eventos Nostr cifrados.
*   **Outgoing Bridge:** Respostas do Goy Mail para o mundo Web2 são convertidas de volta para o formato tradicional, assinadas com DKIM/SPF geridos pela infraestrutura Goy.

## 5. Monetização e Valor Empresarial
1.  **Goy Mail Business:** Subscrições para domínios personalizados e ferramentas de e-discovery/compliance.
2.  **Taxa de Gateway:** Cobrança por volume de mensagens trocadas com o mundo fora do Nostr.
3.  **Cross-sell de Armazenamento:** Aumento de receitas via [[Goy Drive]] à medida que o histórico de anexos cresce.

---

## 📊 Comparativo: Goy Mail vs. Soluções Legadas

| Problema | Outlook / Gmail | Goy Mail |
| :--- | :--- | :--- |
| **Spam** | Filtros de IA (falíveis). | **Económico:** Spam custa Sats. |
| **Privacidade** | Mineração de dados. | **Encriptação P2P:** Privacidade Total. |
| **Segurança** | Phishing constante. | **Criptográfico:** Assinatura Verificada. |
| **Soberania** | Contas podem ser banidas. | **Impossível:** Tu deténs a chave. |

---

## 🛠️ Roadmap MVP
1.  **Módulo NIP-17:** Implementação de mensagens assíncronas cifradas.
2.  **Gateway SMTP Base:** Servidor de tradução para interoperabilidade inicial.
3.  **Filtro WoT:** Sistema de triagem baseado na reputação do [[Goy ID]].

--- 
[[The Goy Company|Início]] | Base Tecnológica: [[Goy ID]], [[Hybrid Strategy]]
