import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import axisData from './data/axes.v1.json';
import s from './App.module.css';
import ValueIcon from './components/ValueIcon';
import QuizFlow from './quiz/QuizFlow';
import { currentLocation, navigate } from './navigation';
import Catalogue, { catalogueRoutes } from './profiles/Catalogue';
import type { CatalogueRoute } from './profiles/Catalogue';
import { personalityImageCredits } from './profiles/personalityImageCredits';
import { parseCatalogue } from './profiles/catalogueData';
import type { Profile } from './profiles/types';
import { ideologyGroup } from './profiles/ideologyGroups';
import { personalityGroup } from './profiles/personalityGroups';

type IconName = 'arrow' | 'layers' | 'balance' | 'globe' | 'people' | 'spark' | 'lock' | 'search' | 'check' | 'close' | 'menu' | 'chevron' | 'pause' | 'play' | 'clock';
function Icon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    pause: <path d="M9 5v14M15 5v14" />,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></>,
    balance: <><path d="M12 3v17m-5 1h10M4 7h16M6 7l-4 8h8L6 7Zm12 0-4 8h8l-4-8Z" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3" /></>,
    spark: <><path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    search: <><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    chevron: <path d="m8 10 4 4 4-4" />,
  };
  return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const navigation = [
  ['values', 'Values'], ['ideologies', 'Ideologies'],
  ['personalities', 'Personalities'], ['countries', 'Countries'],
] as const;

function scrollToValues() {
  document.getElementById('values')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

function Brand() {
  return <a className={s.brand} href="#/" aria-label="15 Values home"><span className={s.brandMark} aria-hidden="true"><i /><i /><i /><i /></span><span>15<span className={s.brandLight}>Values</span></span></a>;
}

function Header({ route }: { route: string }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [route]);
  return <header className={s.header} onKeyDown={event => {
    if (event.key === 'Escape' && open) { setOpen(false); menuButton.current?.focus(); }
  }}>
    <div className={s.headerInner}>
      <Brand />
      <button ref={menuButton} className={s.menuButton} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button>
      <nav id="main-navigation" aria-label="Main navigation" className={`${s.navigation} ${open ? s.navigationOpen : ''}`}>
        <a href="#/" aria-current={route === '' ? 'page' : undefined} onClick={() => { setOpen(false); window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}>Home</a>
        {navigation.map(([path, label]) => <a key={path} href={path === 'values' ? '#/?section=values' : `#/${path}`} aria-current={route.split('/')[0] === path ? 'page' : undefined} onClick={() => { setOpen(false); if (path === 'values') scrollToValues(); }}>{label}</a>)}
        <a href="#/results" aria-current={route === 'results' ? 'page' : undefined} onClick={() => setOpen(false)}>Results</a>
        <a className={`${s.headerCta} ${s.mobileCta}`} href="#/quiz" aria-current={route === 'quiz' ? 'page' : undefined} onClick={() => setOpen(false)}>Explore the quiz <Icon name="arrow" /></a>
      </nav>
      <a className={`${s.headerCta} ${s.desktopCta}`} href="#/quiz" aria-current={route === 'quiz' ? 'page' : undefined}>Explore the quiz <Icon name="arrow" /></a>
    </div>
  </header>;
}

function Footer() {
  return <footer className={s.footer}>
    <div className={`${s.container} ${s.footerInner}`}>
      <div className={s.footerIntro}><Brand /><p>Your views deserve<br />more than a label.</p><span>A political quiz built around 15 independent axes. Designed to describe your views, not change them.</span></div>
      <nav className={s.footerColumn} aria-label="Explore"><h2>Explore</h2><a href="#/quiz">Quiz formats</a><a href="#/?section=values">The 15 values</a></nav>
      <nav className={s.footerColumn} aria-label="Catalogues"><h2>Catalogues</h2>{navigation.slice(1).map(([path, label]) => <a href={`#/${path}`} key={path}>{label}</a>)}</nav>
      <nav className={s.footerColumn} aria-label="Project"><h2>The project</h2><a href="#/about">About 15 Values</a><a href="#/about?section=privacy">Privacy &amp; your data</a><a href="#/feedback">Share feedback</a><a href="#/credits">Image credits</a></nav>
      <div className={s.footerBottom}><span>15 Values · In development</span><p>No account needed. Quiz answers and saved results stay in your browser.</p><a href="#/" onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); document.getElementById('main-content')?.focus({ preventScroll: true }); }}>Back to home <Icon name="arrow" /></a></div>
    </div>
  </footer>;
}

