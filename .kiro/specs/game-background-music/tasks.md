# Implementation Plan: Música de Fundo Durante o Jogo

## Overview

Adicionar música de fundo opcional ao jogo (tela do aluno e dashboard do professor), com crossfade entre fases, controle de volume e toggle persistente. Implementado com elementos `<audio>` nativos e hook custom — sem lib pesada de áudio.

## Tasks

- [ ] 1. Criar `stores/useSettingsStore.ts` com `musicEnabled` (default true), `volume` (0–1, default 0.4), `toggleMusic()`, `setVolume()` e middleware `persist` (localStorage key `quizlive-settings`)
- [ ] 2. Adicionar arquivos de áudio livres de direitos em `frontend/public/audio/` (lobby.mp3, question.mp3, result.mp3, podium.mp3 — usar placeholders até definição final)
- [ ] 3. Criar `features/background-music/constants.ts` com mapa de fase (`GameScreen`) → caminho do arquivo de áudio
- [ ] 4. Criar `hooks/useBackgroundMusic.ts`: troca de faixa ao mudar `screen`, respeita `musicEnabled` e `volume` da store, fade-out/in via `gainNode` se `AudioContext` disponível, fallback gracioso se não
- [ ] 5. Criar `features/background-music/components/MusicToggle.tsx` com ícone de volume, popover de slider (shadcn `Slider`) e toggle on/off; acessível por teclado
- [ ] 6. Integrar `MusicToggle` na `TopNavBar` compartilhada (criar `components/shared/TopNavBar.tsx` se ainda não existir)
- [ ] 7. Chamar `useBackgroundMusic()` no layout do fluxo do aluno (`PlayerPage.tsx`) e no dashboard do professor
- [ ] 8. Reproduzir efeito curto de acerto/erro (via `<audio>` separado) em `ResultPage` e `QuestionResultView`
- [ ] 9. Teste manual: alternar entre todas as fases, confirmar troca de faixa sem travar UI; testar toggle de música; testar com `prefers-reduced-motion` (não afeta áudio, mas confirmar que animações respeitam a preferência)

## Task Dependency Graph

```
1 → 4 → 7
2 → 3 → 4
5 → 6 → 7
4, 7 → 8 → 9
```

## Notes

- Depende de `state-management-zustand` task 5 (`useSettingsStore`) — pode ser implementada junto.
- Depende de `design-system-tailwind-migration` task 4 (shadcn `slider`) para o controle de volume.
- Respeitar autoplay policy dos browsers: a música só inicia após primeira interação do usuário (botão "Entrar na Arena").
- `AudioContext` deve ser criado/retomado no handler de click, não no mount do componente.
