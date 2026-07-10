import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from './useSocket';
import type {
  GameEstadoEvent,
  GamePerguntaEvent,
  GameResultadoPerguntaEvent,
  GameFimEvent,
} from '../types/events';

export type GameScreen =
  | 'connecting'
  | 'entry'
  | 'lobby'
  | 'question'
  | 'question_result'
  | 'final_ranking';

export interface PlayerInfo {
  nickname: string;
  avatar: string;
}

export interface QuestionData {
  questionId: string;
  text: string;
  imageUrl: string | null;
  options: string[];
  timeLimitSec: number;
}

export interface QuestionResult {
  correctIndex: number;
  top5: { nickname: string; avatar: string; score: number }[];
  you: { correct: boolean; selectedIndex: number; score: number; position: number };
}

export interface FinalResult {
  top5: { nickname: string; avatar: string; score: number }[];
  you: { score: number; position: number };
}

export function useGame() {
  const [screen, setScreen] = useState<GameScreen>('connecting');
  const [playerCount, setPlayerCount] = useState(0);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [questionResult, setQuestionResult] = useState<QuestionResult | null>(null);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown timer
  const startTimer = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(seconds);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      // Connected — wait for game:estado to determine initial screen
    };

    const onDisconnect = () => {
      stopTimer();
      setScreen('connecting');
      setErrorMessage('Conexão perdida. Reconectando...');
    };

    const onGameEstado = (data: GameEstadoEvent) => {
      setPlayerCount(data.playerCount);
      setErrorMessage(null);

      if (data.status === 'lobby') {
        // If the player has already joined, show lobby; otherwise show entry
        setScreen((prev) => {
          if (prev === 'entry' || prev === 'connecting') {
            return playerInfo ? 'lobby' : 'entry';
          }
          return prev;
        });
      } else if (data.status === 'inativo') {
        setScreen('entry');
        setPlayerInfo(null);
        setQuestion(null);
        setQuestionResult(null);
        setFinalResult(null);
        stopTimer();
      }
    };

    const onGamePergunta = (data: GamePerguntaEvent) => {
      setQuestion({
        questionId: data.questionId,
        text: data.text,
        imageUrl: data.imageUrl,
        options: data.options,
        timeLimitSec: data.timeLimitSec,
      });
      setQuestionResult(null);
      setHasAnswered(false);
      setSelectedIndex(null);
      setScreen('question');
      startTimer(data.timeLimitSec);
    };

    const onGameResultadoPergunta = (data: GameResultadoPerguntaEvent) => {
      stopTimer();
      setQuestionResult({
        correctIndex: data.correctIndex,
        top5: data.top5,
        you: data.you,
      });
      setScreen('question_result');
    };

    const onGameFim = (data: GameFimEvent) => {
      stopTimer();
      setFinalResult({ top5: data.top5, you: data.you });
      setScreen('final_ranking');
    };

    const onGameErro = (data: { message: string }) => {
      setErrorMessage(data.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('game:estado', onGameEstado);
    socket.on('game:pergunta', onGamePergunta);
    socket.on('game:resultadoPergunta', onGameResultadoPergunta);
    socket.on('game:fim', onGameFim);
    socket.on('game:erro', onGameErro);

    if (!socket.connected) {
      socket.connect();
    }

    // Check initial state on connect
    socket.once('connect', () => {
      setScreen('entry');
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('game:estado', onGameEstado);
      socket.off('game:pergunta', onGamePergunta);
      socket.off('game:resultadoPergunta', onGameResultadoPergunta);
      socket.off('game:fim', onGameFim);
      socket.off('game:erro', onGameErro);
      stopTimer();
    };
  }, [playerInfo, startTimer, stopTimer]);

  const entrar = useCallback((nickname: string, avatar: string) => {
    const socket = getSocket();
    setPlayerInfo({ nickname, avatar });
    socket.emit('player:entrar', { nickname, avatar });
    setScreen('lobby');
  }, []);

  const responder = useCallback((questionId: string, idx: number) => {
    if (hasAnswered) return;
    const socket = getSocket();
    setHasAnswered(true);
    setSelectedIndex(idx);
    socket.emit('player:responder', { questionId, selectedIndex: idx });
  }, [hasAnswered]);

  return {
    screen,
    playerCount,
    playerInfo,
    question,
    questionResult,
    finalResult,
    hasAnswered,
    selectedIndex,
    timer,
    errorMessage,
    entrar,
    responder,
  };
}
