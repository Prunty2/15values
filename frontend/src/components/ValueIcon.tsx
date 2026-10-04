import type { ReactNode } from 'react';

// Each endpoint has a distinct symbol; every symbol uses the same visual weight.
const symbols: Record<string, ReactNode> = {
  Democracy: <><path d="M4 12h16v9H4zm4 0 4-4 4 4M9 3l6 3-3 6-6-3 3-6Z" /><path d="M8 16h8" /></>,
  Autocracy: <><path d="M7 21V9h10v12M5 21h14M6 9h12L12 3 6 9Zm4 4h4m-4 4h4" /></>,
  Authority: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="M8 10h8m-8 4h8" /></>,
  Liberty: <><path d="M4 21 18 5m-9 11c-5-7 2-13 12-13 0 10-5 17-12 13Zm4-5 5 1m-4-2V6" /></>,
  Assimilation: <><circle cx="12" cy="16" r="4" /><path d="M4 3v4l5 5m11-9v4l-5 5M12 2v6M2 18h5m10 0h5" /></>,
  Multiculturalism: <><circle cx="6" cy="6" r="3" /><rect x="15" y="3" width="6" height="6" rx="1" /><path d="m6 14 4 7H2l4-7Zm9 1h6v6h-6z" /></>,
  'Restricted Immigration': <><path d="M5 21V4h14v17M3 21h18M9 4v17m6-17v17M5 10h14m-14 5h14" /></>,
  'Open Immigration': <><path d="M5 21V4h14v17M3 21h4m10 0h4M9 13h12m-4-4 4 4-4 4" /></>,
  Militarist: <><path d="m4 3 13 13m-1-2 4-4M3 3l1 5 12 12m-6-4 4 4m4-18-7 7m6-2 4-2-1 5-5 5M4 16l4 4m-6 2 4-4m12 0 4 4" /></>,
  Pacifist: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18m0-9L5 18m7-6 7 6" /></>,
  Nationalism: <><path d="M5 22V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0" /></>,
  Internationalism: <><circle cx="12" cy="12" r="8" /><ellipse cx="12" cy="12" rx="3" ry="8" /><path d="M4 12h16M1 5l3 2m16 10 3 2M1 19l3-2M20 7l3-2" /></>,
  Public: <><path d="m3 8 9-5 9 5H3Zm2 3v8m5-8v8m4-8v8m5-8v8M3 21h18" /></>,
  Private: <><path d="M4 11v10h16V11M2 10l3-7h14l3 7M2 10c0 3 5 3 5 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 5 3 5 0M9 21v-6h6v6" /></>,
  Protectionism: <><path d="M3 21V8l9-5 9 5v13M7 21V11h10v10M5 21h14M10 11v4h4v-4" /></>,
  'Free Trade': <><path d="M3 6h17m-4-4 4 4-4 4M21 18H4m4-4-4 4 4 4" /><rect x="9" y="9" width="6" height="6" rx="1" /></>,
  Planning: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 2h6v4H9zM9 11h6m-6 5h6" /></>,
  'Free Market': <><circle cx="5" cy="5" r="3" /><circle cx="19" cy="7" r="3" /><circle cx="10" cy="19" r="3" /><path d="m8 5 8 1M6 8l3 8m8-6-5 6" /></>,
  'High Redistribution': <><circle cx="12" cy="5" r="3" /><path d="M12 8v4H4v5m8-5h8v5m-8-5v5" /><circle cx="4" cy="20" r="2" /><circle cx="12" cy="20" r="2" /><circle cx="20" cy="20" r="2" /></>,
  'Low Redistribution': <><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M3 8V5l13-3v6m5 5h-6v5h6" /><path d="M17 15h1" /></>,
  Secular: <><path d="m2 9 5-3 5 3H2Zm2 3v6m6-6v6M2 21h10M15 3v18" /><circle cx="20" cy="7" r="2" /><path d="M18 14h4m-2-2v7" /></>,
  Religious: <><path d="M4 21V11a8 8 0 0 1 16 0v10H4Zm5 0v-7a3 3 0 0 1 6 0v7M12 1v3m-8 0 2 2m14-2-2 2" /></>,
  Progressive: <><path d="M3 21v-5h6v-5h6V6h6M4 10l6-6m-6 0h6v6" /></>,
  Traditionalist: <><path d="M6 4h12M5 8h14M8 8v11m8-11v11M5 21h14M10 4V2h4v2" /></>,
  Innovation: <><path d="M8 15a7 7 0 1 1 8 0v3H8v-3Zm1 6h6M12 8v6m-3-3h6" /></>,
  Caution: <><path d="M6 3h12M6 21h12M7 3v4l5 5-5 5v4M17 3v4l-5 5 5 5v4M9 6h6m-6 12h6" /></>,
  Central: <><circle cx="12" cy="12" r="4" /><path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l4 4m6 6 4 4M5 19l4-4m6-6 4-4" /></>,
  Local: <><circle cx="5" cy="5" r="3" /><circle cx="19" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" /><path d="M8 5h8M5 8v8m14-8v8M8 19h8" /></>,
  Culture: <><path d="M12 6C9 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2v15M5 8l4 1m6 0 4-1M5 12l4 1m6 0 4-1" /></>,
  Nature: <><path d="M7 2c0 10 10 10 10 20M17 2c0 10-10 10-10 20M8 5h8M9 9h6m-6 6h6m-7 4h8" /></>,
};

export default function ValueIcon({ value, className }: { value: string; className?: string }) {
  return <svg data-value-icon={value} className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{symbols[value]}</svg>;
}
