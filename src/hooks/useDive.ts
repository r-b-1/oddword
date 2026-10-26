import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Catch, Question } from '../types/game';
import { matchAnswer } from '../utils/scoring';
import { playTone } from '../utils/sound';

const PREVIEW_SECONDS = 3;
const ANSWER_SECONDS = 20;

export type Phase = 'intro' | 'preview' | 'answering' | 'verdict' | 'complete';

interface UseDiveOptions {
  questions: Question[];
  initialCatches?: Catch[];
  onComplete: (catches: Catch[]) => void;
  onProgress?: (catches: Catch[]) => void;
}

export function useDive({ questions, initialCatches = [], onComplete, onProgress }: UseDiveOptions) {
  const sheetIds = questions.map((question) => question.id).join('|');
  const safeInitial = initialCatches.slice(0, questions.length);
  const resumed = safeInitial.length > 0;
  const alreadyDone = questions.length > 0 && safeInitial.length >= questions.length;

  const [catches, setCatches] = useState<Catch[]>(safeInitial);
  const [index, setIndex] = useState(() => (alreadyDone ? questions.length - 1 : safeInitial.length));
  const [phase, setPhase] = useState<Phase>(() => {
    if (questions.length === 0) return 'complete';
    if (alreadyDone) return 'verdict';
    if (resumed) return 'preview';
    return 'intro';
  });
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<'nothing' | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(PREVIEW_SECONDS);

  const lock = useRef(alreadyDone);
  const finished = useRef(false);
  const catchesRef = useRef(catches);
  const questionsRef = useRef(questions);
  const indexRef = useRef(index);
  const phaseRef = useRef(phase);
  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);

  useLayoutEffect(() => {
    catchesRef.current = catches;
    questionsRef.current = questions;
    indexRef.current = index;
    phaseRef.current = phase;
    onCompleteRef.current = onComplete;
    onProgressRef.current = onProgress;
  });

  useEffect(() => {
    if (phase === 'intro' || phase === 'complete') return;
    onProgressRef.current?.(catches);
  }, [catches, phase]);

  const pushCatch = useCallback((entry: Catch) => {
    if (lock.current) return;
    lock.current = true;
    setCatches((prev) => [...prev, entry]);
    setPhase('verdict');
    setFeedback(null);
    if (entry.kind === 'catch') playTone(520, 0.16);
    else playTone(180, 0.18, 'triangle');
  }, []);

  useEffect(() => {
    if (phase !== 'preview' && phase !== 'answering') return;
    const duration = phase === 'preview' ? PREVIEW_SECONDS : ANSWER_SECONDS;
    const start = performance.now();
    let fired = false;
    let warned = false;

    const id = window.setInterval(() => {
      const left = Math.max(0, duration - Math.floor((performance.now() - start) / 1000));
      setSecondsLeft(left);
      if (phase === 'answering' && left === 5 && !warned) {
        warned = true;
        playTone(880, 0.05, 'square');
      }
      if (left > 0 || fired) return;
      fired = true;
      window.clearInterval(id);
      if (phase === 'preview') {
        setPhase('answering');
        setSecondsLeft(ANSWER_SECONDS);
        setDraft('');
        setFeedback(null);
        return;
      }
      const question = questionsRef.current[indexRef.current];
      if (!question) return;
      pushCatch({
        questionId: question.id,
        prompt: question.prompt,
        category: question.category,
        submitted: null,
        matchedText: null,
        points: 0,
        depth: 0,
        tier: null,
        kind: 'timeout',
      });
    }, 200);

    return () => window.clearInterval(id);
  }, [phase, index, sheetIds, pushCatch]);

  const begin = useCallback(() => {
    if (phaseRef.current !== 'intro') return;
    setPhase('preview');
    setSecondsLeft(PREVIEW_SECONDS);
  }, []);

  const skipPreview = useCallback(() => {
    if (phaseRef.current !== 'preview') return;
    setPhase('answering');
    setSecondsLeft(ANSWER_SECONDS);
    setDraft('');
    setFeedback(null);
  }, []);

  const changeDraft = useCallback((value: string) => {
    setDraft(value);
    setFeedback(null);
  }, []);

  const submit = useCallback((raw: string) => {
    if (phaseRef.current !== 'answering' || lock.current) return;
    const text = raw.trim();
    if (!text) return;
    const question = questionsRef.current[indexRef.current];
    if (!question) return;
    const matched = matchAnswer(text, question.answers);
    if (!matched) {
      setDraft('');
      setFeedback('nothing');
      playTone(140, 0.08, 'sawtooth');
      return;
    }
    pushCatch({
      questionId: question.id,
      prompt: question.prompt,
      category: question.category,
      submitted: text,
      matchedText: matched.text,
      points: matched.points,
      depth: matched.depth,
      tier: matched.tier,
      kind: 'catch',
    });
  }, [pushCatch]);

  const skip = useCallback(() => {
    if (phaseRef.current !== 'answering' || lock.current) return;
    const question = questionsRef.current[indexRef.current];
    if (!question) return;
    pushCatch({
      questionId: question.id,
      prompt: question.prompt,
      category: question.category,
      submitted: null,
      matchedText: null,
      points: 0,
      depth: 0,
      tier: null,
      kind: 'miss',
    });
  }, [pushCatch]);

  const descend = useCallback(() => {
    if (phaseRef.current !== 'verdict') return;
    const current = catchesRef.current;
    const atEnd = indexRef.current + 1 >= questionsRef.current.length;
    if (atEnd) {
      if (finished.current) return;
      finished.current = true;
      setPhase('complete');
      onCompleteRef.current(current);
      return;
    }
    lock.current = false;
    setIndex((value) => value + 1);
    setDraft('');
    setFeedback(null);
    setSecondsLeft(PREVIEW_SECONDS);
    setPhase('preview');
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) {
        return;
      }
      const current = phaseRef.current;
      if (current === 'intro') begin();
      else if (current === 'preview') skipPreview();
      else if (current === 'verdict') descend();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [begin, skipPreview, descend]);

  const question = questions[index];
  const currentCatch = phase === 'verdict' ? catches[index] ?? catches[catches.length - 1] : null;

  return {
    phase,
    index,
    question,
    catches,
    draft,
    feedback,
    secondsLeft,
    currentCatch,
    depth: catches.reduce((sum, entry) => sum + entry.depth, 0),
    isLast: index >= questions.length - 1,
    begin,
    skipPreview,
    changeDraft,
    submit,
    skip,
    descend,
  };
}
