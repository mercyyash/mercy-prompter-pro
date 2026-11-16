import {Capacitor,registerPlugin} from '@capacitor/core';
const Overlay=registerPlugin<any>('Overlay');
export async function floatMode(text:string,c:{size:number;speed:number;color:string;bg:number;mirror:boolean}){
 if(!Capacitor.isNativePlatform()){alert('Floating mode only works in the Android app.');return}
 try{
  if(!(await Overlay.hasPermission()).granted){
   alert('Next screen: turn ON "Display over other apps" for MERCY PROMPTER, press Back, then tap Floating again.');
   await Overlay.requestPermission();return}
  await Overlay.show({text,size:c.size,speed:c.speed,color:c.color,bg:c.bg,mirror:c.mirror});
 }catch(e){alert('Floating mode failed: '+(e as Error).message)}
}
