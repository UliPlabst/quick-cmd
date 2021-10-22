import { constants } from "./constants";
import { options } from "./options";

export function getDomain(url: string)
{
  if(String.isNullOrEmpty(url))
    return null;
  
  return new URL(url).origin;
}

export function getFaviconImage(el: { url?: string})
{
  try
  {
    if(String.isNullOrEmpty(el.url))
      return null;
    let i = createFaviconImage();
    let domain = getDomain(el.url);
    if(domain)
    {
      let key = `favicon/${domain}`;
      browser.storage.local.get(key).then(e => {
        if(e[key])
          i.src = e[key] as any;
        else if(options.fetchFavicons)
          i.src = `${domain}/favicon.ico`;
      });
    }
    else
    {
      i.style.visibility = "hidden";
    }
    return i;
  }
  catch(err)
  {
    return null; 
  }
}

export function createFaviconImage()
{
  let i = document.createElement("img");
  i.width = constants.iconWidth;
  i.height = constants.iconWidth;
  i.classList.add("favicon");
  i.style.visibility = "hidden";
  i.addEventListener("load", () => i.style.visibility = "visible");
  return i;
}

export function getObject(key: string, value: any)
{
  let o = {};
  o[key] = value;
  return o;
}
