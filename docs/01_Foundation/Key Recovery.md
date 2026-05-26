# Recuperação Soberana // Shamir's Secret Sharing (SSS)

A recuperação de chaves é o maior desafio para a adoção em massa do protocolo Nostr. A **[[The Goy Company]]** resolve este problema utilizando a tecnologia **Shamir's Secret Sharing (SSS)** — o "padrão ouro" para custódia soberana.

## 1. A Lógica: "Goy Magic Recovery"
Em vez de guardar a tua chave privada (`nsec`) num único local vulnerável, dividimo-la matematicamente em **3 partes (shards)**. Para reconstruir a chave original, são necessários pelo menos **2 de 3** shards. 

> **O Princípio:** Um shard isolado é apenas ruído matemático. Não revela absolutamente nada sobre o segredo original.

## 2. O Esquema 2-de-3 do Goy ID
Distribuímos a confiança para garantir que ninguém (nem a Goy Co.) tenha controlo total, mas que o utilizador nunca perca o acesso.

*   **Shard A (Local):** Guardado no dispositivo do utilizador (Secure Enclave / FaceID).
*   **Shard B (Goy Cloud):** Guardado nos servidores da [[The Goy Company]], cifrado e acessível via autenticação premium.
*   **Shard C (Offline/Social):** Um QR Code impresso (Goy Paper) ou entregue a um contacto de confiança ([[Goy ID|Goy Guardian]]).

### Cenário de Recuperação (Perda do Dispositivo)
1.  O utilizador adquire um novo dispositivo (perdeu o Shard A).
2.  Autentica-se na **Goy Cloud** e recupera o **Shard B**.
3.  Utiliza o seu **Shard C** (papel ou amigo).
4.  A app combina **B + C** e reconstrói a chave privada original localmente.

## 3. Valor de Negócio: Seguro de Identidade
Este sistema transforma-se num serviço de subscrição trilionário:
*   **Segurança contra Hacks:** Se a base de dados da Goy Co. for comprometida, os atacantes obtêm apenas o Shard B — que é inútil sem as outras partes.
*   **Paz de Espírito (B2C):** O utilizador paga uma mensalidade para a Goy Co. ser a sua guardiã de custódia parcial.
*   **Governação Corporativa (B2B):** Implementação de esquemas complexos (ex: 3-de-5) para tesouraria, onde múltiplos executivos devem assinar para reconstruir a autorização.

## 4. Vantagem Competitiva
Eliminamos o pânico das "12 palavras". Com o **Goy ID**, oferecemos a conveniência de um banco com a soberania de um protocolo descentralizado.

---
[[Goy ID]] | [[Profitability]]
