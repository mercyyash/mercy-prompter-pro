package app.mercy.prompter;
import android.app.*;import android.content.*;import android.graphics.*;import android.graphics.drawable.GradientDrawable;
import android.os.*;import android.provider.MediaStore;import android.view.*;import android.widget.*;

public class FloatingService extends Service{
 static String TEXT="";static float SIZE=28;static int SPEED=60,COLOR=Color.WHITE,BG=90;static boolean MIRROR=false;
 WindowManager wm;WindowManager.LayoutParams lp;LinearLayout root,bottom,tools;ScrollView sv;TextView tv,play;
 Handler h=new Handler(Looper.getMainLooper());boolean playing=false,collapsed=false,big=false;float acc=0,d;long last;
 public IBinder onBind(Intent i){return null;}
 public int onStartCommand(Intent i,int f,int id){tv.setText(TEXT);tv.setTextSize(SIZE);tv.setTextColor(COLOR);tv.setScaleX(MIRROR?-1:1);sv.setBackgroundColor(Color.argb(BG,0,0,0));return START_NOT_STICKY;}
 public void onCreate(){super.onCreate();fg();build();}
 void fg(){
  NotificationManager nm=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);
  if(Build.VERSION.SDK_INT>=26)nm.createNotificationChannel(new NotificationChannel("mp","Prompter",NotificationManager.IMPORTANCE_LOW));
  Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(this,"mp"):new Notification.Builder(this);
  Notification n=b.setContentTitle("MERCY PROMPTER").setContentText("Floating prompter is running").setSmallIcon(android.R.drawable.ic_media_play).build();
  if(Build.VERSION.SDK_INT>=34)startForeground(1,n,1<<30);else startForeground(1,n);}
 TextView b(String s,Runnable r){TextView t=new TextView(this);t.setText(s);t.setTextSize(20);t.setTextColor(Color.WHITE);t.setGravity(Gravity.CENTER);
  t.setPadding((int)(14*d),(int)(8*d),(int)(14*d),(int)(8*d));t.setOnClickListener(v->r.run());return t;}
 LinearLayout row(int a){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.HORIZONTAL);l.setGravity(Gravity.CENTER_VERTICAL);l.setBackgroundColor(Color.argb(a,0,0,0));return l;}
 void setPlay(boolean p){playing=p;play.setText(p?"⏸":"▶");last=SystemClock.uptimeMillis();}
 void build(){
  d=getResources().getDisplayMetrics().density;wm=(WindowManager)getSystemService(WINDOW_SERVICE);
  root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);
  LinearLayout top=row(200);
  TextView min=b("⤡",()->{});
  min.setOnClickListener(v->{collapsed=!collapsed;int vis=collapsed?View.GONE:View.VISIBLE;sv.setVisibility(vis);bottom.setVisibility(vis);tools.setVisibility(View.GONE);});
  top.addView(min);
  top.addView(b("📷",()->{try{startActivity(new Intent(MediaStore.INTENT_ACTION_VIDEO_CAMERA).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));}catch(Exception e){}}));
  View sp=new View(this);top.addView(sp,new LinearLayout.LayoutParams(0,1,1f));
  top.addView(b("✕",()->stopSelf()));
  top.setOnTouchListener(new View.OnTouchListener(){float sx,sy;int ox,oy;
   public boolean onTouch(View v,MotionEvent e){int a=e.getAction();
    if(a==0){sx=e.getRawX();sy=e.getRawY();ox=lp.x;oy=lp.y;}
    else if(a==2){lp.x=ox+(int)(e.getRawX()-sx);lp.y=oy+(int)(e.getRawY()-sy);wm.updateViewLayout(root,lp);}
    return true;}});
  sv=new ScrollView(this);sv.setVerticalScrollBarEnabled(false);
  tv=new TextView(this);tv.setPadding((int)(16*d),(int)(50*d),(int)(16*d),(int)(300*d));tv.setShadowLayer(4,0,1,Color.BLACK);
  sv.addView(tv);
  bottom=row(200);
  play=b("▶",()->setPlay(!playing));GradientDrawable g=new GradientDrawable();g.setShape(GradientDrawable.OVAL);g.setColor(Color.parseColor("#FF2D6F"));play.setBackground(g);
  bottom.addView(b("⚙",()->tools.setVisibility(tools.getVisibility()==View.GONE?View.VISIBLE:View.GONE)));
  View s1=new View(this);bottom.addView(s1,new LinearLayout.LayoutParams(0,1,1f));
  bottom.addView(b("−",()->SPEED=Math.max(5,SPEED-10)));
  LinearLayout.LayoutParams pp=new LinearLayout.LayoutParams((int)(52*d),(int)(52*d));pp.setMargins((int)(8*d),0,(int)(8*d),0);bottom.addView(play,pp);
  bottom.addView(b("+",()->SPEED=Math.min(400,SPEED+10)));
  View s2=new View(this);bottom.addView(s2,new LinearLayout.LayoutParams(0,1,1f));
  bottom.addView(b("⤢",()->{big=!big;sv.getLayoutParams().height=(int)(big?getResources().getDisplayMetrics().heightPixels*0.55f:160*d);sv.requestLayout();}));
  tools=row(200);tools.setVisibility(View.GONE);
  tools.addView(b("A−",()->{SIZE=Math.max(12,SIZE-2);tv.setTextSize(SIZE);}));
  tools.addView(b("A+",()->{SIZE=Math.min(80,SIZE+2);tv.setTextSize(SIZE);}));
  tools.addView(b("BG",()->{BG=BG>=200?0:BG+60;sv.setBackgroundColor(Color.argb(BG,0,0,0));}));
  tools.addView(b("⇋",()->{MIRROR=!MIRROR;tv.setScaleX(MIRROR?-1:1);}));
  root.addView(top);root.addView(sv,new LinearLayout.LayoutParams(-1,(int)(160*d)));root.addView(bottom);root.addView(tools);
  lp=new WindowManager.LayoutParams(getResources().getDisplayMetrics().widthPixels-(int)(16*d),-2,Build.VERSION.SDK_INT>=26?2038:2002,
   WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE|WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,PixelFormat.TRANSLUCENT);
  lp.gravity=Gravity.TOP|Gravity.START;lp.x=(int)(8*d);lp.y=(int)(40*d);
  wm.addView(root,lp);last=SystemClock.uptimeMillis();h.post(tick);}
 Runnable tick=new Runnable(){public void run(){long n=SystemClock.uptimeMillis();float dt=Math.min(.1f,(n-last)/1000f);last=n;
  if(playing){acc+=SPEED*0.6f*d*dt;int w=(int)acc;if(w!=0){sv.scrollBy(0,w);acc-=w;}if(!sv.canScrollVertically(1))setPlay(false);}
  h.postDelayed(this,16);}};
 public void onDestroy(){h.removeCallbacks(tick);try{wm.removeView(root);}catch(Exception e){}super.onDestroy();}
}
