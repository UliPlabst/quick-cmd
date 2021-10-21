import { constants } from "../lib/constants";
import { options } from "../lib/options";
import { createFaviconImage, getDomain, getFaviconImage, getObject } from "../lib/tool";
import { ICommand } from "./commands";
import { HighlightSpan } from "./highlight-span";
import { getMatchScore, makeEllipsis, normalize } from "./util";

const iconWidth = constants.iconWidth;

export abstract class Result<T = any>
{
  classes: string[] = [];
  title: string;
  highlight: HighlightSpan;
  score: number;
  element: HTMLDivElement;
  
  private _selected = false;
  get selected(): boolean
  {
    return this._selected;
  }
  set selected(value)
  {
    this._selected = value;
    if(this.element)
    {
      if(value == true)
        this.element.classList.add("selected");
      else
        this.element.classList.remove("selected");
    }
  }
  get isEllipsis()
  {
    return this.title.length > constants.maxChars
  }

  constructor(
    public entity: T
  )
  {
    this.init();
    this.highlight = new HighlightSpan(this.title);
  }
  
  public updateScore(q: string): number
  {
    this.score = this._getScore(q);
    return this.score;
  }
  
  protected abstract _getScore(q: string): number;
  protected abstract _getIcon(): HTMLElement;
  protected _getRightElement(str: string): HTMLElement
  {
    return null;
  }
  protected _getMainElements(str: string): HTMLElement[]
  {
    return [this.highlight.render(str)];
  }
  
  protected _getDetailElements(str: string): HTMLElement[]
  {
    return null;
  }
  
  init()
  {
  }
  
  onClick(): void|Promise<void>
  {
    window.close();
  }
  
  render(str: string): HTMLElement
  {
    this.element = document.createElement("div");
    this.element.classList.add("result");
    this.classes.forEach(c => this.element.classList.add(c));
    if(this.selected)
      this.element.classList.add("selected");
      
    let top = document.createElement("div");
    top.classList.add("top")
    let bottom = document.createElement("div");
    bottom.classList.add("bottom");
    this.element.append(top, bottom);
    
    let left = document.createElement("div");
    left.classList.add("left");
    let right = document.createElement("div");
    right.classList.add("right");
    top.append(left, right);
      
    let icon = this._getIcon()
    icon.classList.add("icon");
    left.append(icon, ...this._getMainElements(str));
    
    let rightEl = this._getRightElement(str);
    if(rightEl)
    {
      rightEl.classList.add("detail");
      right.append(rightEl);
    }
    this.element.addEventListener("click", () => this.onClick());
    
    if(options.singleLine !== true)
    {
      let els = this._getDetailElements(str);
      if(els && els.length > 0)
        bottom.append(...els);
    }
    
    return this.element;
  }
}

export class HistoryResult extends Result<browser.history.HistoryItem>
{
  normalizedTitle: string;
  titleContent: string;
  _right: HighlightSpan;
  init()
  {
    super.init();
    this.classes = [
      "history-result"
    ];
    this.title           = this.entity.title;
    this.normalizedTitle = normalize(this.title)
    this.titleContent    = makeEllipsis(this.title, constants.maxChars);
    
    if(!String.isNullOrEmpty(this.entity.url))
      this._right = new HighlightSpan(this.entity.url);
  }
  
  protected _getScore(q: string): number
  {
    if(String.isNullOrEmpty(this.entity.title))
      return 0;
    
    return getMatchScore(this.entity.title, q);
  }
  
  protected _getIcon()
  {
    let i = document.createElement("span");
    i.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-history" width="${iconWidth}" height="${iconWidth}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <polyline points="12 8 12 12 14 14"></polyline>
    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
 </svg>`.trim();
    return i;
  }
  
  protected _getDetailElements(str: string)
  {
    let res = [];
    if(this.entity.lastVisitTime)
    {
      let s = document.createElement("span");
      s.innerHTML = `visited: ${new Date(this.entity.lastVisitTime).toLocaleString()}`
      res.push(s);
    }
    return res;
  }
  
  protected _getMainElements(str: string)
  {
    let r = super._getMainElements(str);
    let i = getFaviconImage(this.entity);
    if(i)
      r.unshift(i);
    return r;
  }
  
  protected _getRightElement(str: string): HTMLElement
  {
    return this._right?.render(str);
  }
  
  async onClick()
  {
    await browser.tabs.create({
      active: true,
      url: this.entity.url
    });
    super.onClick();
  }
}

export class BookmarkResult extends Result<browser.bookmarks.BookmarkTreeNodeExt>
{
  normalizedTitle: string;
  titleContent: string;
  _right: HighlightSpan;
  init()
  {
    super.init();
    this.classes = [
      "bookmark-result"
    ];
    this.title = this.entity.title;
    this.normalizedTitle = normalize(this.title);
    this.titleContent = makeEllipsis(this.title, constants.maxChars);
    if(!String.isNullOrEmpty(this.entity.url))
      this._right = new HighlightSpan(this.entity.url);
  }
  
  protected _getScore(q: string): number
  {
    if(String.isNullOrEmpty(this.entity.title))
      return 0;
      
    return getMatchScore(this.entity.title, q) * 2;
  }
  
  protected _getIcon()
  {
    let i = document.createElement("span");
    i.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bookmark" width="${iconWidth}" height="${iconWidth}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M9 4h6a2 2 0 0 1 2 2v14l-5 -3l-5 3v-14a2 2 0 0 1 2 -2"></path>
</svg>`.trim();
    return i;
  }
  