// Display-only placeholders, not calculated matches or assessed profiles.
function ExampleResult() {
  return <div className={s.examplePreview}>
    <p className={s.exampleCaption} id="example-result-title">Example result</p>
    <section className={s.exampleResult} aria-labelledby="example-result-title">
      <div className={s.resultHeader}>
        <div className={s.resultIdeology}><span className={s.positionBadge}>Centre-left</span><h2>Social democracy</h2></div>
        <div className={s.matchRing} role="img" aria-label="85% match, illustrative example only">
          <svg viewBox="0 0 104 104" aria-hidden="true"><circle className={s.ringTrack} cx="52" cy="52" r="47" /><circle className={s.ringFill} cx="52" cy="52" r="47" pathLength="100" /></svg>
          <div><strong>85%</strong><span>Match</span></div>
        </div>
      </div>
      <div className={s.comparisonRow}>
        <img className={s.personPortrait} src={`${import.meta.env.BASE_URL}images/andy-burnham.jpg`} alt="Andy Burnham" width="76" height="76" decoding="async" />
        <div className={s.comparisonCopy}><span className={s.comparisonLabel}>Most compatible personality</span><h3>Andy Burnham</h3><span className={s.comparisonDescription}>Politician · 1970–</span></div>
      </div>
      <div className={s.comparisonRow}>
        <img className={s.countryFlag} src={`${import.meta.env.BASE_URL}images/switzerland.svg`} alt="Flag of Switzerland" width="76" height="52" />
        <div className={s.comparisonCopy}><span className={s.comparisonLabel}>Most compatible country</span><h3>Switzerland</h3><span className={s.comparisonDescription}>Liberal direct democracy</span></div>
      </div>
    </section>
  </div>;
}

const formats = [
  { id: 'short', name: 'Short', description: 'A first look at your political values.', detail: 'A lighter introduction to all 15 axes.', bars: 1, questions: 45 },
  { id: 'medium', name: 'Medium', description: 'More room to reflect on your views.', detail: 'More questions to explore each dimension.', bars: 2, questions: 75 },
  { id: 'long', name: 'Long', description: 'A deeper exploration of your beliefs.', detail: 'A broader set of questions for each axis placement.', bars: 3, questions: 135 },
  { id: 'comprehensive', name: 'Comprehensive', description: 'The most room for context and nuance.', detail: 'The full question bank, with more room to consider each axis.', bars: 4, questions: 240 },
] as const;
function FormatSymbol({ bars }: { bars: number }) {
  return <span className={s.formatSymbol} aria-hidden="true">{[0, 1, 2, 3].map(i => <i key={i} className={i < bars ? s.filledBar : ''} />)}</span>;
}

const stripName = (profile: Profile) => profile.metadata.name.replace(/\s*\(.*\)$/, '').trim();
const stripPoliticalGroup = (profile: Profile) => profile.catalogue === 'ideology' ? ideologyGroup(profile) : personalityGroup(profile);
const stripTags = (profile: Profile) => profile.catalogue === 'ideology'
  ? ['Ideology', stripPoliticalGroup(profile).name]
  : [profile.metadata.category, stripPoliticalGroup(profile).name];

