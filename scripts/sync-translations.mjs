import {readFile, rename, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {parseEnv} from 'node:util';

const root=resolve(import.meta.dirname,'..');
const cardsPath=resolve(root,'public/data/cards.json');
const outputPath=resolve(root,'public/data/translations.pt-BR.json');
const progressPath=resolve(root,'public/data/translation-progress.json');
let localEnv={};
try{localEnv=parseEnv(await readFile(resolve(root,'.env'),'utf8'));}catch(error){if(error?.code!=='ENOENT')throw error;}
const setting=name=>localEnv[name]||process.env[name];
const batchSize=Number(setting('TRANSLATION_BATCH_SIZE')||20);
const concurrency=Number(setting('TRANSLATION_CONCURRENCY')||3);
const model=setting('OPENAI_MODEL')||'gpt-5-mini';
const apiKey=setting('OPENAI_API_KEY');
if(!apiKey)throw new Error('Defina OPENAI_API_KEY antes de gerar traduções. A chave não é gravada no projeto.');
if(!Number.isInteger(batchSize)||batchSize<1||batchSize>20)throw new Error('TRANSLATION_BATCH_SIZE deve estar entre 1 e 20.');
if(!Number.isInteger(concurrency)||concurrency<1||concurrency>4)throw new Error('TRANSLATION_CONCURRENCY deve estar entre 1 e 4.');

const snapshot=JSON.parse(await readFile(cardsPath,'utf8'));
if(snapshot?.schemaVersion!==1||!Array.isArray(snapshot.cards))throw new Error('Snapshot de cartas inválido em public/data/cards.json.');
let previous={};
try{const saved=JSON.parse(await readFile(outputPath,'utf8'));if(saved?.schemaVersion===1&&saved.translations&&typeof saved.translations==='object')previous=saved.translations;}catch{}

const schema={type:'object',additionalProperties:false,required:['translations'],properties:{translations:{type:'array',items:{type:'object',additionalProperties:false,required:['id','name','text'],properties:{id:{type:'string'},name:{type:'string'},text:{type:'string'}}}}}};
const keywordGuide='Preserve exatamente em inglês as palavras-chave entre colchetes, como [Action], [Reaction], [Hidden], [Ganking], [Tank], [Shield], [Assault], [Deathknell], [Legion], [Mighty], [Deflect], [Flow], [Empower], [Burn], [Temporary], [Vision], [Add] e [Equip]. Traduza integralmente as explicações e o restante das regras. Use estes termos: Draw=Compre; Discard=Descarte; Unit=Unidade; Spell=Magia; Gear=Equipamento; Legend=Lenda; Battlefield=Campo de batalha; Rune=Runa; Ready=Pronto; Exhaust=Esgotar; Recycle=Reciclar; Buff=Aprimorar; Might=Força; Main Deck=Deck Principal; Rune Deck=Deck de Runas; Trash=Lixo; Kill=Matar; Recall=Recuperar; Token Unit=Ficha de Unidade. Preserve exatamente os símbolos :rb_...:, números, nomes próprios e nomes de domínios. Traduza nomes genéricos de cartas e subtítulos depois de hífen ou vírgula, mas preserve nomes próprios. Para regras vazias, use [SEM TEXTO].';
function cardInput(card){return {id:card.riftbound_id,name:card.name,kind:card.classification?.type||'',rules:card.text?.plain||''};}
function symbols(text){return (text.match(/:rb_[a-z0-9_]+:/g)||[]).sort().join('|');}
function validate(items, requested){const byId=new Map(requested.map(card=>[card.id,card]));const result={};for(const item of items||[]){const original=byId.get(item?.id);if(!original||typeof item.name!=='string'||typeof item.text!=='string'||!item.name.trim())throw new Error('A API devolveu uma tradução inválida.');const text=item.text.trim()||(original.rules?'':'[SEM TEXTO]');if(symbols(original.rules)!==symbols(text))throw new Error(`A tradução de ${item.id} alterou símbolos :rb_...:.`);result[item.id]={name:item.name.trim(),text,source:original.rules,updatedAt:new Date().toISOString(),provider:'openai'};}if(Object.keys(result).length!==requested.length)throw new Error('A API devolveu '+Object.keys(result).length+' de '+requested.length+' cartas do lote.');return result;}
async function translate(batch){const body={model,store:false,instructions:'Você é um tradutor profissional de cartas de Riftbound. Traduza para pt-BR, sem explicar nem resumir. Preserve a estrutura e todas as regras. '+keywordGuide,input:'Devolva JSON com uma entrada por carta: '+JSON.stringify(batch),text:{format:{type:'json_schema',name:'riftbound_ptbr_translations',strict:true,schema}},max_output_tokens:12000};let lastError;for(let attempt=1;attempt<=3;attempt++){try{const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!response.ok)throw new Error(`OpenAI HTTP ${response.status}: ${(await response.text()).slice(0,300)}`);const data=await response.json();const outputText=data.output_text||data.output?.flatMap(item=>item.content||[]).find(item=>item.type==='output_text')?.text;if(typeof outputText!=='string')throw new Error('A OpenAI não retornou texto de tradução.');return validate(JSON.parse(outputText).translations,batch);}catch(error){lastError=error;if(attempt<3)await new Promise(done=>setTimeout(done,attempt*1500));}}throw lastError;}
async function writeSnapshot(translations){const output={schemaVersion:1,generatedAt:new Date().toISOString(),source:'OpenAI Responses API',model,total:Object.keys(translations).length,translations};const temp=`${outputPath}.tmp`;await writeFile(temp,JSON.stringify(output,null,2)+'\n','utf8');await rename(temp,outputPath);}
async function writeProgress(progress){const temp=`${progressPath}.tmp`;await writeFile(temp,JSON.stringify({schemaVersion:1,updatedAt:new Date().toISOString(),model,...progress},null,2)+'\n','utf8');await rename(temp,progressPath);}

