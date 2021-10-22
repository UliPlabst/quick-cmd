/* global getLimit */
import { defaultOptions, initOpts, options, saveOpts } from "../lib/options";
import "./options.sass";
import "../lib/extensions";


function updateOptInputs()
{
  for(let key of Object.keys(options))
  {
    let i = document.getElementById(key) as HTMLInputElement;
    let type = typeof options[key];
    if(i)
    {
      if(type == "boolean")
        i.checked = options[key];
      else
        i.value = options[key];
    }
  }
}

async function main()
{
  await initOpts();
  updateOptInputs();
  for(let key of Object.keys(options))
  {
    console.log("init");
    let i = document.getElementById(key) as HTMLInputElement;
    let type = typeof options[key];
    if(i)
    {
      i.addEventListener("change", async (ev: InputEvent) => {
        let val;
        if(type == "number")
          val = Number.parseFloat(i.value);
        else if(type == "boolean")
          val = (i as any).checked;
        else if(type == "string")
          val = i.value;
          
        options[key] = val;
        await saveOpts();
      });
    }
  }
  
  
  document.getElementById("reset-button")
    .addEventListener("click", async () => {
      Object.assign(options, defaultOptions);
      updateOptInputs();
      await saveOpts();
    });
}

document.addEventListener('DOMContentLoaded', main)