function ComparisonStrip() {
  const [paused, setPaused] = useState(false);
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}profiles/catalogue.v1.json`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
      .then(value => {
        const catalogue = parseCatalogue(value);
        const ideologies = catalogue.filter(profile => profile.catalogue === 'ideology').sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
        const personalities = catalogue.filter(profile => profile.catalogue === 'personality').sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
        const items: Profile[] = [];
        for (let index = 0; index < Math.max(ideologies.length, personalities.length); index++) {
          if (ideologies[index]) items.push(ideologies[index]);
          if (personalities[index]) items.push(personalities[index]);
        }
        if (!controller.signal.aborted) setProfiles(items);
      })
      .catch(() => { if (!controller.signal.aborted) setProfiles([]); });
    return () => controller.abort();
  }, []);
  return <section className={s.comparisonStrip} aria-label="Explore ideologies and personalities">
    <div className={s.stripWindow}>
      {profiles?.length ? <div className={s.stripTrack} data-paused={paused} style={{ animationDuration: `${profiles.length * 6}s` }}>
        {[0, 1].map(copy => <ul className={s.stripGroup} key={copy} aria-hidden={copy === 1 ? true : undefined}>
          {profiles.map(profile => <li key={`${profile.catalogue}/${profile.id}`} className={profile.catalogue === 'ideology' ? s.stripIdeology : s.stripPersonality} style={{ '--strip-group-color': stripPoliticalGroup(profile).color } as CSSProperties}>
            <a href={`#/${profile.catalogue === 'ideology' ? 'ideologies' : 'personalities'}/${profile.id}`} tabIndex={copy === 1 ? -1 : undefined} aria-label={`${stripName(profile)}, ${stripTags(profile).join(', ')}`}>
              {profile.metadata.image ? <img src={`${import.meta.env.BASE_URL}${profile.metadata.image.path}`} alt="" width="40" height="40" loading="lazy" decoding="async" /> : <Icon name={profile.catalogue === 'ideology' ? 'layers' : 'people'} />}
              <span><span className={s.stripTags}>{stripTags(profile).map(tag => <small key={tag}>{tag}</small>)}</span><span className={s.stripName}>{stripName(profile)}</span></span>
            </a>
          </li>)}
        </ul>)}
      </div> : <div className={s.stripFallback}>
        {profiles === null ? <span role="status">Loading profiles…</span> : <><a href="#/ideologies">Explore ideologies <Icon name="layers" /></a><a href="#/personalities">Explore personalities <Icon name="people" /></a></>}
      </div>}
    </div>
    {profiles?.length ? <button className={s.stripControl} onClick={() => setPaused(value => !value)} aria-label={paused ? 'Resume scrolling' : 'Pause scrolling'}><Icon name={paused ? 'play' : 'pause'} /></button> : null}
  </section>;
}

function QuizFormats() {
  const icons: IconName[] = ['spark', 'layers', 'balance', 'globe'];
  return <section className={`${s.container} ${s.quizSection}`} id="quiz-formats" aria-labelledby="formats-title">
    <div className={s.sectionHeading}><h2 id="formats-title" tabIndex={-1}>Choose your depth.</h2><p>Four ways to explore. The same 15 axes.</p><span>Choose a format and explore your political values.</span></div>
    <div className={s.formatGrid}>{formats.map((format, index) => <article className={`${s.formatCard} ${index === 1 ? s.featuredFormat : ''}`} key={format.id}>
      <div className={s.formatCardTop}><Icon name={icons[index]} /><h3>{format.name}</h3>{format.id === 'medium' ? <span className={s.formatBadge}>Recommended</span> : format.id === 'comprehensive' ? <span className={s.formatBadge}>Most depth</span> : null}</div>
      <div className={s.formatCount}><strong>{format.questions}</strong><span>questions</span></div><p>{format.description}</p>
      <div className={s.formatCoverage}><span><strong>15 axes</strong> in every format</span><span>{format.questions / 15} questions per axis</span></div>
      <div className={s.formatMeta}><span><Icon name="clock" /> Time to be confirmed</span><span>Depth <FormatSymbol bars={format.bars} /></span></div>
      <a className={s.formatButton} href={`#/quiz/run?length=${format.id}`}>Choose {format.name.toLowerCase()} quiz <Icon name="arrow" /></a>
    </article>)}</div>
    <p className={s.formatFootnote}>Every format measures each axis on its own questions.</p>
  </section>;
}

const axisTopics: Record<string, string> = {
  'democracy-autocracy': 'Representation',
  'authority-liberty': 'Power',
  'assimilation-multiculturalism': 'Cultural identity',
  'restricted-immigration-open-immigration': 'Immigration',
  'militarist-pacifist': 'Diplomacy',
  'nationalism-internationalism': 'Sovereignty',
  'public-private': 'Ownership',
  'protectionism-free-trade': 'Trade',
  'planning-free-market': 'Economic control',
  'high-redistribution-low-redistribution': 'Redistribution',
  'secular-religious': 'Religion',
  'progressive-traditionalist': 'Social change',
  'innovation-caution': 'Development',
  'central-local': 'Structure',
  'culture-nature': 'Human behaviour',
};

