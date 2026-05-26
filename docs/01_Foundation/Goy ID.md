# Goy ID // O Alicerce da Identidade Soberana

O **Goy ID** é o alicerce de todo o império **[[The Goy Company]]**. Enquanto os gigantes tradicionais atuam como "guardiões das chaves", o Goy ID inverte o paradigma: devolve as chaves ao utilizador, enquanto monetiza a fechadura, a segurança e a conveniência.

## 1. O Produto: "Sovereignty as a Service"
O Goy ID não é apenas uma conta; é um **Vault (Cofre) de Identidade**.
*   **A Chave (nsec):** O utilizador gera a sua chave privada localmente. A Goy Company nunca tem acesso a ela em texto simples.
*   **Interface Amigável:** Utilização de biometria (FaceID/TouchID) para assinar transações e logins, abstraindo a complexidade das strings hexadecimais.
*   **NIP-05 Premium:** Endereços humanos verificados (ex: `nome@goy.id`). Isto valida a `npub` como "oficial" no ecossistema.

## 2. Recuperação de Conta: [[Key Recovery|Social & Cloud Recovery]]
Resolvemos o maior ponto de falha do Nostr (perda de chaves) através da tecnologia **Shamir's Secret Sharing (SSS)**.
*   **Esquema 2-de-3:** A chave é dividida em 3 shards (Dispositivo, [[Key Recovery#Shard B (Goy Cloud)|Goy Cloud]] e [[Key Recovery#Shard C (Offline/Social)|Social/Paper]]).
*   **Recuperação Soberana:** O utilizador reconstrói a chave combinando dois shards, sem que a Goy Co. tenha acesso à chave completa.
*   **Seguro de Identidade:** Modelo de subscrição premium para custódia de shards e suporte na recuperação.

## 3. O [[Goy Score]] (Camada de Confiança)
Motor de **Web of Trust (WoT)** integrado diretamente no ID para resolver a confiança em redes descentralizadas.
*   **Vectores de Reputação:** Score calculado com base em identidade, histórico financeiro ([[Goy Pay]]), transações comerciais ([[Goy Market]]) e conduta social.
*   **Filtro Inteligente:** Proteção nativa contra spam e fraudes no [[Goy Chat]] e [[Goy Mail]] baseada em reputação.
*   **Certificação:** Opção de boost via prova de humanidade (Proof of Personhood).

## 4. Funcionalidades Enterprise (A Federação)
SSO (Single Sign-On) Descentralizado para organizações.
*   **Delegated Keys:** Emissão de sub-identidades para funcionários.
*   **Permissões:** Controlo de acesso a Relays e documentos no [[Goy Drive]].
*   **Revogação:** Invalidação instantânea de identidades corporativas no diretório central.

## 5. Estratégia de Monetização
*   **Subscrições NIP-05:** Aluguer anual de handles e domínios personalizados.
*   **Goy Auth API:** Taxas para aplicações de terceiros utilizarem o sistema de reputação e verificação.
*   **Seguro de Identidade:** Subscrição para suporte 24/7 e custódia segura.

---

## 🛠️ Roadmap MVP
1.  **App Goy ID:** Gerador de chaves + Keychain segura.
2.  **Servidor NIP-05:** Mapeamento de identidades humanas.
3.  **Módulo de Reputação:** Algoritmo inicial de WoT baseado em interações Nostr.

---
[[The Goy Company|Início]] | Próximo passo: [[Goy Pay]]
