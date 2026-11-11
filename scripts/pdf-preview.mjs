import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const run=promisify(execFile);
function binary(name){const root=path.resolve(path.dirname(process.execPath),'../../native/poppler');return process.env[name.toUpperCase()+'_BIN']||[path.join(root,'bin',name+'.exe'),path.join(root,'Library','bin',name+'.exe')].find(existsSync)||name;}
export async function pdfPreview(directory,id,mode,page=1){
  const file=path.join(directory,id);
  if(mode==='info'){
    const {stdout}=await run(binary('pdfinfo'),[file],{windowsHide:true,timeout:15000,maxBuffer:1024*1024});
    const pages=Number(stdout.match(/^Pages:\s+(\d+)/m)?.[1]);if(!pages)throw Error('PDF page count could not be read.');return {pages};
  }
  if(!Number.isInteger(page)||page<1||page>500)throw Error('Choose a valid PDF page.');
  const prefix=path.join(directory,`preview-${id}-${page}`),png=prefix+'.png';
  if(!existsSync(png))await run(binary('pdftoppm'),['-f',String(page),'-l',String(page),'-singlefile','-scale-to','1500','-png',file,prefix],{windowsHide:true,timeout:15000,maxBuffer:1024*1024});
  return readFile(png);
}