// Optional break points keep the agreed names readable in narrow comparison columns.
function axisDisplayLabel(value: string) {
  const breaks: Record<string, string> = {
    Democracy: 'Democ\u00adracy', Autocracy: 'Auto\u00adcracy',
    Assimilation: 'Assimi\u00adlation',
    Nationalism: 'Nation\u00adalism',
    Protectionism: 'Protec\u00adtionism', Redistribution: 'Redis\u00adtri\u00adbution',
    Traditionalist: 'Tradi\u00adtionalist', Immigration: 'Immi\u00adgration',
    Progressive: 'Progres\u00adsive',
  };
  return value.split(' ').map((word, index) => <span key={index}>{breaks[word] ?? word}</span>);
}

function LandingAxes() {
  return <section className={`${s.container} ${s.landingAxes}`} id="values" aria-labelledby="landing-axes-title">
    <h2 id="landing-axes-title">What does each axis mean?</h2>
    <div className={s.landingAxesGrid}>{axisData.axes.map((axis, index) => <article className={s.landingAxisCard} key={axis.id} aria-labelledby={`landing-${axis.id}`}>
      <div className={s.landingAxisHeading}><h3 id={`landing-${axis.id}`}>{axisTopics[axis.id]}</h3><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></div>
      <p className={`${s.landingAxisPair} ${['assimilation-multiculturalism', 'nationalism-internationalism'].includes(axis.id) ? s.landingAxisPairLong : ''}`} aria-label={axis.name}><span className={s.landingAxisValue}><span className={s.landingValueIcon}><ValueIcon value={axis.left} /></span><span>{axisDisplayLabel(axis.left)}</span></span><span className={s.landingAxisVersus} aria-hidden="true">vs</span><span className={s.landingAxisValue}><span className={s.landingValueIcon}><ValueIcon value={axis.right} /></span><span>{axisDisplayLabel(axis.right)}</span></span></p>
      <p className={s.landingAxisDescription}>{axis.description.trim()}</p>
    </article>)}</div>
  </section>;
}

function Home() {
  const scrollToFormats = () => { const section = document.getElementById('quiz-formats'); section?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); document.getElementById('formats-title')?.focus({ preventScroll: true }); };
  return <>
    <section className={`${s.container} ${s.hero}`}>
      <div className={s.heroCopy}><h1 aria-label="Your Politics Across the dimensions."><span>Your Politics</span><span>Across the dimensions.</span></h1><p>Discover where you stand on 15 separate political axes, with room for mixed and conditional views.</p></div>
      <div className={s.heroActions}><div><a className={s.primaryButton} href="#/quiz">Explore the quiz <Icon name="arrow" /></a></div><p>No account needed and 100% free</p></div>
      <ExampleResult />
      <ComparisonStrip />
      <button className={s.scrollCue} onClick={scrollToFormats}>Find your format <Icon name="chevron" /></button>
    </section>
    <QuizFormats /><LandingAxes />
  </>;
}

function PageIntro({ title, description }: { title: string; description: string }) {
  return <div className={s.pageIntro}><h1>{title}</h1><p>{description}</p></div>;
}

function About() {
  const privacy = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('section') === 'privacy';
  return <div className={`${s.container} ${s.pageContent} ${s.infoPage}`}><PageIntro title={privacy ? 'Your views. Your data.' : 'About 15 Values.'} description="A political quiz in development, designed to describe your views across 15 independent axes." />
    <section><h2>What works today</h2><p>You can take any of four quiz lengths, see your placements across all 15 axes, and revisit or export automatically saved results. The question bank still contains draft wording and has not been empirically validated. The homepage result is an illustrative example; its 85% figure and comparisons are not calculated or assessed.</p></section>
    <section><h2>Fair measurement</h2><p>The project aims to treat opposing positions equally, measure each axis on its own evidence and explain scoring decisions. Results should describe your views without praising, blaming or suggesting that you change them. A quiz is a limited summary, not a complete identity.</p></section>
    <section><h2>Privacy and local storage</h2><p>Your answers stay in memory in this open page and are cleared when you reload or leave the quiz area. Scores are calculated in your browser without accounts or a backend. Completed results are saved automatically in this browser. You can also export them as JSON. You can import and delete saved results. History does not retain individual answers. If storage is unavailable, you can still take the quiz and export your result.</p><p>Feedback drafts on this site stay in the open page unless you copy or download them. They are not sent or saved automatically.</p></section><a className={s.textLink} href="#/feedback">Help improve the project <Icon name="arrow" /></a>
  </div>;
}

