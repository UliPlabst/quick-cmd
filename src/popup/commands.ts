export interface ICommand
{
  title: string;
  detail?: string;
  invoke: () => void|Promise<void>
}

export const commands: ICommand[] = [
  {
    title: "quick-cmd.clearExtensionStorage",
    detail: "Clears the extension cache",
    invoke: () => browser.storage.local.clear()
  },
  {
    title: "bookmarks.add",
    detail: "Add a bookmark",
    invoke: async () => {
      let tabs = await browser.tabs.query({active: true});
      if(tabs.length == 1)
      {
        let tab = tabs[0];
        if(!String.isNullOrEmpty(tab.url))
        {
          await browser.bookmarks.create({
            url: tab.url,
            title: tab.title
          });
        }
      }
    }
  },
  {
    title: "bookmarks.remove",
    detail: "Add a bookmark",
    invoke: async () => {
      let tabs = await browser.tabs.query({active: true});
      if(tabs.length == 1)
      {
        let tab = tabs[0];
        let bm = await browser.bookmarks.search(tab.title);
        if(bm.length == 1)
          await browser.bookmarks.remove(bm[0].id);
      }
    }
  }
]