# Goy Vote // O Protocolo de Consenso Técnico

O **Goy Vote** é o motor técnico de consenso do ecossistema. Ele fornece a camada fria, matemática e criptográfica para a tomada de decisões binárias ou de múltipla escolha. Como uma ferramenta de utilidade (feature), o Goy Vote pode ser integrado em qualquer outro serviço para validar a vontade dos participantes sem comprometer o sigilo ou a integridade.

## 1. O Conceito: A Urna Criptográfica

Ao contrário de sistemas de votação tradicionais, o Goy Vote foca-se na **transação do voto** e na sua verificação absoluta.

*   **Identidade e Sigilo:** Utiliza o [[Goy ID]] para validar o direito ao voto, mas emprega **Zero-Knowledge Proofs (ZKP)** para garantir que a escolha individual permaneça secreta.
*   **Imutabilidade:** Cada voto é um evento Nostr assinado e propagado. Uma vez na rede, o voto não pode ser alterado ou removido.
*   **Auditoria Matemática:** A contagem é pública e verificável em tempo real. Qualquer utilizador pode auditar o resultado final somando os eventos de voto assinados.

## 2. Casos de Uso (Módulo de Utilidade)

O Goy Vote é desenhado para ser integrado de forma "plug-and-play":
*   **[[Goy Social]]:** Sondagens rápidas, escolha de temas ou moderação comunitária.
*   **[[Goy Projects]]:** Aprovação de orçamentos específicos ou validação de marcos de entrega.
*   **[[Goy Play]]:** Eleição de "Melhor Jogador", votação em novos mapas ou modos de jogo.
*   **[[Goy Market]]:** Decisões coletivas em compras de grupo ou curadoria de produtos.

## 3. Resumo Técnico

| Atributo | Descrição |
| :--- | :--- |
| **Natureza** | Mecanismo técnico (Feature). |
| **Duração** | Pontual (Processo com início e fim definidos). |
| **Foco** | Transacional: "Sim/Não" ou "Opção A/B/C". |
| **Complexidade** | Simples: Soma de escolhas legítimas. |

---
[[The Goy Company|Início]] | [[Goy ID]], [[Goy Pay]], [[Goy Democracy]]
