import { useEffect, useRef, useState } from 'react';
import type { Profile } from '../profiles/types';
import { type QuizResult } from './model';
import a from '../App.module.css';
import s from './ResultComparison.module.css';

export default function ResultComparison({ result, profiles, error, onRetry, onSelect }: { result: QuizResult; profiles?: Profile[]; error?: string; onRetry: () => void; onSelect: (profile: Profile) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const candidates = (profiles ?? []).filter(profile =>
    ['ideology', 'personality'].includes(profile.catalogue) && !profile.withdrawal &&
    profile.axesVersion === result.axesVersion && profile.questionBankVersion === result.questionBankVersion && profile.scoringVersion === result.scoringVersion)
    .sort((left, right) => left.metadata.name.localeCompare(right.metadata.name) || left.id.localeCompare(right.id));
  const suggestions = candidates.filter(profile => profile.metadata.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  useEffect(() => { list.current?.children[active]?.scrollIntoView({ block: 'nearest' }); }, [active]);
  function choose(profile: Profile) {
    onSelect(profile);
    dialog.current?.close();
  }
  function open() {
    setQuery(''); setActive(-1);
    dialog.current?.showModal();
    input.current?.focus();
  }
  return <div className={s.picker}>
    <button ref={trigger} className={a.primaryButton} onClick={open}>Compare</button>
    <dialog ref={dialog} className={s.dialog} aria-labelledby="compare-title" onClose={() => trigger.current?.focus({ preventScroll: true })} onClick={event => { if (event.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current.close(); } }}>
      <div className={s.dialogHeading}><h2 id="compare-title">Compare with a profile</h2><button className={s.close} aria-label="Close comparison search" onClick={() => dialog.current?.close()}>×</button></div>
      <label className={s.searchLabel} htmlFor="compare-search">Search ideologies and personalities</label>
      <input ref={input} id="compare-search" type="search" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="compare-suggestions" aria-activedescendant={active >= 0 && suggestions[active] ? `compare-option-${active}` : undefined} placeholder="Type a name…" value={query} onChange={event => { setQuery(event.target.value); setActive(-1); }} onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          setActive(index => suggestions.length ? (event.key === 'ArrowDown' ? Math.min(index + 1, suggestions.length - 1) : index <= 0 ? suggestions.length - 1 : index - 1) : -1);
        } else if (event.key === 'Enter' && suggestions.length) {
          event.preventDefault(); choose(suggestions[active >= 0 ? active : 0]);
        }
      }} />
      {error ? <div role="alert"><p>{error}</p><button className={a.primaryButton} onClick={onRetry}>Retry profile search</button></div> : !profiles ? <p role="status">Loading profiles…</p> : null}
      <ul ref={list} id="compare-suggestions" role="listbox" aria-label="Suggested profiles" className={s.suggestions}>
        {suggestions.map((profile, index) => <li key={`${profile.catalogue}/${profile.id}`} id={`compare-option-${index}`} role="option" aria-selected={active === index} onMouseDown={event => event.preventDefault()} onClick={() => choose(profile)}><span>{profile.metadata.name}</span><small>{profile.catalogue === 'ideology' ? 'Ideology' : 'Personality'}</small></li>)}
      </ul>
      {profiles && !error && !suggestions.length ? <p role="status">{candidates.length ? 'No matching profiles. Try another name.' : 'No compatible ideology or personality assessments are available for this result’s scoring versions.'}</p> : null}
      <p className={s.hint}>Use ↑ and ↓ to browse suggestions, Enter to compare, or Escape to close.</p>
    </dialog>
  </div>;
}
