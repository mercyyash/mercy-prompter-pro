const {app,BrowserWindow,session}=require('electron');const path=require('path');
app.whenReady().then(()=>{
 session.defaultSession.setPermissionRequestHandler((_w,p,cb)=>cb(['media','fullscreen'].includes(p)));
 const w=new BrowserWindow({width:1280,height:800,backgroundColor:'#121214',autoHideMenuBar:true,webPreferences:{contextIsolation:true}});
 w.loadFile(path.join(__dirname,'../dist/index.html'));
});
app.on('window-all-closed',()=>app.quit());