const cardsById=new Map();
for(const rawCard of snapshot.cards){
  const card=cardInput(rawCard);
  const saved=cardsById.get(card.id);
  if(saved&&saved.rules!==card.rules)throw new Error(`O catálogo contém regras conflitantes para ${card.id}.`);
  if(!saved)cardsById.set(card.id,card);
}
const cards=[...cardsById.values()];
const pending=cards.filter(card=>!previous[card.id]||previous[card.id].source!==card.rules);
const groups=new Map();
for(const card of pending){
  const key=`${card.name}\u0000${card.rules}`;
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(card);
}
const pendingGroups=[...groups.values()];
const batchCount=Math.ceil(pendingGroups.length/batchSize);
const batches=[];
for(let index=0;index<pendingGroups.length;index+=batchSize)batches.push(pendingGroups.slice(index,index+batchSize));
const waveCount=Math.ceil(batches.length/concurrency);
console.log(`${pending.length} de ${cards.length} IDs aguardam tradução em ${pendingGroups.length} textos únicos (${model}, concorrência ${concurrency}).`);
try{
  for(let waveIndex=0;waveIndex<batches.length;waveIndex+=concurrency){
    const wave=batches.slice(waveIndex,waveIndex+concurrency);
    const currentWave=Math.floor(waveIndex/concurrency)+1;
    const requests=wave.map(groupBatch=>groupBatch.map(group=>group[0]));
    await writeProgress({status:'processing',completed:Object.keys(previous).length,total:cards.length,pending:Math.max(0,cards.length-Object.keys(previous).length),wave:{current:currentWave,count:waveCount,batches:requests.map((batch,offset)=>({current:waveIndex+offset+1,count:batchCount,size:batch.length,cards:batch.map(card=>card.name)}))}});
    const results=await Promise.all(requests.map(batch=>translate(batch)));
    for(let waveOffset=0;waveOffset<wave.length;waveOffset++){
      const groupBatch=wave[waveOffset];
      const translated=results[waveOffset];
      for(const group of groupBatch){
        const representative=translated[group[0].id];
        for(const card of group)previous[card.id]={...representative,source:card.rules};
      }
    }
    await writeSnapshot(previous);
    await writeProgress({status:'processing',completed:Object.keys(previous).length,total:cards.length,pending:Math.max(0,cards.length-Object.keys(previous).length),wave:null});
    console.log(`Etapa ${currentWave}/${waveCount} concluída (${Math.min(waveIndex+wave.length,batchCount)}/${batchCount} lotes); ${Object.keys(previous).length}/${cards.length} IDs traduzidos.`);
  }
  await writeSnapshot(previous);
  await writeProgress({status:'complete',completed:Object.keys(previous).length,total:cards.length,pending:0,wave:null});
  console.log(`Concluído: ${Object.keys(previous).length} traduções em public/data/translations.pt-BR.json.`);
}catch(error){
  await writeProgress({status:'error',completed:Object.keys(previous).length,total:cards.length,pending:Math.max(0,cards.length-Object.keys(previous).length),wave:null,error:error instanceof Error?error.message:String(error)});
  throw error;
}
