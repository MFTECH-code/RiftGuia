import {readFile, rename, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const worklistPath=resolve(root,'public/data/translation-worklist.pt-BR.json');
const outputPath=resolve(root,'public/data/translations.pt-BR.json');
const worklist=JSON.parse(await readFile(worklistPath,'utf8'));
if(worklist?.format!=='rift-guia-translation-worklist'||worklist.version!==1||!Array.isArray(worklist.cards))throw new Error('Arquivo de trabalho inválido.');

let existing={};
try{const previous=JSON.parse(await readFile(outputPath,'utf8'));if(previous?.schemaVersion===1&&previous.translations&&typeof previous.translations==='object')existing=previous.translations;}catch{}
const ids=new Set(),translations={...existing};let imported=0,skipped=0;
for(const card of worklist.cards){
  if(!card||typeof card.id!=='string'||!card.id||ids.has(card.id))throw new Error('Há identificadores ausentes ou duplicados no arquivo de trabalho.');
  ids.add(card.id);
  const name=card.translation?.name?.trim(),text=card.translation?.text?.trim();
  if(!name||!text){skipped++;continue;}
  if(typeof card.originalText!=='string'||name.length>160||text.length>12000)throw new Error(`Tradução inválida para ${card.id}.`);
  translations[card.id]={name,text,source:card.originalText,updatedAt:new Date().toISOString(),provider:'external-worklist'};
  imported++;
}
const output={schemaVersion:1,generatedAt:new Date().toISOString(),source:'translation-worklist.pt-BR.json',total:Object.keys(translations).length,translations};
const temporary=`${outputPath}.tmp`;
await writeFile(temporary,JSON.stringify(output,null,2)+'\n','utf8');
await rename(temporary,outputPath);
console.log(JSON.stringify({imported,skipped,total:Object.keys(translations).length}));
