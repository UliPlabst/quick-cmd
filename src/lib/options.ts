import { getObject } from "./tool";

const v = "v1";

export async function initOpts()
{
  let key = `options/${v}`;
  let o: any = await browser.storage.local.get(key)
  o = o[key];
  if(o && Object.keys(o).any())
  {
    options = {
      ...options,
      ...o
    }
  }
}

export async function saveOpts()
{
  console.log("set", options);
  await browser.storage.local.set(getObject(`options/${v}`, options))
}


export var options = {
  maxDisplayedItems: 20,
  fetchFavicons: true,
  singleLine: false
}