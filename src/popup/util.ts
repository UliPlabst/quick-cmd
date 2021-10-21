export function getMatchScore(text: string, match: string)
{
  text = text.toLowerCase();
  let matches = match.toLowerCase()
    .split(/\s/g)
    .filter(s => !String.isNullOrEmpty(s));
  
  let matchCnt = 0;
  let matchingChars = 0;
  for(let regex of matches.map(e => new RegExp(e, "g")))
  {
    for(let e of text.matchAll(regex))
    {
      matchCnt++;
      matchingChars += e[0].length
    }
  }
  return matchCnt * 100 - (text.length - matchingChars);
}

export function createSvgElement(tag: string, attrs: Record<string, any>): Element
{
  let e = document.createElementNS("http://www.w3.org/2000/svg", tag);  
  for(let key of Object.keys(attrs))
  {
    let v = attrs[key];
    setAttribute(e, key, v);
  }
  return e;
}

export function setAttribute(el: Element, key: string, value: any)
{
  el.setAttribute(key, value.toString());
}

export function debounced<T extends any[]>(timeout: number, fn: (...args: T) => any): (...args: T) => void
{
  let timer = null;
  return (...args) => {
    if(timer != null)
    {
      clearTimeout(timer);
      timer = null;
    }
    
    timer = setTimeout(() => {
      fn(...args);
    }, timeout)
  }
}

export function normalize(title: string)
{
  return title?.toLowerCase() ?? "";
}

export function makeEllipsis(str: string, maxLength: number)
{
  if(str.length > maxLength)
    return str.substr(0, maxLength) + "..."
  return str;
}