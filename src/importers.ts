import * as pdfjs from 'pdfjs-dist';
import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
pdfjs.GlobalWorkerOptions.workerSrc=worker;
export async function importFile(f:File):Promise<string>{
 const n=f.name.toLowerCase();
 try{
  if(n.endsWith('.pdf')){const d=await pdfjs.getDocument({data:await f.arrayBuffer()}).promise;const out:string[]=[];
   for(let i=1;i<=d.numPages;i++){const c=await(await d.getPage(i)).getTextContent();let line='',y:number|null=null;
    for(const it of c.items as any[]){const ny=it.transform[5];if(y!==null&&Math.abs(ny-y)>2)line+='\n';line+=it.str;y=ny}out.push(line)}
   return out.join('\n\n')}
  if(n.endsWith('.docx'))return(await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()})).value;
  if(n.endsWith('.txt'))return await f.text();
 }catch(e){throw new Error(`Could not read "${f.name}": ${(e as Error).message}`)}
 throw new Error(`"${f.name}" is not a PDF, DOCX or TXT file.`);
}
