import {readFile, rename, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {parseEnv} from 'node:util';

const root=resolve(import.meta.dirname,'..');
const cardsPath=resolve(root,'public/data/cards.json');
const translationsPath=resolve(root,'public/data/translations.pt-BR.json');
const progressPath=resolve(root,'public/data/translation-progress.json');
let localEnv={};
try{localEnv=parseEnv(await readFile(resolve(root,'.env'),'utf8'));}catch(error){if(error?.code!=='ENOENT')throw error;}
const setting=name=>localEnv[name]||process.env[name];
const apiKey=setting('OPENAI_API_KEY');
const model=setting('OPENAI_MODEL')||'gpt-5-mini';
const batchSize=Number(setting('TRANSLATION_NAME_BATCH_SIZE')||40);
const concurrency=Number(setting('TRANSLATION_CONCURRENCY')||3);
if(!apiKey)throw new Error('Defina OPENAI_API_KEY no arquivo .env.');
if(!Number.isInteger(batchSize)||batchSize<1||batchSize>50)throw new Error('TRANSLATION_NAME_BATCH_SIZE deve estar entre 1 e 50.');
if(!Number.isInteger(concurrency)||concurrency<1||concurrency>4)throw new Error('TRANSLATION_CONCURRENCY deve estar entre 1 e 4.');

const snapshot=JSON.parse(await readFile(cardsPath,'utf8'));
const file=JSON.parse(await readFile(translationsPath,'utf8'));
if(snapshot?.schemaVersion!==1||!Array.isArray(snapshot.cards))throw new Error('Snapshot de cartas inválido.');
if(file?.schemaVersion!==1||!file.translations||typeof file.translations!=='object')throw new Error('Arquivo de traduções inválido.');

const cardsById=new Map();
for(const card of snapshot.cards)if(!cardsById.has(card.riftbound_id))cardsById.set(card.riftbound_id,card);
const groups=new Map();
for(const [id,card] of cardsById){
  const saved=file.translations[id];
  if(!saved||saved.name!==card.name)continue;
  if(!groups.has(card.name))groups.set(card.name,[]);
  groups.get(card.name).push({id,name:card.name,type:card.classification?.type||''});
}
const pendingGroups=[...groups.values()];
const batches=[];
for(let index=0;index<pendingGroups.length;index+=batchSize)batches.push(pendingGroups.slice(index,index+batchSize));
const schema={type:'object',additionalProperties:false,required:['translations'],properties:{translations:{type:'array',items:{type:'object',additionalProperties:false,required:['id','name'],properties:{id:{type:'string'},name:{type:'string'}}}}}};

function validate(items,requested){
  const allowed=new Set(requested.map(card=>card.id));
  const result={};
  for(const item of items||[]){
    if(!allowed.has(item?.id)||typeof item.name!=='string'||!item.name.trim())throw new Error('A API devolveu um nome inválido.');
    result[item.id]=item.name.trim();
  }
  if(Object.keys(result).length!==requested.length)throw new Error(`A API devolveu ${Object.keys(result).length} de ${requested.length} nomes.`);
  return result;
}

async function translate(batch){
  const instructions='Traduza nomes de cartas de Riftbound para pt-BR. Traduza todas as palavras comuns em títulos genéricos e os subtítulos descritivos após hífen ou vírgula. Preserve somente nomes próprios de personagens, pessoas, lugares e artefatos que funcionem como nome próprio. Preserve apóstrofos, // e sufixos como (Alternate Art), traduzindo este sufixo para (Arte Alternativa). Exemplos: Arena Kingpin = Chefão da Arena; Against the Odds = Contra Todas as Probabilidades; Annie - Fiery = Annie - Flamejante; Fury Rune = Runa da Fúria; Gold // Buff = Ouro // Aprimoramento; Tibbers = Tibbers; Albus Ferros = Albus Ferros. Responda apenas no esquema solicitado.';
  const body={model,store:false,instructions,input:'Traduza uma entrada para cada carta: '+JSON.stringify(batch),text:{format:{type:'json_schema',name:'riftbound_ptbr_names',strict:true,schema}},max_output_tokens:6000};
  let lastError;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!response.ok)throw new Error(`OpenAI HTTP ${response.status}: ${(await response.text()).slice(0,300)}`);
      const data=await response.json();
      const outputText=data.output_text||data.output?.flatMap(item=>item.content||[]).find(item=>item.type==='output_text')?.text;
      if(typeof outputText!=='string')throw new Error('A OpenAI não retornou nomes traduzidos.');
      return validate(JSON.parse(outputText).translations,batch);
    }catch(error){lastError=error;if(attempt<3)await new Promise(done=>setTimeout(done,attempt*1500));}
  }
  throw lastError;
}

async function save(){
  file.generatedAt=new Date().toISOString();
  file.total=Object.keys(file.translations).length;
  const temporary=`${translationsPath}.tmp`;
  await writeFile(temporary,JSON.stringify(file,null,2)+'\n','utf8');
  await rename(temporary,translationsPath);
}

async function progress(data){
  const temporary=`${progressPath}.tmp`;
  await writeFile(temporary,JSON.stringify({schemaVersion:1,updatedAt:new Date().toISOString(),model,...data},null,2)+'\n','utf8');
  await rename(temporary,progressPath);
}

const waveCount=Math.ceil(batches.length/concurrency);
console.log(`${pendingGroups.length} nomes únicos precisam de revisão em ${batches.length} lotes.`);
try{
  for(let waveIndex=0;waveIndex<batches.length;waveIndex+=concurrency){
    const wave=batches.slice(waveIndex,waveIndex+concurrency);
    const requests=wave.map(groupBatch=>groupBatch.map(group=>group[0]));
    const currentWave=Math.floor(waveIndex/concurrency)+1;
    await progress({status:'processing-names',completed:waveIndex,total:batches.length,wave:{current:currentWave,count:waveCount}});
    const results=await Promise.all(requests.map(batch=>translate(batch)));
    for(let offset=0;offset<wave.length;offset++){
      const groupBatch=wave[offset];
      const translated=results[offset];
      for(const group of groupBatch){
        const translatedName=translated[group[0].id];
        for(const card of group)file.translations[card.id].name=translatedName;
      }
    }
    await save();
    console.log(`Revisão de nomes ${currentWave}/${waveCount} concluída.`);
  }
  await progress({status:'complete',completed:Object.keys(file.translations).length,total:Object.keys(file.translations).length,pending:0,wave:null});
}catch(error){
  await progress({status:'error',stage:'names',error:error instanceof Error?error.message:String(error)});
  throw error;
}
