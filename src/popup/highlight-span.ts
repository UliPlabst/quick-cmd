import { constants } from "../lib/constants";

export interface IHighlightRange
{
  start: number;
  end: number;
}

export function getHighlightRanges(text: string, match: string): IHighlightRange[]
{
  text = text.toLowerCase();
  let matches = match.toLowerCase()
    .split(/\s/g)
    .filter(s => !String.isNullOrEmpty(s));
  
  let ranges: IHighlightRange[] = [];
  for(let regex of matches.map(e => new RegExp(e, "ig")))
  {
    for(let e of text.matchAll(regex))
    {
      let start = e.index;
      let end = e.index + e[0].length;
      let range = ranges.find(r => !(r.end < start || r.start > end));
      if(range)
      {
        range.start = Math.min(start, range.start);
        range.end = Math.max(end, range.end);
      }
      else
      {
        ranges.push({
          start,
          end
        });
      }
    }
  }
  return ranges.orderBy(r => r.start);
}


export class HighlightSpan
{
  normalizedText: string;
  isEllipsis = false;
  constructor(
    public text: string
  )
  {
    this.normalizedText = this.text.toLowerCase();
  }
  
  render(m: string)
  {
    let c = document.createElement("span");
    c.classList.add("highlight-span");
    if(String.isNullOrEmpty(m))
    {
      let s = document.createElement("span");
      s.innerHTML = this.text;
      c.appendChild(s);
      return c;
    }
    
    let ranges = getHighlightRanges(this.normalizedText, m);
    
    if(ranges.length != 0)
    {
      let idx = 0;
      let rIdx = 0;
      let r = ranges[rIdx];
      while(rIdx < ranges.length)
      {
        r = ranges[rIdx];
        
        if(idx < r.start)
        {
          let s = document.createElement("span");
          s.innerHTML = this.text.substring(idx, r.start);
          c.appendChild(s);
        }
        let h = document.createElement("span");
        h.classList.add("highlight");
        h.innerHTML = this.text.substring(r.start, r.end);
        c.appendChild(h);
        
        idx = r.end;
        rIdx++;
      }
      
      if(r && r.end != this.text.length)
      {
        let h = document.createElement("span");
        h.innerHTML = this.text.substring(r.end);
        c.appendChild(h);
      }
    }
    else
    {
      let h = document.createElement("span");
      h.innerHTML = this.text;
      c.appendChild(h);
    }
    return c;
  }
}