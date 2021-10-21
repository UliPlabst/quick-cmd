# quick-cmd
A simple firefox web extension written in vanilla js (though typescript) without **any dependencies**. It aims to mimic vscodes quick command popup. Open the quick-cmd panel with **Alt+Shift+P** and start typing. The search includes open tabs, history items, bookmarks and commands. Just like in vscode you can limit the search by prepending either `:`, `@`, `#` or `>` to your query string.  
Examples:
- `Google` will search in all open tabs, bookmarks, history items and commands for the word google
- `#Google` will only search in open tabs
- `:Google` will only search in your browser history 
- `@Google` will only search in your bookmarks
- `>Google` will search for commands 

# Commands
Right now there is only three commands:
- **quick-cmd.clearExtensionStorage**: clears extension storage (used to store favicons)
- **bookmarks.add**: add bookmark of current tab
- **bookmarks.remove**: remove bookmark of current tab (bookmarks.search api is used to find the bookmark of the current tabs. If there is more than one result nothing will be removed)
Commands are defined in `src/popup/commands`. Feel free to add commands and send them as a pull request.

# Options
Configure some options by clicking on the settings in your manage extensions firefox page:
- **Max displayed items**: Maximum number of displayed search results
- **Fetch favicons**: Fetch favicons and cache them in the browser storage
- **Single line**: Will remove the small second line in results that have a second line 

# Build
- Setup: `npm install`
- Build: `npm run build` or `npm run build:watch`
- Start firefox in extension debug mode `npm run start`
- Production build (will invoke webpack with mode=production and web-ext build)
  - `npm run build:prod`
  
# Why
The firefox address bar already covers a lot of the functionality that my extension provides but it has some drawbacks. I wanted to design a more compact version with more sophisticated filtering support that also allows me to quickly switch to an open tab when I cannot find it in all the tabs that I have open. The firefox while covering 90% of my needs lacks the last 10%.

# Icons
Thanks to [tabler-icons](https://github.com/tabler/tabler-icons) for providing a free icon set.