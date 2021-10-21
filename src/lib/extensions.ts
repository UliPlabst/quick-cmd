declare global 
{
  interface Array<T> {
    contains(arg: T | ((el: T) => boolean)): boolean;
    any(fn?: (el: T) => boolean): boolean;
    remove(arg: T | ((el: T) => boolean)): void;
    all(fn?: (el: T) => boolean): boolean;
    orderBy(fn: (el: T) => any): Array<T>;
    orderByDesc(fn: (el: T) => any): Array<T>;
    selectMany<TProp>(fn: (el: T, i?: number) => TProp[]): Array<TProp>;
    groupBy<TKey>(fn: (el: T) => TKey): Array<{ key: TKey, elements: T[]}>
    
    first(fn?: (el: T) => boolean): T;
    last(fn?: (el: T) => boolean): T;
    elementAt(num: number): T;
    
    distinct(): Array<T>
    distinctBy(fn: (e: T) => unknown);
  }
  
  interface StringConstructor
  {
    isNullOrEmpty(s: string): boolean;
  }
  
  namespace browser.bookmarks
  {
    interface BookmarkTreeNodeExt extends BookmarkTreeNode
    {
      path?: string[];
    }
  }
  
}


String.isNullOrEmpty = function(s)
{
  return s == null || s == "";
}



Array.prototype.groupBy = function<TKey>(fn: (el: any, i?: number) => TKey):  Array<{ key: TKey, elements: any[]}>
{
  let dict = {};
  let res: Array<{key: TKey, elements: any[]}> = [];
  let i = 0;
  for(let e of this)
  {
    let key = fn(e, i);
    let strKey = JSON.stringify(key);
    if(dict[strKey])
    {
      dict[strKey].elements.push(e);
    }
    else 
    {
      let r = {
        key: key,
        elements: [
          e
        ]
      }
      dict[strKey] = r;
      res.push(r);
    };
    i++;
  }
  return res;
};

Array.prototype.contains = function(arg) {
  if(typeof(arg) == "function")
    return this.find(arg) != null;

  return this.indexOf(arg) >= 0;
};

Array.prototype.distinct = function(this: any[]) {
  if(this == null)
    return null;
  return this.filter((v,i,a) => a.indexOf(v) == i);
};


Array.prototype.first = function<T>(this: Array<T>, fn: (el: T) => boolean = null) {
  if(this == null)
    return null;
  if(typeof(fn) == "function")
    return this.find(fn);
  return this[0];
};

Array.prototype.last = function<T>(this: Array<T>, fn: (el: T) => boolean = null) {
  if(this == null || this.length == 0)
    return null;
  if(typeof(fn) == "function")
    return this.reverse().find(fn);
  return this[this.length - 1];
};

Array.prototype.orderBy = function(arg) {
  this.sort((a: any, b: any) => {
    let _a = arg(a);
    let _b = arg(b);
    return _a == _b ? 0 : (_a < _b ? -1 : 1);
  });
  return this;
};

Array.prototype.orderByDesc = function(arg) {
  this.sort((a: any, b: any) => {
    let _a = arg(a);
    let _b = arg(b);
    return _a == _b ? 0 : (_a < _b ? 1 : -1);
  });
  return this;
};

Array.prototype.remove = function(arg) {
  if(typeof(arg) == "function")
  {
    for(let el of this.filter(arg))
    {
      this.splice(this.indexOf(el), 1);
    }
  }
  else
  {
    this.splice(this.indexOf(arg), 1);
  }
};


Array.prototype.any = function(this: any[], fn) {
  if(fn != null)
    return this.filter(el => fn(el)).length != 0;
  else
    return this.length != 0;
};

Array.prototype.all = function(fn) {
  for(let el of this)
  {
    if(fn(el) == false)
      return false;
  }
  return true;
};

Array.prototype.selectMany = function(this: any[], fn) {
  return this
    .map(fn)
    .reduce((a,b) => {
      return a.concat(b);
    }, []);
};

export {}