function Credits() {
  return <div className={`${s.container} ${s.pageContent} ${s.infoPage}`}><PageIntro title="Image credits." description="The people and resources behind the visuals on 15 Values." />
    {personalityImageCredits.map(credit => <section key={credit.sourceUrl}><h2>{credit.name} portrait</h2><p>{credit.creator}. {credit.license}. {credit.modifications}</p><div className={s.creditLinks}><a href={credit.sourceUrl}>Wikimedia Commons source</a><a href={credit.licenseUrl}>Licence or public-domain status</a></div></section>)}
    <section><h2>Andy Burnham photograph</h2><p>“Andy Burnham on 13 August 2024 (cropped 2)” by the Scottish Government. Used under Creative Commons Attribution 2.0. The Wikimedia thumbnail is displayed smaller and cropped to a square. Its use in the example does not imply endorsement.</p><div className={s.creditLinks}><a href="https://commons.wikimedia.org/wiki/File:Andy_Burnham_on_13_August_2024_(cropped_2).jpg">Wikimedia Commons source</a><a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0 licence</a></div></section>
    <section><h2>Swiss flag</h2><p>Public-domain Swiss flag artwork by Marc Mongenet, with credits to -xfi- and Zscout370. Displayed in a rectangular crop.</p><a className={s.textLink} href="https://commons.wikimedia.org/wiki/File:Flag_of_Switzerland.svg">Wikimedia Commons source <Icon name="arrow" /></a></section>
    <section><h2>United States flag</h2><p>Public-domain flag artwork uploaded by Dbenbenn and edited by Wikimedia Commons contributors, including Zscout370, Jacobolus, Indolences, Technion, TheTaraStark and Jarekt. Saved as a 960-pixel-wide PNG thumbnail without cropping or colour changes.</p><div className={s.creditLinks}><a href="https://commons.wikimedia.org/wiki/File:Flag_of_the_United_States.svg">Wikimedia Commons source</a><a href="https://creativecommons.org/publicdomain/mark/1.0/">Public-domain status</a></div></section>
    <section><h2>New Zealand flag</h2><p>Public-domain flag design by Albert Hastings Markham, with vector artwork by Zscout370, Hugh Jass and Wikimedia Commons contributors. Saved as a 960-pixel-wide PNG thumbnail without cropping or colour changes.</p><div className={s.creditLinks}><a href="https://commons.wikimedia.org/wiki/File:Flag_of_New_Zealand.svg">Wikimedia Commons source</a><a href="https://commons.wikimedia.org/wiki/File:Flag_of_New_Zealand.svg#Licensing">Public-domain status</a></div></section>
    <section><h2>Bitcount Ink</h2><p>The question numbers use Bitcount Ink, hosted locally under the SIL Open Font License.</p><a className={s.textLink} href={`${import.meta.env.BASE_URL}fonts/Bitcount-Ink-LICENSE.txt`}>Read the Bitcount Ink licence <Icon name="arrow" /></a></section>
    <section><h2>Clarity City</h2><p>Our main typeface is hosted locally under the SIL Open Font License.</p><a className={s.textLink} href={`${import.meta.env.BASE_URL}fonts/Clarity-City-LICENSE.txt`}>Read the font licence <Icon name="arrow" /></a></section>
  </div>;
}

