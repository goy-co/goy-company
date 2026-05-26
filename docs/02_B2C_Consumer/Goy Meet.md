# Goy Meet // Videoconferência Soberana e P2P

O **Goy Meet** é a peça final do ecossistema de produtividade **[[The Goy Company]]**, desenhado para substituir o Zoom, Google Meet e Microsoft Teams. Ao contrário das plataformas tradicionais, o Goy Meet utiliza o Nostr para sinalização e tecnologias Peer-to-Peer (P2P) para o tráfego de vídeo, garantindo que a privacidade não seja um luxo, mas uma propriedade técnica.

## 1. O Produto: "The Invisible Boardroom"
Privacidade absoluta para reuniões críticas (conselhos de administração, consultas médicas, advocacia):
*   **Sinalização via Nostr:** Início de chamadas através de eventos Nostr cifrados contendo os detalhes técnicos da ligação.
*   **WebRTC de Ponta a Ponta:** Vídeo e áudio viajam diretamente entre participantes. A Goy Company nunca acede ao fluxo de dados.
*   **Acesso Criptográfico:** A entrada em salas é validada por convites assinados pela `npub` do organizador via [[Goy ID]].

## 2. Funcionalidades de Valor Estratégico
*   **Zaps por Minuto:** Monetização em tempo real via [[Goy Pay]]. Ideal para consultoria, onde o débito ocorre enquanto a chamada está ativa.
*   **Transcrição Local via IA:** Processamento de áudio no dispositivo do utilizador, com gravação automática e cifrada no [[Goy Drive]].
*   **Goy Whiteboard:** Colaboração visual em tempo real onde cada traço é um evento Nostr efémero.

## 3. Escalabilidade Híbrida: Goy SFU
Para conferências de larga escala (50+ pessoas), oferecemos infraestrutura de suporte:
*   **Relays de Vídeo (SFU):** Servidores de alta performance que reencaminham pacotes cifrados sem capacidade de descodificação (sem acesso às chaves).
*   **Modelo de Uso:** Cobrança empresarial baseada na utilização desta infraestrutura de retransmissão.

## 4. Integração com o Ecossistema
*   *[[Goy Chat]]:** Início instantâneo de reuniões a partir de qualquer conversa de grupo.
*   *[[Goy Mail]]:** Convites de reunião integrados no calendário com autorização baseada em identidade soberana.
*   **Controlo de Acesso via WoT:** Configuração de salas baseada no [[Goy ID|Goy Score]] para evitar spam ou intrusões.

## 5. Monetização (B2B e B2C)
1.  **Assinaturas Corporativas:** Salas permanentes, gravação em nuvem e suporte SFU.
2.  **Marketplace de Webinars:** Gestão de bilhetes e acessos para cursos ao vivo com comissão sobre Zaps de entrada.
3.  **Goy Meet API:** Licenciamento da infraestrutura para serviços de telemedicina e ensino à distância.

---

## 📊 Comparativo: Goy Meet vs. Soluções Centralizadas

| Característica | Zoom / Teams | Goy Meet |
| :--- | :--- | :--- |
| **Segurança** | Cifragem com chaves na empresa. | **Cifragem Real:** Chaves nos participantes. |
| **Pagamentos** | Integração externa complexa. | **Nativo:** Zaps por minuto via [[Goy Pay]]. |
| **Privacidade** | Metadados monitorizados. | **Soberania:** Relações de reunião privadas. |
| **Infraestrutura** | Software pesado e invasivo. | **Leve:** Baseado em browser e Nostr. |

---

## 🛠️ Roadmap MVP
1.  **Sinalização Nostr:** Protocolo de handshake para chamadas P2P.
2.  **Cliente WebRTC:** Interface básica de vídeo/áudio no browser.
3.  **Integração de Zaps:** Sistema de pagamento básico por sessão.

--- 
[[The Goy Company|Início]] | Base Tecnológica: [[Goy ID]], [[Goy Pay]]
