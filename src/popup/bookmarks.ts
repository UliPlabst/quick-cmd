function visit(bm: browser.bookmarks.BookmarkTreeNodeExt, array: browser.bookmarks.BookmarkTreeNode[], path: string[])
{
  bm.path = path;
  if(bm.type == "bookmark")
    array.push(bm);
  else if(bm.children)
    bm.children.forEach(c => visit(c, array, [...path, bm.title]));
  return array;
}


export async function getBookmarks(): Promise<browser.bookmarks.BookmarkTreeNodeExt[]>
{
  let bm = await browser.bookmarks.getTree();
  let bookmarks = bm.selectMany(v => visit(v, [], []));
  return bookmarks;
}