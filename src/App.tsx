import {useEffect,useRef,useState} from 'react';
import {Script,listScripts,saveScript,deleteScript,newScript} from './db';
import {importFile} from './importers';import {loadSettings,saveSettings,Settings} from './settings';import Studio from './Studio';import {floatMode} from './floating';
export default function App(){
 const [scripts,setScripts]=useState<Script[]>([]),[cur,setCur]=useState<Script|null>(null),[view,setView]=useState<'home'|'edit'|'studio'>('home'),
  [q,setQ]=useState(''),[cfg,setCfgS]=useState<Settings>(loadSettings),[msg,setMsg]=useState(''),file=useRef<HTMLInputElement>(null);
 const setCfg=(s:Settings)=>{setCfgS(s);saveSettings(s)};
 const refresh=async()=>setScripts(await listScripts());useEffect(()=>{refresh()},[]);
 useEffect(()=>{if(view==='edit'&&cur){const t=setTimeout(()=>saveScript(cur),500);return()=>clearTimeout(t)}},[cur,view]);
 const open=(s:Script,v:'edit'|'studio'='edit')=>{setCur(s);setView(v)};
 const create=async(t?:string,x?:string)=>{const s=newScript(t,x);await saveScript(s);open(s)};
 const doImport=async(f?:File)=>{if(!f)return;setMsg('Reading '+f.name+'…');try{await create(f.name.replace(/\.[^.]+$/,''),await importFile(f));setMsg('')}catch(e){setMsg((e as Error).message)}};
 const exportTxt=(s:Script)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s.text],{type:'text/plain'}));a.download=s.title+'.txt';a.click()};
 if(view==='studio'&&cur)return <Studio script={cur} cfg={cfg} setCfg={setCfg} onExit={()=>setView('edit')}/>;
 if(view==='edit'&&cur){const words=cur.text.trim()?cur.text.trim().split(/\s+/).length:0;
  return <div className="mx-auto flex h-screen max-w-3xl flex-col gap-3 p-4">
   <div className="flex gap-2"><button className="btn" onClick={()=>{saveScript(cur).then(refresh);setView('home')}}>Home</button>
    <input className="field text-base" value={cur.title} onChange={e=>setCur({...cur,title:e.target.value})}/>
    <button className="btn" onClick={()=>exportTxt(cur)}>Export TXT</button>
    <button className="btn" onClick={()=>{saveScript(cur);floatMode(cur.text,cfg)}}>Floating</button>
    <button className="btn btn-primary" onClick={()=>{saveScript(cur);setView('studio')}}>Open in studio</button></div>
   <textarea className="field flex-1 resize-none text-lg leading-relaxed" placeholder="Paste or type your script" value={cur.text} onChange={e=>setCur({...cur,text:e.target.value})}/>
   <div className="text-xs text-stone-500">{words.toLocaleString()} words · {cur.text.length.toLocaleString()} characters · saved automatically</div></div>}
 const list=scripts.filter(s=>(s.title+s.text).toLowerCase().includes(q.toLowerCase()));
 return <div className="mx-auto max-w-3xl p-5">
  <h1 className="mb-1 text-2xl font-semibold tracking-[.2em] text-brass">MERCY PROMPTER</h1><p className="mb-5 text-sm text-stone-500">Scripts stay on this device. No account needed.</p>
  <div className="mb-4 flex flex-wrap gap-2"><button className="btn btn-primary" onClick={()=>create()}>New script</button>
   <button className="btn" onClick={()=>file.current?.click()}>Import PDF / DOCX / TXT</button>
   <input ref={file} type="file" hidden accept=".pdf,.docx,.txt" onChange={e=>{doImport(e.target.files?.[0]);e.target.value=''}}/></div>
  {msg&&<div className="mb-3 rounded-lg border border-edge bg-coal p-3 text-sm">{msg}</div>}
  <input className="field mb-3" placeholder="Search scripts" value={q} onChange={e=>setQ(e.target.value)}/>
  {list.length===0&&<p className="py-10 text-center text-stone-500">No scripts yet. Create one or import a document.</p>}
  <ul className="divide-y divide-edge rounded-lg border border-edge">{list.map(s=><li key={s.id} className="flex items-center gap-2 p-3">
   <button className="flex-1 text-left" onClick={()=>open(s)}><div>{s.title}</div><div className="text-xs text-stone-500">{new Date(s.updated).toLocaleString()} · {s.text.length.toLocaleString()} chars</div></button>
   <button className="btn" onClick={()=>open(s,'studio')}>Prompt</button>
   <button className="btn" onClick={async()=>{await saveScript({...s,id:crypto.randomUUID(),title:s.title+' copy'});refresh()}}>Duplicate</button>
   <button className="btn" onClick={async()=>{if(confirm('Delete "'+s.title+'"?')){await deleteScript(s.id);refresh()}}}>Delete</button></li>)}</ul>
  <details className="mt-6 rounded-lg border border-edge p-3 text-sm"><summary className="cursor-pointer">Defaults</summary><div className="mt-3 grid grid-cols-2 gap-3">
   <label>Font size<input className="field" type="number" value={cfg.size} onChange={e=>setCfg({...cfg,size:+e.target.value})}/></label>
   <label>Speed (px/s)<input className="field" type="number" value={cfg.speed} onChange={e=>setCfg({...cfg,speed:+e.target.value})}/></label>
   <label>Text colour<input className="field" type="color" value={cfg.color} onChange={e=>setCfg({...cfg,color:e.target.value})}/></label>
   <label>Mirror by default<input type="checkbox" className="ml-2" checked={cfg.mirror} onChange={e=>setCfg({...cfg,mirror:e.target.checked})}/></label></div></details></div>}
