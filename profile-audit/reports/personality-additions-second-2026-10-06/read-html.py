from html.parser import HTMLParser
from pathlib import Path
class Text(HTMLParser):
 def __init__(self): super().__init__();self.out=[];self.skip=0
 def handle_starttag(self,t,a):
  if t in ['script','style']:self.skip+=1
  if t in ['p','h2','h3','tr','li']:self.out.append('\n')
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip:self.out.append(d)
d=Path('profile-audit/reports/personality-additions-second-2026-10-06')
for f in d.glob('*.html'):
 p=Text();p.feed(f.read_text());f.with_suffix('.txt').write_text(''.join(p.out))
