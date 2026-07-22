# Requirements: Música de Fundo e Efeitos Sonoros

## Contexto

Música de fundo toca **exclusivamente no dispositivo do professor**, que compartilha
a tela/áudio do computador com a turma via projetor ou tela compartilhada. Efeitos
sonoros curtos (sting de acerto/erro) continuam tocando no dispositivo de cada aluno.

## Requisitos Funcionais

### RF-1: Música de fundo — professor only

- A música de fundo usa arquivos estáticos em `public/audio/` (lobby, question,
  result, podium).
- O hook `useBackgroundMusic` é montado somente no `AdminPage`, nunca no `PlayerPage`.
- Nenhum sintetizador Web Audio API — se o arquivo estático falhar ao tocar
  (autoplay bloqueado, arquivo ausente, etc.), falhar silenciosamente com
  `console.warn`, sem fallback.

### RF-2: Controle global de música pelo professor

- O professor pode ligar/desligar a música para todos via evento `admin:musica`.
- Quando desligada, o hook não tenta tocar nenhum arquivo.
- O toggle é exposto via `AdminMusicControl` no header do painel admin.

### RF-3: Volume local do professor

- O professor pode ajustar o volume da música no seu dispositivo via slider no
  `AdminMusicControl`.
- Volume persiste em `localStorage` via `useSettingsStore` (middleware `persist`).

### RF-4: Sting de acerto/erro — aluno

- Ao receber `game:resultadoPergunta`, o frontend do aluno toca um som curto:
  `correct-sting.mp3` (acerto) ou `wrong-sting.mp3` (erro).
- O sting respeita `musicEnabledByAdmin` (professor precisa ter ligado música) e
  `localMuted` (aluno pode mutar localmente).
- Se o arquivo de sting falhar, `console.warn` e nada mais — sem synth fallback.

### RF-5: Controle local do aluno (mudo + volume)

- O aluno pode mutar localmente e ajustar volume via `PlayerVolumeControl` no
  `TopNavBar`.
- Isso afeta apenas o sting (já que a música de fundo não toca no dispositivo dele).
- Estado persiste em `localStorage` (useSettingsStore).

### RF-6: Troca de faixa por fase do jogo

- Quando a fase muda (lobby→question→result→podium), o professor ouve a faixa
  correspondente com fade-in suave.
- Mapeamento de fase → arquivo definido em `constants.ts`.

## Fora de escopo

- Sintetizador / Web Audio API — completamente removido.
- Crossfade entre faixas (fade-out da anterior) — simplificado para pause + fade-in da nova.
- Upload de faixas customizadas pelo professor.
