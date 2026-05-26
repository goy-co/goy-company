# Goy Hardware // A Interface Física da Soberania

O **Goy Hardware** representa a ponte entre o protocolo digital e o mundo físico. Para garantir soberania total, não podemos depender apenas de dispositivos generalistas (telemóveis/PCs) que podem ser comprometidos a nível de hardware. Criamos uma suite de dispositivos especializados com segurança de grau militar.

## 1. Goy Card: O Teu Passaporte Criptográfico

O Goy Card é um cartão inteligente (Smart Card) com chip de segurança **EAL6+**, desenhado para ser o cofre físico da tua identidade.

*   **Armazenamento de Chave Próprio:** A tua `nsec` reside no chip do cartão e nunca é revelada ao telemóvel ou leitor. O cartão assina os desafios criptográficos internamente via NFC.
*   **Funcionalidades:**
    *   **Pagamentos:** Pagamentos por aproximação no [[Goy Pay]].
    *   **Acessos:** Chave para casas e escritórios via [[Goy Estate]] e entrada em eventos via [[Goy Ticket]].
    *   **Login:** Toque físico no telemóvel para desbloquear o [[Goy OS]] ou autorizar transações de alto valor.

## 2. Goy Tags: Sensores IoT para a Grid Física

As Goy Tags são pequenos dispositivos de monitorização e localização que alimentam a inteligência da infraestrutura.

*   **Logística Inteligente:** Integradas no [[Goy Logistics]], as Tags medem temperatura, humidade e impacto, assinando eventos Nostr em tempo real.
*   **Goy Home:** Sensores de inundação, fumo e intrusão que comunicam diretamente com o teu [[Goy Cloud|Goy Node]] via protocolo Mesh/Bluetooth de baixa energia.
*   **Privacidade P2P:** As Tags não comunicam com uma nuvem central; elas enviam dados cifrados apenas para os Relays autorizados pelo dono da tag via [[Goy ID]].

## 3. Segurança de Canal (Goy Shield)

Toda a comunicação entre o hardware (Card/Tags) e o **Goy Node** é protegida:
*   **Cifragem de Canal:** Proteção contra ataques de "Man-in-the-Middle" ou "Relay Attacks" no NFC.
*   **Handshake Criptográfico:** A Tag só fala com o Node se ambos apresentarem assinaturas válidas reconhecidas pela Web of Trust do dono.

## 4. Portefólio de Hardware

| Dispositivo | Função Principal | Integração Chave |
| :--- | :--- | :--- |
| **Goy Card** | Cofre de Chaves e Pagamentos. | [[Goy Wallet]], [[Goy Pay]] |
| **Goy Tag (Log)** | Telemetria de mercadorias. | [[Goy Logistics]], [[Goy Insurance]] |
| **Goy Tag (Home)** | Monitorização doméstica. | [[Goy Estate]], [[Goy Desk]] |
| **Goy Node** | Cérebro e Servidor local. | [[Goy Relay]], [[Goy OS]] |

---
[[The Goy Company|Início]] | [[Goy Node]], [[Goy Logistics]], [[Goy Wallet]]
