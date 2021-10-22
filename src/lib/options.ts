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
      ...defaultOptions,
      ...o
    }
  }
}

export async function saveOpts()
{
  console.log("set", options);
  await browser.storage.local.set(getObject(`options/${v}`, options))
}

export var defaultOptions = {
  maxDisplayedItems: 15,
  fetchFavicons: true,
  singleLine: false
}

export var options = {
  maxDisplayedItems: 15,
  fetchFavicons: true,
  singleLine: false
}