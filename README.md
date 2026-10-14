# SCARS: Space Core Anomaly RPG System

Sistema de horror espacial para o [Foundry VTT](https://foundryvtt.com/) versão 14.

A tripulação de uma nave enfrenta o que veio do outro lado do salto dimensional com regras simples: quatro atributos, um d20 contra a dificuldade, vantagem pela profissão, Pontos de Vida e Sanidade.

## Instalação

No Foundry, vá em **Game Systems → Install System** e cole o link do manifesto:

```
https://github.com/ninguemdev/SCARS/releases/latest/download/system.json
```

Requer Foundry VTT v14. A interface está em português do Brasil; selecione o idioma **Português (Brasil)** nas configurações do Foundry.

## Regras em resumo

- **Atributos:** Corpo, Reflexos, Mente e Nervos. Na criação, o jogador distribui +3, +2, +1 e 0.
- **Testes:** `1d20 + atributo` contra a dificuldade (Muito fácil 5, Fácil 10, Normal 15, Difícil 20 ou personalizada). Com vantagem, rola dois d20 e fica com o maior.
- **Natural 20:** sucesso automático, com algo a mais. **Natural 1:** falha automática.
- **Pontos de Vida:** 10 + Corpo + bônus. Em 0 PV, o tripulante está Morrendo.
- **Sanidade:** 10 + Nervos + bônus. O teste de horror é um teste de Nervos; na falha, perde 1d4 de Sanidade (1d6 em cena pesada). Com metade ou menos fica Abalado; em 0 perde o controle por uma cena.
- **Profissões:** cada uma tem um domínio, que dá vantagem nos testes em que se aplica, uma maestria e um kit de equipamento.

## O que o sistema faz

### Fichas

- **Tripulante:** perfil, atributos, PV e Sanidade com bônus, estados Abalado e Morrendo, aviso de distribuição de atributos inválida e abas de profissão, habilidades e equipamento.
- **Ameaça:** dificuldade, dano e derrota por PV ou por sucessos acumulados, com o marcador "Derrotada".
- **Itens:** profissão (domínio e descrição), habilidade (usos, usos ilimitados, "uma vez por pessoa", restauração na nova missão e aviso de teste) e equipamento (fórmula de dano ou cura e usos com nome próprio, como cargas, munição ou casco).

### Rolagens e chat

- Clique em um atributo para rolar o teste: o diálogo pede a dificuldade e a vantagem, e o card mostra o total, o natural e o resultado.
- O botão de teste de horror aplica a perda de Sanidade na falha. O mestre recebe uma mensagem privada quando um tripulante fica Abalado ou chega a 0 de Sanidade.
- O botão **Usar** de habilidades e equipamentos gasta um uso, rola a fórmula de dano ou cura quando existe e mostra o aviso de teste da habilidade. Com 0 usos, o botão fica desabilitado.
- Os cards de dano e cura têm o botão **Aplicar ao token selecionado**, que respeita os limites de 0 e do máximo de PV.
- O mestre rola o dano de uma ameaça pela ficha dela.
- **Maestria do comandante ("Na minha nave, não"):** nos cards de teste de atributo com falha, o jogador do comandante pode fazer a pessoa rolar de novo com vantagem. Cada pessoa recebe uma vez por missão.

### Compêndio

O compêndio **Tripulação: profissões, habilidades e equipamentos** traz as cinco profissões (comandante e piloto, físico dimensional, médico e biólogo, engenheiro de sistemas e neurocientista) com as maestrias e os kits, além do equipamento que todo tripulante carrega. Arraste os itens para a ficha do tripulante.

### Macros

Arraste um atributo, uma habilidade ou um equipamento da ficha para a barra de macros para criar um atalho.

As mesmas ações ficam disponíveis em `game.scars.api` para macros de script:

| Função | O que faz |
| --- | --- |
| `rollTest(actorUuid, attribute, { difficulty, advantage })` | Teste de atributo (`body`, `reflexes`, `mind` ou `nerve`). `difficulty` aceita `"veryEasy"`, `"easy"`, `"normal"`, `"hard"` ou um número; sem ela, abre o diálogo. |
| `rollHorror(actorUuid, { difficulty, advantage, heavyScene })` | Teste de horror. |
| `useItem(itemUuid)` | Usa uma habilidade ou um equipamento. |
| `startNewMission()` | Só o mestre: restaura os usos das maestrias de todos os tripulantes e libera de novo a maestria do comandante. |

Exemplo de macro do mestre para começar uma nova missão:

```js
game.scars.api.startNewMission();
```

## Desenvolvimento

Requer Node.js 22 ou mais recente.

```sh
npm install          # ferramentas de desenvolvimento
npm run lint         # ESLint
npm test             # testes das regras e do conteúdo do compêndio
npm run build:packs  # compila o compêndio de packs/_source para packs/
```

Para testar no Foundry, crie um link da pasta do repositório em `Data/systems/scars` (no Windows, uma junction com `mklink /J`), rode `npm run build:packs` com o mundo fechado e abra um mundo com o sistema. Mudanças no `system.json` exigem voltar à tela de setup.

O compêndio é mantido como JSON em `packs/_source/`, um arquivo por documento; a versão compilada em `packs/` não entra no repositório.

### Organização do código

| Pasta | Conteúdo |
| --- | --- |
| `module/rules/` | Regras puras, sem dependência do Foundry, testadas com `node --test`. |
| `module/data/` | Modelos de dados dos atores e itens. |
| `module/documents/`, `module/rolls/` | Lógica de jogo sobre a API do Foundry. |
| `module/sheets/` | Fichas (ApplicationV2). |
| `module/macros/` | API pública e barra de macros. |
| `templates/`, `styles/`, `lang/` | Interface, estilo e textos. |

### Publicar uma versão

Publique uma release no GitHub com a tag da versão, por exemplo `v0.2.0`. O workflow `release.yml` roda o lint e os testes, grava a versão no `system.json`, compila o compêndio e anexa `system.json` e `scars.zip` à release.

## Licença

[MIT](LICENSE)
