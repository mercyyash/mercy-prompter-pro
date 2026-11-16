export interface Settings{font:string;size:number;speed:number;mirror:boolean;color:string;bg:number;camera:string;countdown:number;margin:number;line:number;align:'left'|'center'|'right';pos:number}
export const defaults:Settings={font:'Georgia',size:48,speed:60,mirror:false,color:'#ffffff',bg:0.35,camera:'user',countdown:3,margin:12,line:1.5,align:'center',pos:30};
export const loadSettings=():Settings=>{try{return{...defaults,...JSON.parse(localStorage.getItem('mp.settings')||'{}')}}catch{return defaults}};
export const saveSettings=(s:Settings)=>{try{localStorage.setItem('mp.settings',JSON.stringify(s))}catch{}};