function Feedback() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const feedbackText = `15 Values feedback\n\n${message.trim()}`;
  const copy = async () => { try { await navigator.clipboard.writeText(feedbackText); setStatus('Copied. You can paste your feedback into a message to the project team.'); } catch { setStatus('Copy is unavailable in this browser. Download your feedback or select and copy the text.'); } };
  const download = () => { const url = URL.createObjectURL(new Blob([feedbackText], { type: 'text/plain;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = '15-values-feedback.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setStatus('Downloaded. Nothing has been sent to the project team.'); };
  return <div className={`${s.container} ${s.pageContent} ${s.infoPage}`}><PageIntro title="Help make this clearer." description="Found confusing wording, an accessibility issue or something we could explain better? Prepare your feedback here." /><p>A public contact channel has not been set up yet. You can copy or download a message to share with the project team. Nothing is sent automatically; your draft is cleared when you leave this page.</p><label className={s.feedbackLabel} htmlFor="feedback">Your feedback</label><textarea id="feedback" className={s.feedbackInput} rows={7} value={message} onChange={event => { setMessage(event.target.value); setStatus(''); }} placeholder="What happened, and what would improve it?" /><div className={s.feedbackActions}><button className={s.primaryButton} disabled={!message.trim()} onClick={copy}>Copy feedback</button><button className={s.secondaryButton} disabled={!message.trim()} onClick={download}>Download feedback</button></div><p className={s.feedbackStatus} role="status">{status}</p></div>;
}

function NotFound() {
  return <div className={`${s.container} ${s.pageContent}`}><PageIntro title="That page isn’t here." description="Head back to the home page, or use the navigation to explore the site." /><a className={s.primaryButton} href="#/">Back to home <Icon name="arrow" /></a></div>;
}

export default function App() {
  const [location, setLocation] = useState(currentLocation);
  const mainRef = useRef<HTMLElement>(null);
  const previousLocation = useRef(location);
  const route = location.split('?')[0].replace(/^\/+|\/+$/g, '');
  const quizRoute = ['quiz', 'quiz/run', 'results'].includes(route);
  useEffect(() => {
    const updateLocation = () => setLocation(currentLocation());
    const followLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#/"]') : null;
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      event.preventDefault();
      navigate(link.hash.slice(1));
    };
    window.addEventListener('hashchange', updateLocation);
    window.addEventListener('popstate', updateLocation);
    window.addEventListener('pageshow', updateLocation);
    document.addEventListener('click', followLink);
    return () => {
      window.removeEventListener('hashchange', updateLocation);
      window.removeEventListener('popstate', updateLocation);
      window.removeEventListener('pageshow', updateLocation);
      document.removeEventListener('click', followLink);
    };
  }, []);
  useEffect(() => {
    const label = navigation.find(([path]) => path === route.split('/')[0])?.[1] ?? ({ quiz: 'Choose your quiz', 'quiz/run': 'Your quiz', results: 'Your results', about: 'About 15 Values', credits: 'Image credits', feedback: 'Share feedback' }[route] ?? (route ? 'Page not found' : 'Your politics across 15 dimensions'));
    document.title = `${label} — 15 Values`;
    if (route === '' && new URLSearchParams(location.split('?')[1]).get('section') === 'values') scrollToValues();
    else window.scrollTo({ top: 0, behavior: 'instant' });
    if (previousLocation.current !== location) mainRef.current?.focus({ preventScroll: true });
    previousLocation.current = location;
  }, [location, route]);
  let page;
  if (route === '') page = <Home />;
  else if (quizRoute) page = <QuizFlow location={location} brand={<Brand />} />;
  else if (route === 'about') page = <About />;
  else if (route === 'credits') page = <Credits />;
  else if (route === 'feedback') page = <Feedback />;
  else if (Object.hasOwn(catalogueRoutes, route.split('/')[0]) && route.split('/').length <= 2) page = <Catalogue route={route.split('/')[0] as CatalogueRoute} id={route.split('/')[1]} />;
  else page = <NotFound />;
  return <><a className={s.skipLink} href="#main-content" onClick={event => { event.preventDefault(); mainRef.current?.focus(); }}>Skip to content</a>{!quizRoute || route === 'results' ? <Header route={route} /> : null}<main id="main-content" ref={mainRef} tabIndex={-1} key={quizRoute ? 'quiz-flow' : location}>{page}</main>{!quizRoute ? <Footer /> : null}</>;
}
