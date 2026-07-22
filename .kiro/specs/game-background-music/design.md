# Design: Música de Fundo e Efeitos Sonoros

## Arquitetura

```
┌──────────────────────────────────┐       ┌─────────────────────────────┐
│ Professor (AdminPage)            │       │ Aluno (PlayerPage)          │
│                                  │       │                             │
│  useBackgroundMusic(phase, on)   │       │  (sem useBackgroundMusic)   │
│  ↓                               │       │                             │
│  HTMLAudioElement (loop, fade)   │       │  ResultPage → playSting()   │
│  ↓                               │       │  ↓                         │
│  Speaker / compartilhamento      │       │  HTMLAudioElement (one-shot)│
│  de tela com a turma             │       │  ↓                         │
│                                  │       │  Fone/speaker do aluno      │
└──────────────────────────────────┘       └─────────────────────────────┘
```

## Arquivos estáticos (`frontend/public/audio/`)

| Arquivo | Uso |
|---|---|
| `lobby-ambient_01.mp3` | Fase lobby (professor) |
| `question-tension_01.mp3` | Fase pergunta (professor) |
| `lobby-ambient_02.mp3` | Fase resultado (professor) |
| `podium-celebration.mp3` | Fase pódio (professor) |
| `correct-sting.mp3` | Sting acerto (aluno) |
| `wrong-sting.mp3` | Sting erro (aluno) |

## Componentes e hooks

### `useBackgroundMusic(phase, musicEnabledByAdmin)` — hook

- Montado em `AdminPage.tsx` (professor only)
- Cria `new Audio(trackSrc)`, `audio.loop = true`
- Fade-in progressivo (400ms, 20 steps)
- Troca de faixa: pause a anterior, inicia a nova com fade-in
- Se `play()` falhar: `console.warn`, sem fallback

### `playSting(correct, musicEnabledByAdmin)` — função exportada

- Chamada em `ResultPage.tsx` no `useEffect` ao receber resultado
- Lê `localMuted`/`volume` de `useSettingsStore.getState()`
- Se `!musicEnabledByAdmin || localMuted`: nada
- `new Audio(src)`, `audio.volume = volume * 0.8`, `audio.play()`
- Se falhar: `console.warn`, sem fallback

### `AdminMusicControl` — UI do professor

- Botão toggle liga/desliga música global (emite `admin:musica`)
- Popover com slider de volume local
- Lê `musicEnabledByAdmin` de `useAdminStore`

### `PlayerVolumeControl` — UI do aluno (no TopNavBar)

- Botão mute/unmute + slider de volume
- Afeta apenas o sting (não há música de fundo no aluno)
- Lê/escreve em `useSettingsStore` (persist localStorage)

### `useSettingsStore` (Zustand + persist)

- `localMuted: boolean` — mudo local (ambos os dispositivos)
- `volume: number` — 0 a 1
- Persiste em `localStorage` (key `quizlive-settings`)

### `constants.ts`

- `MusicPhase`: `'idle' | 'lobby' | 'question' | 'result' | 'podium'`
- `TRACKS`: mapeamento phase → path do arquivo
- `STINGS`: `{ correct, wrong }` → paths
- `FADE_MS`: 400ms

## O que foi removido

- `utils/synthAudio.ts` — sintetizador Web Audio API inteiro (playSynthLoop, playSynthSting, stopAllSynth)
- Chamada de `useBackgroundMusic` em `PlayerPage.tsx`
- Todo import de `synthAudio` em `useBackgroundMusic.ts`
