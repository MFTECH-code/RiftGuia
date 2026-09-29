import {mkdir, rename, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const cardsPath=resolve(root,'public/data/cards.json');
const outputPath=resolve(root,'public/data/translation-worklist.pt-BR.json');
const snapshot=JSON.parse(await (await import('node:fs/promises')).readFile(cardsPath,'utf8'));
if(snapshot?.schemaVersion!==1||!Array.isArray(snapshot.cards))throw new Error('Snapshot de cartas inválido em public/data/cards.json.');

const cards=snapshot.cards.map(card=>({
  id:card.riftbound_id,
  originalName:card.name,
  originalText:card.text?.plain||'',
  type:card.classification?.type||'',
  domains:card.classification?.domain||[],
  translation:{name:'',text:''},
})).sort((a,b)=>a.id.localeCompare(b.id));
const worklist={
  format:'rift-guia-translation-worklist',
  version:1,
  language:'pt-BR',
  generatedAt:new Date().toISOString(),
  total:cards.length,
  instructions:'Preencha somente translation.name e translation.text. Preserve números, símbolos :rb_...:, nomes próprios e regras. Não remova, renomeie nem reordene os campos.',
  cards,
};
await mkdir(resolve(root,'public/data'),{recursive:true});
const temporary=`${outputPath}.tmp`;
await writeFile(temporary,JSON.stringify(worklist,null,2)+'\n','utf8');
await rename(temporary,outputPath);
console.log(`Arquivo de trabalho salvo: ${cards.length} cartas em ${outputPath}`);
