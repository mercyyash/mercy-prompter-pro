package app.mercy.prompter;
import android.content.Intent;import android.graphics.Color;import android.net.Uri;import android.os.Build;import android.provider.Settings;
import com.getcapacitor.*;import com.getcapacitor.annotation.CapacitorPlugin;
@CapacitorPlugin(name="Overlay")
public class OverlayPlugin extends Plugin{
 @PluginMethod public void hasPermission(PluginCall c){JSObject o=new JSObject();o.put("granted",Build.VERSION.SDK_INT<23||Settings.canDrawOverlays(getContext()));c.resolve(o);}
 @PluginMethod public void requestPermission(PluginCall c){
  Intent i=new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,Uri.parse("package:"+getContext().getPackageName()));
  i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);getContext().startActivity(i);c.resolve();}
 @PluginMethod public void show(PluginCall c){
  FloatingService.TEXT=c.getString("text","");
  FloatingService.SIZE=Math.max(14,c.getInt("size",48)*0.6f);
  FloatingService.SPEED=c.getInt("speed",60);
  FloatingService.BG=(int)(c.getDouble("bg",0.35)*255);
  FloatingService.MIRROR=c.getBoolean("mirror",false);
  try{FloatingService.COLOR=Color.parseColor(c.getString("color","#ffffff"));}catch(Exception e){FloatingService.COLOR=Color.WHITE;}
  Intent i=new Intent(getContext(),FloatingService.class);
  if(Build.VERSION.SDK_INT>=26)getContext().startForegroundService(i);else getContext().startService(i);
  getActivity().moveTaskToBack(true);c.resolve();}
 @PluginMethod public void hide(PluginCall c){getContext().stopService(new Intent(getContext(),FloatingService.class));c.resolve();}
}
