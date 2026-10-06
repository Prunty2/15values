from html.parser import HTMLParser
from pathlib import Path
import json,re
class Parse(HTMLParser):
 def __init__(self):super().__init__();self.rows=[];self.cells=[];self.text=[];self.incell=0;self.spans=[];self.span=None;self.stext=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='tr':self.cells=[]
  if t in ['td','th']:self.incell+=1;self.text=[]
  if t=='span' and a.get('class','').startswith('licensetpl_'):self.span=a['class'];self.stext=[]
 def handle_data(self,d):
  if self.incell:self.text.append(d)
  if self.span:self.stext.append(d)
 def handle_endtag(self,t):
  if t in ['td','th'] and self.incell:self.cells.append(' '.join(''.join(self.text).split()));self.incell-=1
  if t=='tr' and self.cells:self.rows.append(self.cells)
  if t=='span' and self.span:self.spans.append([self.span,''.join(self.stext).strip()]);self.span=None
D=Path('profile-audit/reports/personality-additions-second-2026-10-06');cs=json.loads((D/'portrait-candidates.json').read_text());out={}
for c in cs:
 p=Parse();p.feed((D/(c['id']+'-commons.html')).read_text());author=next((r[-1] for r in p.rows if r[0] in ['Author','Artist']),None);sp=dict(p.spans);print(c['id'],author,{k:v for k,v in sp.items() if k in ['licensetpl_short','licensetpl_link']});out[c['id']]={'author':author,'license':sp.get('licensetpl_short'),'licenseUrl':sp.get('licensetpl_link')}
(D/'image-fields.json').write_text(json.dumps(out,indent=2))