  protected _getMainElements(str: string)
  {
    let r = super._getMainElements(str);
    let i = getFaviconImage(this.entity);
    if(i)
      r.unshift(i);
    return r;
  }
  
  protected _getRightElement(str: string): HTMLElement
  {
    return this._right?.render(str);
  }
  
  protected _getDetailElements(str: string): HTMLElement[]
  {
    let span = document.createElement("span");
    span.innerHTML = this.entity.path.filter(e => !String.isNullOrEmpty(e)).join(" / ");
    return [span];
  }
  
  async onClick()
  {
    await browser.tabs.create({
      active: true,
      url: this.entity.url
    });
    super.onClick();
  }
}

export class TabResult extends Result<browser.tabs.Tab>
{
  normalizedTitle: string;
  titleContent: string;
  _right: HighlightSpan
  init()
  {
    super.init();
    this.classes = [
      "tab-result"
    ];
    
    this.title           = this.entity.title;
    let domain           = getDomain(this.entity.url);
    this.normalizedTitle = normalize(this.title);
    this.titleContent    = makeEllipsis(this.title, constants.maxChars);
    
    if(!String.isNullOrEmpty(this.entity.favIconUrl))
      browser.storage.local.set(getObject(`favicon/${domain}`, this.entity.favIconUrl));
      
    if(!String.isNullOrEmpty(this.entity.url))
      this._right = new HighlightSpan(this.entity.url);
      
  }
  
  _getScore(q: string): number
  {
    if(String.isNullOrEmpty(this.entity.title))
      return 0;
    
    return getMatchScore(this.entity.title, q) * 3;
  }
  
  protected _getIcon()
  {
    let i = document.createElement("span");
    i.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-windows" width="${iconWidth}" height="${iconWidth}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M17.8 20l-12 -1.5c-1 -.1 -1.8 -.9 -1.8 -1.9v-9.2c0 -1 .8 -1.8 1.8 -1.9l12 -1.5c1.2 -.1 2.2 .8 2.2 1.9v12.1c0 1.2 -1.1 2.1 -2.2 1.9z"></path>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="4" y1="12" x2="20" y2="12"></line>
 </svg>`.trim();
    return i;
  }
  
  protected _getMainElements(str: string)
  {
    let r = super._getMainElements(str);
    let i = createFaviconImage();
    if(!String.isNullOrEmpty(this.entity.favIconUrl))
      i.src = this.entity.favIconUrl;
    else 
      i.style.visibility = "hidden";
      
    if(i)
      r.unshift(i);
    return r;
  }
  
  protected _getRightElement(str: string): HTMLElement
  {
    return this._right?.render(str) as HTMLElement;
  }
  
  async onClick()
  {
    await browser.tabs.update(this.entity.id, {
      active: true
    });
    await browser.windows.update(this.entity.windowId, {
      focused: true
    })
    super.onClick();
  }
}



export class CommandResult extends Result<ICommand>
{
  normalizedTitle: string;
  init()
  {
    super.init();
    this.classes = [
      "command-result"
    ];
    this.title = this.entity.title;
    this.normalizedTitle = (this.entity.title ?? "").toLowerCase();
  }
  
  _getScore(q: string): number
  {
    if(String.isNullOrEmpty(this.entity.title))
      return 0;
    
    return getMatchScore(this.entity.title, q) * 3;
  }
  
  protected _getIcon()
  {
    let i = document.createElement("span");
    i.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-prompt" width="${iconWidth}" height="${iconWidth}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <polyline points="5 7 10 12 5 17"></polyline>
  <line x1="13" y1="17" x2="19" y2="17"></line>
 </svg>`.trim();
    return i;
  }
  
  protected _getRightElement(str: string)
  {
    if(this.entity.detail == null)
      return null;
    let s = document.createElement("span");
    s.innerHTML = this.entity.detail;
    return s;
  }
  
  async onClick()
  {
    let r = this.entity.invoke();
    if(r instanceof Promise)
      await r;
    super.onClick();
  }
}