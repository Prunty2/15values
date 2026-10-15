import { renderToString } from 'react-dom/server';
import App from './App';
import { parseCatalogue } from './profiles/catalogueData';
export { metadata, siteUrl } from './seo';
export function render(location: string, catalogue: unknown) {
  return renderToString(<App initialLocation={location} initialProfiles={parseCatalogue(catalogue)} />);
}
