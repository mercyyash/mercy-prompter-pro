export interface Script{id:string;title:string;text:string;updated:number}
const open=()=>new Promise<IDBDatabase>((res,rej)=>{const r=indexedDB.open('mercy',1);
 r.onupgradeneeded=()=>r.result.createObjectStore('scripts',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const run=async<T,>(mode:IDBTransactionMode,f:(s:IDBObjectStore)=>IDBRequest<T>)=>{const db=await open();
 return new Promise<T>((res,rej)=>{const q=f(db.transaction('scripts',mode).objectStore('scripts'));q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})};
export const listScripts=async()=>(await run('readonly',s=>s.getAll() as IDBRequest<Script[]>)).sort((a,b)=>b.updated-a.updated);
export const saveScript=(s:Script)=>run('readwrite',st=>st.put({...s,updated:Date.now()}));
export const deleteScript=(id:string)=>run('readwrite',st=>st.delete(id));
export const newScript=(title='Untitled script',text=''):Script=>({id:crypto.randomUUID(),title,text,updated:Date.now()});
