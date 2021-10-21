import { getBookmarks } from "./bookmarks";
import "./popup.sass";
import "../lib/extensions";
import { initOpts, options } from "../lib/options";
import { BookmarkResult, CommandResult, HistoryResult, Result, TabResult } from "./result";
import { debounced } from "./util";
import { commands } from "./commands";

window.onload = async () => {
  await initOpts();
  const resultsContainer = document.querySelector<HTMLDivElement>(".results-container");
  const input = document.querySelector<HTMLInputElement>(".root-input")
  input.focus();
  
  let bookmarks = await getBookmarks();
  let tabs = await browser.tabs.query({});
  
  let results: Result[] = [
    ...bookmarks.map(b => new BookmarkResult(b)),
    ...tabs.map(t => new TabResult(t)),
    ...commands.map(c => new CommandResult(c))
  ]
  
  let candidates = results;
  
  let selectedCandidate: Result;
  let selected = 0;
  updateSelected(0);
  
  async function update(str: string)
  {
    let filter = null;
    switch(str[0])
    {
      case "@":
        filter = BookmarkResult;
        break;
      case "#":
        filter = TabResult;
        break;
      case ":":
        filter = HistoryResult;
        break;
      case ">":
        filter = CommandResult;
        break;
    }
    if(filter != null)
      str = str.substr(1);
    
    let history: browser.history.HistoryItem[];
    if((filter == null || filter == HistoryResult))
    {
      history = await browser.history.search({
        text: str,
        maxResults: options.maxDisplayedItems
      });
      history = history.filter(h => h.url && !h.url.startsWith("file"))
    }
    else
    {
      history = [];
    }
    
    str = str.toLowerCase();
    candidates = [
      ...results,
      ...history.map(e => new HistoryResult(e))
    ]
    if(filter)
      candidates = candidates.filter(e => e instanceof filter);
      
    
    if(!String.isNullOrEmpty(str))
    {
      candidates
        .forEach(r => r.updateScore(str));
      candidates = candidates
        .orderByDesc(r => r.score)
        .filter(r => r.score > 0);
    }

    candidates = candidates.slice(0, options.maxDisplayedItems);
    
    // if(candidates.indexOf(selectedCandidate) < 0)
    //   updateSelected(0);
      
    resultsContainer.innerText = "";
    let nodes = candidates
      .map(c => c.render(str));
    resultsContainer.append(...nodes);
    
    updateSelected(0);
  }
  
  function updateSelected(sel)
  {
    if(sel < 0)
      selected = candidates.length - 1;
    else if(sel > (candidates.length - 1))
      selected = 0;
    else 
      selected = sel;
      
    if(selectedCandidate)
      selectedCandidate.selected = false;
    if(candidates.length > 0)
    {
      selectedCandidate = candidates[selected];
      selectedCandidate.selected = true;
    }
    return selected;
  }
  
  // input.addEventListener("keyup", )
  
  input.addEventListener("keydown", (ev) => {
    let upd = false;
    if(ev.key == "ArrowDown")
    {
      updateSelected(selected + 1);
    }
    else if(ev.key == "ArrowUp")
    {
      updateSelected(selected - 1);
    }
    else if(ev.key == "Enter")
    {
      candidates.find(e => e.selected)?.onClick();
    }
    
    if(upd)
    {
      setTimeout(async () => {
        await update(input.value);
      });
    }
  });
  input.addEventListener("input", debounced(50, async (ev: any) => {
    await update(ev.target.value);
  }));
  
  update("");
}