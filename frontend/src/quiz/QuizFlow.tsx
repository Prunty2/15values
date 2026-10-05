import { navigate } from '../navigation';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { answerOptions, axes, AXES_VERSION, formats, getFormat, isQuizLength, QUESTION_BANK_VERSION, SCORING_VERSION, scoreAnswers, selectQuestions, topics } from './model';
import type { Answer, Answers, QuizLength, QuizResult } from './model';
import { clearHistory, downloadResults, mergeHistory, parseHistory, readHistory, writeHistory } from './history';
import type { HistoryState } from './history';
import { ProfileOverview, ResultAxes } from './ResultProfile';
import { EmptyHistory, ResultHistory } from './ResultHistory';
import a from '../App.module.css';
import s from './QuizFlow.module.css';

type Session = { length: QuizLength; index: number; answers: Answers };
function Arrow({ back = false }: { back?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" style={back ? { transform: 'rotate(180deg)' } : undefined}><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
}
function ConfirmDialog({ title, description, action, onConfirm, onCancel }: { title: string; description: string; action: string; onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className={s.dialog} aria-labelledby="confirm-title" aria-describedby="confirm-description" onCancel={onCancel}>
    <h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p>
    <div><button className={s.secondary} autoFocus onClick={onCancel}>Keep going</button><button className={s.primary} onClick={onConfirm}>{action}</button></div>
  </dialog>;
}
function FormatSelection({ selected, session, onStart, onContinue }: { selected: string | null; session: Session | null; onStart: (length: QuizLength) => void; onContinue: () => void }) {
  return <div className={`${a.formatPage} ${s.formatPage}`}>
    <div className={`${a.formatIntro} ${s.formatIntro}`}><span className={s.eyebrow}>15 values · Your perspective</span><h1>Do you want speed or <span>more depth?</span></h1><p>Every format explores all 15 axes. Longer quizzes give each part of your views more room to be heard.</p></div>
    {session ? <div className={s.resume}><p>Your {getFormat(session.length).name.toLowerCase()} quiz is still open. <strong>{Object.keys(session.answers).length} of {getFormat(session.length).questions} answered.</strong></p><button className={s.secondary} onClick={onContinue}>Continue quiz <Arrow /></button></div> : null}
    <div className={a.choiceGrid}>{formats.map((format, index) => <article className={`${a.choiceCard} ${format.id === 'medium' ? a.choiceRecommended : ''} ${selected === format.id ? s.formatSelected : ''}`} key={format.id}>
      <div className={a.choiceTop}><h2>{format.name}</h2>{format.id === 'medium' ? <span>Recommended</span> : null}</div>
      <div className={a.choiceCount}><strong>{format.questions}</strong><span>questions</span></div><p>{format.description}</p>
      <div className={a.choiceMeta}><span>{format.perAxis} per axis</span><span>Depth <span className={a.choiceDepth} aria-label={`${index + 1} of 4`}>{[1, 2, 3, 4].map(bar => <i key={bar} data-filled={bar <= index + 1} />)}</span></span></div>
      <button className={a.choiceButton} onClick={() => onStart(format.id)}>Start {format.name.toLowerCase()} quiz <Arrow /></button>
    </article>)}</div>
    <div className={s.beforeStart}><p>Answers stay in this open tab. Completed results save automatically in this browser. Individual answers are not saved.</p></div>
    <div className={s.formatFooter}><a href="#/results">Saved results <Arrow /></a></div>
  </div>;
}
function Questions({ session, setSession, onComplete }: { session: Session; setSession: (session: Session) => void; onComplete: (answers: Answers) => void }) {
  const selected = selectQuestions(session.length);
  const question = selected[session.index];
  const answer = session.answers[question.id];
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [pending, setPending] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const pendingRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const answered = Object.keys(session.answers).length;
  const last = session.index === selected.length - 1;
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [question.id]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const moveTo = (next: Session) => {
    pendingRef.current = true;
    setPending(true);
    setDirection(next.index < session.index ? 'back' : 'forward');
    setLeaving(true);
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 140;
    timer.current = setTimeout(() => {
      setSession(next);
      setLeaving(false);
      pendingRef.current = false;
      setPending(false);
    }, duration);
  };
  const choose = (value: Answer, advance: boolean) => {
    if (pendingRef.current) return;
    const answers = { ...session.answers, [question.id]: value };
    setSession({ ...session, answers });
    // Final submission stays explicit even when advance-on-answer is enabled.
    if (autoAdvance && advance && !last) {
      pendingRef.current = true;
      setPending(true);
      timer.current = setTimeout(() => {
        moveTo({ ...session, answers, index: session.index + 1 });
      }, 280);
    }
  };
  const percentage = answered === selected.length ? 100 : Math.min(99, Math.round(answered / selected.length * 100));
  return <div className={s.quizPage}>
    <div className={s.progressInfo}><p>Question <strong>{session.index + 1}</strong><span> / {selected.length}</span></p><span>{percentage}% complete</span></div>
    <div className={s.progressTrack} role="progressbar" aria-label="Quiz completion" aria-valuemin={0} aria-valuemax={selected.length} aria-valuenow={answered} aria-valuetext={`${answered} of ${selected.length} questions answered`}><span style={{ width: `${answered / selected.length * 100}%` }} /></div>
    <section key={question.id} className={s.questionCard} data-direction={direction} data-leaving={leaving} aria-labelledby="question-title">
      <div className={s.questionIntro}>
        <div className={s.questionCopy}><span className={s.topic}><span aria-hidden="true" />{topics[question.axisId]}</span><h1 ref={heading} id="question-title" tabIndex={-1}>{question.text}</h1></div>
        <span className={s.questionNumber} aria-hidden="true">{String(session.index + 1).padStart(2, '0')}</span>
      </div>
      <fieldset className={s.answers} disabled={pending} aria-labelledby="question-title"><legend className={s.srOnly}>How much do you agree?</legend>
        {answerOptions.map(option => <label key={option.value} className={`${s.answer} ${answer === option.value ? s.selectedAnswer : ''}`}>
          <input type="radio" name={question.id} value={option.value} checked={answer === option.value}
            onChange={() => choose(option.value, false)} onClick={() => choose(option.value, true)}
            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(option.value, true); } }} />
          <span className={s.answerSymbol} data-agreement={option.value > 0 ? 'agree' : option.value < 0 ? 'disagree' : 'neutral'} aria-hidden="true"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={option.value > 0 ? 'm5 10 3 3 7-7' : option.value < 0 ? 'm6 6 8 8M14 6l-8 8' : 'M5 10h10'} /></svg></span><span>{option.label}</span><span className={s.answerRadio} aria-hidden="true">{answer === option.value ? <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 10 4 4 8-8" /></svg> : null}</span>
        </label>)}
      </fieldset>
    </section>
    <div className={s.questionControls}>
      <button className={s.secondary} disabled={session.index === 0 || pending} onClick={() => moveTo({ ...session, index: session.index - 1 })}><Arrow back /> Back</button>
      <label className={s.autoAdvance}><input type="checkbox" checked={autoAdvance} disabled={pending} onChange={event => setAutoAdvance(event.target.checked)} /><span className={s.switch} aria-hidden="true"><span /></span><span>Advance on answer</span></label>
      <button className={s.primary} disabled={answer === undefined || pending} onClick={() => last ? onComplete(session.answers) : moveTo({ ...session, index: session.index + 1 })}>{last ? 'See my results' : 'Next'}<Arrow /></button>
    </div>
    <div className={s.quizFootnote}><span>{getFormat(session.length).name} quiz · All 15 axes</span><span>You can change your answers before finishing.</span></div>
  </div>;
}
function Results({ currentResult, resultId, saveError, onView, canReview, onReview }: { currentResult: QuizResult | null; resultId: string | null; saveError: string; onView: (result: QuizResult | null) => void; canReview: boolean; onReview: () => void }) {
  const [history, setHistory] = useState<HistoryState>(readHistory);
  const [message, setMessage] = useState(saveError);
  const [confirmClear, setConfirmClear] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const result = resultId ? history.results.find(item => item.id === resultId) ?? (currentResult?.id === resultId ? currentResult : null) : null;
  const saved = result !== null && history.results.some(item => item.id === result.id);
  useEffect(() => { resultHeading.current?.focus({ preventScroll: true }); }, [result?.id]);
  useEffect(() => {
    const refresh = () => setHistory(readHistory());
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);
  const save = () => {
    if (!result) return;
    const current = readHistory();
    if (current.error) { setHistory(current); return; }
    try {
      const next = mergeHistory(current.results, [result]);
      const error = writeHistory(next);
      setHistory(error ? current : { results: next, error: null });
      setMessage(error ?? 'Result saved in this browser. Your individual answers were not saved.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'This result could not be saved.'); }
  };
  const remove = (id: string) => {
    const current = readHistory();
    if (current.error) { setHistory(current); return; }
    const next = current.results.filter(item => item.id !== id);
    const error = writeHistory(next);
    setHistory(error ? current : { results: next, error: null });
    setMessage(error ?? 'Saved result deleted.');
  };
  const importFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error('Choose a history file smaller than 1 MB.');
      const incoming = parseHistory(await file.text());
      const current = readHistory();
      if (current.error) { setHistory(current); return; }
      const combined = mergeHistory(current.results, incoming);
      const error = writeHistory(combined);
      if (error) throw new Error(error);
      setHistory({ results: combined, error: null });
      setMessage(`Imported ${combined.length - current.results.length} new ${combined.length - current.results.length === 1 ? 'result' : 'results'}.`);
    } catch (error) {
      setMessage(error instanceof SyntaxError ? 'This file is not valid JSON. No saved results have been changed.' : error instanceof Error ? error.message : 'The file could not be imported.');
    } finally { if (importInput.current) importInput.current.value = ''; }
  };
  return <div className={s.resultsPage}>
    <div className={s.resultsIntro}><div><h1 ref={resultHeading} tabIndex={-1}>{result ? 'Your perspective profile.' : 'Saved results.'}</h1><p>{result ? `Analysis based on your responses to ${getFormat(result.length).questions} questions based on 15 dimensions of political ideology.` : 'Your political perspectives, ready to revisit.'}</p></div>{!result && history.results.length ? <a className={s.secondary} href="#/quiz">Take a new quiz <Arrow /></a> : null}</div>
    {result ? <>
      <button className={s.backToHistory} onClick={() => onView(null)}><Arrow back /> All saved results</button>
      <ProfileOverview />
      <div className={s.resultToolbar}><div className={s.resultMeta}><span>{getFormat(result.length).name} quiz</span><span>{getFormat(result.length).questions} questions</span><time dateTime={result.completedAt}>{new Date(result.completedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</time></div><div className={s.resultActions}><button className={s.primary} disabled={saved || Boolean(history.error)} onClick={save}>{saved ? 'Saved in this browser' : 'Save in this browser'}</button><button className={s.secondary} onClick={() => downloadResults([result], '15-values-result.json')}>Export result</button>{canReview ? <button className={s.textButton} onClick={onReview}>Review answers</button> : null}<a className={s.textButton} href="#/quiz">Take a new quiz <Arrow /></a></div></div>
      <div className={s.readingNote}><span aria-hidden="true">↔</span><p>Percentages show your position between two poles. A 50/50 score can come from neutral answers or a mix of opposing views. It is not a confidence rating.</p></div>
    </> : null}
    <p className={s.status} role="status">{message}</p>{history.error ? <p className={s.storageError} role="alert">{history.error}</p> : null}
    {result ? <><ResultAxes result={result} /><details className={s.method}><summary>How these scores are calculated <span aria-hidden="true">+</span></summary><p>{result.scoringVersion === '1.0.0' ? 'This saved result uses the original scoring method: every question has equal weight. Shorter formats can tilt towards the pole with more agreement statements. Its original scores have been preserved.' : 'Questions supporting agreement with each pole form two groups. We average responses within each group, reverse the direction of the opposing group, then give each group half the score. This prevents the extra statement in an odd-length set from creating a tilt through blanket agreement. Questions have equal weight within their group; each question in the smaller group has more influence.'} Strongly agree, agree, neutral, disagree and strongly disagree correspond to 100, 75, 50, 25 and 0 toward the pole supported by the statement. Each answer affects only its own axis.</p><p>The two displayed percentages add to 100. The chart rounds to whole percentages; open an axis’s question mark for the stored scores and response counts. Balanced means within 10 points of the midpoint, Leaning means more than 10 but less than 25 points, and Strong means at least 25 points. These describe distance, not confidence. Neutral is a midpoint response, not a skipped question. Short results still have limited resolution because each axis uses just three responses. More questions give broader coverage, but do not guarantee accuracy. This development question bank still includes draft wording and has not been empirically validated. A score describes responses to these statements, not a diagnosis or a probability.</p><p>Question bank {result.questionBankVersion} · Scoring {result.scoringVersion} · Axes {result.axesVersion}</p></details></> : null}
    <section className={s.history} aria-labelledby="history-title">
      <div className={s.historyHeading}><h2 id="history-title">Saved in this browser</h2><span className={s.historyCount}>{history.results.length} {history.results.length === 1 ? 'result' : 'results'}</span></div>
      {resultId && !result ? <p className={s.storageError} role="alert">This result is no longer saved in this browser.</p> : null}
      {history.results.length ? <ResultHistory results={history.results} activeId={result?.id} onView={item => { onView(item); window.scrollTo({ top: 0, behavior: 'instant' }); }} onDelete={remove} /> : <EmptyHistory unavailable={Boolean(history.error)} />}
      <details className={s.historyManagement}><summary>Manage history</summary><div className={s.historyActions}>
        <button className={s.secondary} onClick={() => importInput.current?.click()}>Import JSON</button><input ref={importInput} className={s.srOnly} tabIndex={-1} type="file" accept=".json,application/json" aria-label="Import result history" onChange={event => { void importFile(event.target.files?.[0]); }} />
        <button className={s.secondary} disabled={!history.results.length} onClick={() => downloadResults(history.results, '15-values-history.json')}>Export history</button>
        {history.results.length || history.error ? <button className={s.clearHistory} onClick={() => setConfirmClear(true)}>Clear saved history</button> : null}
      </div></details>
    </section>
    {confirmClear ? <ConfirmDialog title="Clear saved history?" description="This removes all 15 Values results stored in this browser. Export your history first if you want to keep a copy." action="Clear history" onCancel={() => setConfirmClear(false)} onConfirm={() => { const error = clearHistory(); setHistory(error ? { ...history, error } : { results: [], error: null }); setMessage(error ?? 'Saved history cleared.'); setConfirmClear(false); }} /> : null}
  </div>;
}
export default function QuizFlow({ location, brand }: { location: string; brand: ReactNode }) {
  const [activeSession, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [completedResultId, setCompletedResultId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [confirmation, setConfirmation] = useState<{ title: string; description: string; action: string; run: () => void } | null>(null);
  const route = location.split('?')[0];
  const showingResults = route === '/results';
  const requested = new URLSearchParams(location.split('?')[1]).get('length');
  const running = route === '/quiz/run' && isQuizLength(requested);
  // A valid link is enough to start. Reloads discard answers, not access to the quiz.
  const session: Session | null = running
    ? activeSession?.length === requested ? activeSession : { length: requested, index: 0, answers: {} }
    : activeSession;
  const inProgress = running && Boolean(session && Object.keys(session.answers).length > 0);
  useEffect(() => {
    if (!inProgress) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [inProgress]);
  const begin = (length: QuizLength) => {
    const run = () => { setSession({ length, index: 0, answers: {} }); setResult(null); setCompletedResultId(null); navigate(`/quiz/run?length=${length}`); };
    if (session && Object.keys(session.answers).length) setConfirmation({ title: 'Start a new quiz?', description: 'This replaces the answers in your open quiz. Results you have saved in this browser will remain available.', action: 'Start new quiz', run });
    else run();
  };
  const leave = (target: string) => {
    const run = () => { navigate(target); };
    if (inProgress && target === '/') setConfirmation({ title: 'Leave this quiz?', description: 'Your unfinished answers will be lost. They have not been saved in this browser.', action: 'Leave quiz', run });
    else run();
  };
  const complete = (answers: Answers) => {
    if (!session) return;
    const id = crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
    const next: QuizResult = { id, completedAt: new Date().toISOString(), length: session.length, questionBankVersion: QUESTION_BANK_VERSION, scoringVersion: SCORING_VERSION, axesVersion: AXES_VERSION, scores: scoreAnswers(session.length, answers) };
    const current = readHistory();
    let error = current.error;
    if (!error) {
      try { error = writeHistory(mergeHistory(current.results, [next])); }
      catch (failure) { error = failure instanceof Error ? failure.message : 'This result could not be saved.'; }
    }
    setSaveError(error ?? '');
    setResult(next); setCompletedResultId(next.id); navigate(`/results?id=${next.id}`);
  };
  return <>
    {!showingResults ? <header className={`${a.choiceHeader} ${s.flowHeader} ${running ? s.runningHeader : ''}`}><div><span onClick={event => { if (inProgress) { event.preventDefault(); leave('/'); } }}>{brand}</span><div className={s.headerActions}>{running && session ? <><span className={s.headerFormat}>{getFormat(session.length).name} quiz</span><button className={s.textButton} onClick={() => setConfirmation({ title: 'Restart this quiz?', description: 'This clears your current answers and returns to the first question.', action: 'Restart quiz', run: () => { setSession({ ...session, index: 0, answers: {} }); setCompletedResultId(null); } })}>Restart quiz <Arrow /></button></> : <a className={s.textButton} href="#/">Back to home <Arrow /></a>}</div></div></header> : null}
    {showingResults ? <Results currentResult={result} resultId={new URLSearchParams(location.split('?')[1]).get('id')} saveError={saveError} onView={item => { setResult(item); navigate(item ? `/results?id=${item.id}` : '/results'); }} canReview={Boolean(session && completedResultId && new URLSearchParams(location.split('?')[1]).get('id') === completedResultId)} onReview={() => { if (session) { setSession({ ...session, index: getFormat(session.length).questions - 1 }); navigate(`/quiz/run?length=${session.length}`); } }} /> : running && session ? <Questions key={session.length} session={session} setSession={setSession} onComplete={complete} /> : <FormatSelection selected={requested} session={session} onStart={begin} onContinue={() => { if (session) navigate(`/quiz/run?length=${session.length}`); }} />}
    {confirmation ? <ConfirmDialog title={confirmation.title} description={confirmation.description} action={confirmation.action} onCancel={() => setConfirmation(null)} onConfirm={() => { confirmation.run(); setConfirmation(null); }} /> : null}
  </>;
}
