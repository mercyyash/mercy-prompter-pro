import {useEffect,useRef,useState,useCallback} from 'react';
import {floatMode} from './floating';import {Script} from './db';import {Settings} from './settings';
const FONTS=['Georgia','Arial','Verdana','Courier New','Times New Roman','Trebuchet MS'];
export default function Studio({script,cfg,setCfg,onExit}:{script:Script;cfg:Settings;setCfg:(s:Settings)=>void;onExit:()=>void}){
 const video=useRef<HTMLVideoElement>(null),box=useRef<HTMLDivElement>(null),bar=useRef<HTMLDivElement>(null);
 const stream=useRef<MediaStream|null>(null),rec=useRef<MediaRecorder|null>(null),chunks=useRef<Blob[]>([]);
 const speed=useRef(cfg.speed),playing=useRef(false),pos=useRef(0),last=useRef(0);
 const [play,setPlay]=useState(false),[ui,setUi]=useState(true),[panel,setPanel]=useState(false),[err,setErr]=useState(''),
  [cams,setCams]=useState<MediaDeviceInfo[]>([]),[count,setCount]=useState(0),[recording,setRecording]=useState(false),[dir,setDir]=useState(1);
 const canRec=typeof MediaRecorder!=='undefined';
 const upd=(p:Partial<Settings>)=>{const n={...cfg,...p};setCfg(n);if(p.speed!==undefined)speed.current=p.speed};
 const startCam=useCallback(async(c:string)=>{
  stream.current?.getTracks().forEach(t=>t.stop());
  try{const v:MediaTrackConstraints=c==='user'||c==='environment'?{facingMode:c}:{deviceId:{exact:c}};
   const s=await navigator.mediaDevices.getUserMedia({video:v,audio:canRec});stream.current=s;
   if(video.current)video.current.srcObject=s;setErr('');
   setCams((await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput'));
  }catch(e){const n=(e as DOMException).name;setErr(n==='NotAllowedError'?'Camera or microphone permission was denied. Allow access in system settings, then tap Retry.':n==='NotFoundError'?'No camera was found on this device.':'Camera error: '+(e as Error).message)}
 },[canRec]);
 useEffect(()=>{startCam(cfg.camera);
  let wl:any;(navigator as any).wakeLock?.request('screen').then((l:any)=>wl=l).catch(()=>{});
  return()=>{stream.current?.getTracks().forEach(t=>t.stop());wl?.release?.()}},[]);
 useEffect(()=>{let id=0;const tick=(t:number)=>{const el=box.current;
  if(el){const dt=Math.min(.1,(t-last.current)/1000);last.current=t;
   if(playing.current){pos.current+=dir*speed.current*dt;const max=el.scrollHeight-el.clientHeight;
    if(pos.current>=max){pos.current=max;playing.current=false;setPlay(false)}if(pos.current<0)pos.current=0;el.scrollTop=pos.current}
   const m=el.scrollHeight-el.clientHeight;if(bar.current)bar.current.style.width=(m>0?100*el.scrollTop/m:0)+'%'}
  id=requestAnimationFrame(tick)};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id)},[dir]);
 const jump=(y:number)=>{const el=box.current!;pos.current=Math.max(0,Math.min(y,el.scrollHeight));el.scrollTop=pos.current};
 const toggle=()=>{playing.current=!playing.current;setPlay(playing.current)};
 const begin=()=>{let n=cfg.countdown;if(n<=0)return toggle();setCount(n);const i=setInterval(()=>{n--;setCount(n);if(n<=0){clearInterval(i);playing.current=true;setPlay(true)}},1000)};
 const fs=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{});
 const record=()=>{if(recording){rec.current?.stop();return}if(!stream.current)return;
  chunks.current=[];const r=new MediaRecorder(stream.current);r.ondataavailable=e=>chunks.current.push(e.data);
  r.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks.current,{type:r.mimeType}));a.download=`${script.title}-${Date.now()}.webm`;a.click();setRecording(false)};
  r.start();rec.current=r;setRecording(true)};
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if((e.target as HTMLElement).tagName==='SELECT'||(e.target as HTMLElement).tagName==='INPUT')return;
  if(e.code==='Space'){e.preventDefault();toggle()}else if(e.key==='ArrowUp'){e.preventDefault();upd({speed:Math.min(400,cfg.speed+10)})}
  else if(e.key==='ArrowDown'){e.preventDefault();upd({speed:Math.max(5,cfg.speed-10)})}else if(e.key==='Home')jump(0);else if(e.key==='End')jump(1e9)};
  addEventListener('keydown',k);return()=>removeEventListener('keydown',k)});
 useEffect(()=>{let h:any;import('@capacitor/app').then(({App})=>{h=App.addListener('backButton',()=>{if(playing.current)toggle();else onExit()})}).catch(()=>{});return()=>{h?.then?.((x:any)=>x.remove())}},[]);
 const paras=script.text.split(/\n/);
 const row=(l:string,c:React.ReactNode)=><label className="flex items-center justify-between gap-3 text-xs">{l}{c}</label>;
 const rng=(k:keyof Settings,min:number,max:number,step=1)=><input type="range" min={min} max={max} step={step} value={cfg[k] as number} onChange={e=>upd({[k]:+e.target.value})}/>;
 return <div className="fixed inset-0 bg-black overflow-hidden select-none" onClick={()=>setUi(u=>!u)}>
  <video ref={video} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{transform:cfg.mirror?'scaleX(-1)':undefined}}/>
  {err&&<div className="absolute inset-x-6 top-20 z-30 rounded-lg bg-red-950/90 p-4 text-sm" onClick={e=>e.stopPropagation()}>{err} <button className="btn ml-2" onClick={()=>startCam(cfg.camera)}>Retry</button></div>}
  <div className="absolute inset-x-0 bottom-0" style={{top:cfg.pos+'%',background:`rgba(0,0,0,${cfg.bg})`}}/>
  <div ref={box} className="absolute inset-x-0 bottom-0 overflow-hidden" style={{top:cfg.pos+'%',padding:`0 ${cfg.margin}%`,transform:cfg.mirror?'scaleX(-1)':undefined}}>
   <div style={{paddingTop:'35vh',paddingBottom:'80vh',font:`${cfg.size}px/${cfg.line} ${cfg.font}`,color:cfg.color,textAlign:cfg.align,textShadow:'0 1px 4px #000'}}>
    {paras.map((p,i)=><p key={i} style={{margin:'0 0 .6em',minHeight:'1em'}}>{p}</p>)}</div></div>
  <div className="absolute left-0 right-0 top-0 h-1 z-20"><div ref={bar} className="h-full bg-brass"/></div>
  {count>0&&<div className="absolute inset-0 grid place-items-center text-9xl font-bold z-20 pointer-events-none">{count}</div>}
  {recording&&<div className="absolute right-4 top-4 z-20 flex items-center gap-2 text-sm"><span className="h-3 w-3 animate-pulse rounded-full bg-red-500"/>REC</div>}
  {ui&&<div className="absolute inset-x-0 bottom-0 z-20 bg-ink/90 p-3 backdrop-blur" onClick={e=>e.stopPropagation()}>
   {panel&&<div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4">
    {row('Font size',rng('size',20,140))}{row('Line spacing',rng('line',1,2.5,.1))}{row('Margins',rng('margin',0,35))}
    {row('Text position',rng('pos',0,60))}{row('Text background',rng('bg',0,1,.05))}{row('Countdown (s)',rng('countdown',0,10))}
    {row('Colour',<input type="color" value={cfg.color} onChange={e=>upd({color:e.target.value})}/>)}
    {row('Font',<select className="field w-32" value={cfg.font} onChange={e=>upd({font:e.target.value})}>{FONTS.map(f=><option key={f}>{f}</option>)}</select>)}
    {row('Align',<select className="field w-28" value={cfg.align} onChange={e=>upd({align:e.target.value as Settings['align']})}><option>left</option><option>center</option><option>right</option></select>)}
    {row('Camera',<select className="field w-40" value={cfg.camera} onChange={e=>{upd({camera:e.target.value});startCam(e.target.value)}}>
     <option value="user">Front</option><option value="environment">Rear</option>{cams.map((c,i)=><option key={c.deviceId} value={c.deviceId}>{c.label||'Camera '+(i+1)}</option>)}</select>)}
    {row('Mirror',<input type="checkbox" checked={cfg.mirror} onChange={e=>upd({mirror:e.target.checked})}/>)}
    {row('Reverse scroll',<input type="checkbox" checked={dir<0} onChange={e=>setDir(e.target.checked?-1:1)}/>)}</div>}
   <div className="flex flex-wrap items-center gap-2">
    <button className="btn" onClick={onExit}>Back</button>
    <button className="btn" onClick={()=>jump(0)}>⏮</button>
    <button className="btn" onClick={()=>jump(box.current!.scrollTop-200)}>▲</button>
    <button className="btn btn-primary w-24" onClick={play?toggle:begin}>{play?'Pause':pos.current>0?'Resume':'Play'}</button>
    <button className="btn" onClick={()=>jump(box.current!.scrollTop+200)}>▼</button>
    <button className="btn" onClick={()=>jump(1e9)}>⏭</button>
    <button className="btn" onClick={()=>{jump(0);playing.current=false;setPlay(false)}}>Restart</button>
    <button className="btn" onClick={()=>upd({speed:Math.max(5,cfg.speed-10)})}>−</button>
    <span className="w-16 text-center text-sm">{cfg.speed} px/s</span>
    <button className="btn" onClick={()=>upd({speed:Math.min(400,cfg.speed+10)})}>+</button>
    <button className="btn" onClick={()=>setPanel(p=>!p)}>Style</button>
    <button className="btn" onClick={fs}>Fullscreen</button>
    <button className="btn" onClick={()=>floatMode(script.text,cfg)}>Floating</button>
    {canRec&&<button className="btn" onClick={record}>{recording?'Stop & save':'Record'}</button>}
   </div></div>}
 </div>}
