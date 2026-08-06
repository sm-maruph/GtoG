const decoder = new TextDecoder();
const xml = (text) => new DOMParser().parseFromString(text, 'application/xml');

function unzipEntries(buffer){
  const bytes=new Uint8Array(buffer), view=new DataView(buffer); let end=-1;
  for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--) if(view.getUint32(i,true)===0x06054b50){end=i;break;}
  if(end<0) throw new Error('Invalid Excel file.');
  const count=view.getUint16(end+10,true), central=view.getUint32(end+16,true); const entries={}; let p=central;
  for(let i=0;i<count;i++){
    if(view.getUint32(p,true)!==0x02014b50) throw new Error('Invalid Excel ZIP directory.');
    const method=view.getUint16(p+10,true), compressed=view.getUint32(p+20,true), nameLen=view.getUint16(p+28,true), extraLen=view.getUint16(p+30,true), commentLen=view.getUint16(p+32,true), local=view.getUint32(p+42,true);
    const name=decoder.decode(bytes.slice(p+46,p+46+nameLen)); const localName=view.getUint16(local+26,true), localExtra=view.getUint16(local+28,true), start=local+30+localName+localExtra;
    entries[name]={method,data:bytes.slice(start,start+compressed)}; p+=46+nameLen+extraLen+commentLen;
  } return entries;
}
async function entryText(entry){
  if(!entry) return '';
  if(entry.method===0) return decoder.decode(entry.data);
  if(entry.method!==8) throw new Error('Unsupported Excel compression.');
  const stream=new Blob([entry.data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return decoder.decode(await new Response(stream).arrayBuffer());
}
function columnIndex(reference){let n=0;for(const c of reference.match(/^[A-Z]+/i)?.[0]||'')n=n*26+c.toUpperCase().charCodeAt(0)-64;return n-1;}
export async function parseXlsx(file){
  const entries=unzipEntries(await file.arrayBuffer());
  const sharedDoc=xml(await entryText(entries['xl/sharedStrings.xml']));
  const shared=[...sharedDoc.getElementsByTagName('si')].map(si=>[...si.getElementsByTagName('t')].map(t=>t.textContent).join(''));
  const workbook=xml(await entryText(entries['xl/workbook.xml'])); const firstSheet=workbook.getElementsByTagName('sheet')[0];
  if(!firstSheet) throw new Error('The workbook has no worksheet.');
  const relId=firstSheet.getAttribute('r:id'); const rels=xml(await entryText(entries['xl/_rels/workbook.xml.rels']));
  const rel=[...rels.getElementsByTagName('Relationship')].find(r=>r.getAttribute('Id')===relId); let target=rel?.getAttribute('Target')||'worksheets/sheet1.xml';
  target=target.replace(/^\//,'').replace(/^xl\//,''); const sheet=xml(await entryText(entries[`xl/${target}`]));
  return [...sheet.getElementsByTagName('row')].map(row=>{const out=[];for(const cell of row.getElementsByTagName('c')){const i=columnIndex(cell.getAttribute('r')||'A1'), type=cell.getAttribute('t'), raw=cell.getElementsByTagName('v')[0]?.textContent||'', inline=cell.getElementsByTagName('is')[0]?.textContent||'';out[i]=type==='s'?shared[Number(raw)]||'':type==='inlineStr'?inline:raw;}return Array.from({length:out.length},(_,i)=>out[i]??'');});
}

export function parseCsv(text){
  const rows=[];let row=[],value='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){value+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){row.push(value.trim());value='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(value.trim());if(row.some(Boolean))rows.push(row);row=[];value='';}else value+=c;}
  if(value||row.length){row.push(value.trim());rows.push(row);}return rows;
}
