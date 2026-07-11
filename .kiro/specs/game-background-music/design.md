# Design — Música de Fundo Durante o Jogo

## Estrutura

```
features/background-music/
  ├── assets/  (referenciadas via import ou /public — decidir por tamanho de bundle)
  │   ├── lobby-ambient.mp3
  │   ├── question-tension.mp3
  │   ├── correct-sting.mp3
  │   ├── wrong-sting.mp3
  │   └── podium-celebration.mp3
  ├── components/
  │   └── MusicToggle.tsx        # ícone na TopNavBar + popover de volume
  └── constants.ts                # mapa fase → arquivo
```

Arquivos de áudio ficam em `frontend/public/audio/` (servidos estaticamente, fora do
bundle JS) para não engordar o `main.js` e permitir lazy-load real via `<audio
src="/audio/lobby-ambient.mp3" preload="none">`.

## `hooks/useBackgroundMusic.ts`

```ts
export function useBackgroundMusic() {
  const musicEnabled = useSettingsStore((s) => s.musicEnabled)
  const volume = useSettingsStore((s) => s.volume)
  const status = useGameStore((s) => s.status) // 'lobby' | 'pergunta_ativa' | ...
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!musicEnabled) { audioRef.current?.pause(); return }
    const track = trackForStatus(status) // constants.ts
    crossfadeTo(audioRef, track, volume)  // fade-out atual + fade-in nova, ~400ms
  }, [status, musicEnabled])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])
}
```

Chamado uma única vez, no nível de `pages/player/*` (layout comum) e também no
dashboard do professor, cada lado com seu próprio elemento `<audio>` (não
compartilham instância, pois são abas/dispositivos diferentes).

## `MusicToggle.tsx`

- Ícone de alto-falante (lucide-react `Volume2`/`VolumeX`) dentro da `TopNavBar`.
- Clique curto: `useSettingsStore.getState().toggleMusic()`.
- Popover (shadcn) com um `Slider` (shadcn) ligado a `setVolume`.

## Efeitos curtos de acerto/erro

`ResultPage` dispara `playSting('correct' | 'wrong')` uma vez ao montar (função
utilitária que cria um `Audio()` avulso, toca e descarta — não interfere no loop de
fundo, que continua tocando em volume levemente reduzido durante o efeito, se
tecnicamente simples de implementar; caso contrário, pausar o loop por ~1.5s e
retomar).

## Acessibilidade e boas práticas

- Autoplay nunca é disparado sem interação prévia do usuário (respeita política dos
  navegadores e evita som inesperado em sala de aula).
- `motion-reduce`/preferências de acessibilidade não afetam áudio diretamente, mas o
  toggle deve ter `aria-pressed` refletindo o estado.

## Critérios de aceite

- Música começa desligada por padrão; ligar uma vez persiste entre reloads.
- Trocar de fase do jogo troca a faixa sem corte abrupto perceptível.
- Nenhuma chamada de áudio bloqueia o clique em `OptionButton` (teste manual: clicar
  para responder imediatamente após a pergunta aparecer).
