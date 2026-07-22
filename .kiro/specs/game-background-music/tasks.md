# Implementation Plan: Música de Fundo e Efeitos Sonoros

## Overview

Música de fundo via arquivos estáticos, tocando apenas no dispositivo do professor.
Sting de acerto/erro continua no aluno. Sem sintetizador Web Audio API.

## Tasks

- [x] 1. Adicionar arquivos de áudio estáticos em `frontend/public/audio/` (lobby, question, result, podium, correct-sting, wrong-sting)
- [x] 2. Criar `features/background-music/constants.ts` com mapeamento fase → path e tipo `MusicPhase`
- [x] 3. Criar `stores/useSettingsStore.ts` com `localMuted`, `volume`, middleware `persist` (localStorage)
- [x] 4. Implementar `useBackgroundMusic(phase, musicEnabledByAdmin)` — play/pause/fade de arquivos estáticos, sem synth fallback
- [x] 5. Implementar `playSting(correct, musicEnabledByAdmin)` — one-shot HTMLAudioElement, sem synth fallback, `console.warn` em caso de erro
- [x] 6. Montar `useBackgroundMusic` somente em `AdminPage.tsx` (professor)
- [x] 7. Remover chamada de `useBackgroundMusic` de `PlayerPage.tsx` (aluno não toca música de fundo)
- [x] 8. Deletar `utils/synthAudio.ts` — sintetizador Web Audio inteiro removido
- [x] 9. Criar `AdminMusicControl.tsx` — toggle global (emite `admin:musica`) + slider volume local
- [x] 10. Manter `PlayerVolumeControl.tsx` no `TopNavBar` do aluno — controla mudo/volume do sting
- [x] 11. Backend: handler `admin:musica` em `game.gateway.ts` — atualiza `musicEnabled` no estado e emite `game:musica` broadcast
- [x] 12. Frontend: listener `game:musica` em `usePlayerSocket` atualiza `musicEnabledByAdmin` na store

## Task Dependency Graph

```
1 → 2 → 4, 5
3 → 4, 5, 9, 10
4 → 6, 7
5 → 7
8
9 → 11
10 → 12
```

## Notes

- Todas as tasks estão implementadas e validadas.
- `PlayerVolumeControl` continua existindo e é usado no `TopNavBar` — afeta volume do sting no aluno.
- Se algum arquivo de áudio estiver ausente/corrompido em `public/audio/`, o comportamento é silêncio + log de warning — não quebra a UX.
