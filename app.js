const GRADES = [6,7,8,9,10,11];
const STORAGE_KEY = "schoolTermTestAnalysis.v1";
const COLORS = {total:"#2868b2",below:"#e58a24",above:"#25845b",pass:"#8b5ac2",absent:"#c63746"};
let savedReports = loadSaved();
let deferredInstallPrompt = null;
const $ = id => document.getElementById(id);

function gradeTemplate(){return GRADES.map(grade=>({grade,total:0,below:0,above:0,absent:0}));}
function loadSaved(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch{return [];}}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(savedReports));$("savedStatus").textContent="Browser එකේ සුරකින ලදී";renderSavedList();}catch(e){$("savedStatus").textContent="ගබඩා කිරීම අසාර්ථකයි";alert("Browser storage පිරී තිබිය හැක. Backup export කර අනවශ්‍ය දත්ත ඉවත් කරන්න.");}}
function makeGradeInputs(){ $("gradeInputs").innerHTML=GRADES.map(g=>`<tr data-grade="${g}"><td>ශ්‍රේණිය ${String(g).padStart(2,"0")}</td><td><input type="number" min="0" step="1" data-field="total" aria-label="ශ්‍රේණිය ${g} මුළු සිසුන්" value="0"></td><td><input type="number" min="0" step="1" data-field="below" aria-label="ශ්‍රේණිය ${g} ලකුණු 40ට අඩු" value="0"></td><td><input type="number" min="0" step="1" data-field="above" aria-label="ශ්‍රේණිය ${g} ලකුණු 40 හෝ වැඩි" value="0"></td><td><input type="number" min="0" step="1" data-field="absent" aria-label="ශ්‍රේණිය ${g} නොපැමිණි" value="0"></td></tr>`).join("");}
function getFormData(){return {id:null,school:$("schoolName").value.trim(),subject:$("subjectName").value.trim(),term:$("term").value,year:Number($("academicYear").value)||new Date().getFullYear(),grades:GRADES.map(g=>{const tr=$(`gradeInputs`).querySelector(`[data-grade="${g}"]`);return {grade:g,total:Number(tr.querySelector('[data-field="total"]').value)||0,below:Number(tr.querySelector('[data-field="below"]').value)||0,above:Number(tr.querySelector('[data-field="above"]').value)||0,absent:Number(tr.querySelector('[data-field="absent"]').value)||0};})};}
function setFormData(d){$("schoolName").value=d.school||"";$("subjectName").value=d.subject||"";$("term").value=d.term||"දෙවන වාරය";$("academicYear").value=d.year||new Date().getFullYear();for(const g of GRADES){const row=(d.grades||[]).find(x=>Number(x.grade)===g)||{total:0,below:0,above:0,absent:0};const tr=$("gradeInputs").querySelector(`[data-grade="${g}"]`);for(const f of ["total","below","above","absent"])tr.querySelector(`[data-field="${f}"]`).value=Number(row[f])||0;}renderReport(d);}
function validate(d){if(!d.subject)return "කරුණාකර විෂය නම ඇතුළත් කරන්න.";if(!Number.isInteger(d.year)||d.year<2000||d.year>2100)return "නිවැරදි අධ්‍යයන වර්ෂයක් ඇතුළත් කරන්න.";for(const r of d.grades){for(const f of ["total","below","above","absent"]){if(!Number.isInteger(r[f])||r[f]<0)return `ශ්‍රේණිය ${r.grade}: සංඛ්‍යා 0 හෝ ධන පූර්ණ සංඛ්‍යා විය යුතුය.`;}if(r.below+r.above+r.absent!==r.total)return `ශ්‍රේණිය ${r.grade}: මුළු සිසුන් (${r.total}) = 40ට අඩු (${r.below}) + 40 හෝ වැඩි (${r.above}) + නොපැමිණි (${r.absent}) විය යුතුය.`;}return "";}
function passRate(r){const present=r.total-r.absent;return present>0?(r.above/present)*100:0;}
function fmt(n){return `${Number(n).toLocaleString("en-US",{maximumFractionDigits:1})}`;}
function pct(n){return `${n.toFixed(1)}%`;}
function totals(grades){return grades.reduce((a,r)=>({total:a.total+r.total,below:a.below+r.below,above:a.above+r.above,absent:a.absent+r.absent}),{total:0,below:0,above:0,absent:0});}
function renderReport(data=getFormData()){
 const titleData={...data,grades:data.grades||gradeTemplate()};
 $("reportSchool").textContent=data.school||"පාසලේ නම";
 $("reportMainTitle").textContent=`${data.term||"දෙවන වාරය"} පරීක්ෂණ ලකුණු විශ්ලේෂණය`;
 $("reportMeta").textContent=`විෂය: ${data.subject||"—"}  |  ශ්‍රේණි 06–11  |  වර්ෂය: ${data.year||new Date().getFullYear()}`;
 $("reportRows").innerHTML=GRADES.map(g=>{const r=titleData.grades.find(x=>Number(x.grade)===g)||{grade:g,total:0,below:0,above:0,absent:0};return `<tr><td>ශ්‍රේණිය ${String(g).padStart(2,"0")}</td><td>${fmt(r.total)}</td><td>${fmt(r.below)}</td><td>${fmt(r.above)}</td><td>${fmt(r.absent)}</td><td>${pct(passRate(r))}</td></tr>`;}).join("");
 const t=totals(titleData.grades);const overall=t.total-t.absent>0?t.above/(t.total-t.absent)*100:0;
 $("reportTotals").innerHTML=`<tr><td>එකතුව</td><td>${fmt(t.total)}</td><td>${fmt(t.below)}</td><td>${fmt(t.above)}</td><td>${fmt(t.absent)}</td><td>${pct(overall)}</td></tr>`;
 $("overallPass").textContent=pct(overall);$("overallPassCaption").textContent=`පැමිණි සිසුන් ${fmt(t.total-t.absent)} / මුළු සිසුන් ${fmt(t.total)}`;
 $("generatedDate").textContent=`සකස් කළ දිනය: ${new Date().toLocaleDateString("si-LK")}`;
 drawChart(titleData.grades);
}
function drawChart(grades){
 const canvas=$("resultsChart"),ctx=canvas.getContext("2d");const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);
 const left=70,right=24,top=30,bottom=72,plotW=w-left-right,plotH=h-top-bottom;
 const maxVal=Math.max(10,...grades.flatMap(r=>[r.total,r.below,r.above,r.absent,100]));const max=Math.ceil(maxVal/20)*20;const y=v=>top+plotH-(v/max)*plotH;
 ctx.font="17px 'Noto Sans Sinhala', sans-serif";ctx.textAlign="right";ctx.textBaseline="middle";
 for(let v=0;v<=max;v+=max/5){const yy=y(v);ctx.strokeStyle="#e6ebf2";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(w-right,yy);ctx.stroke();ctx.fillStyle="#65728a";ctx.fillText(v,left-12,yy);}
 ctx.strokeStyle="#aab6c7";ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left,top+plotH);ctx.lineTo(w-right,top+plotH);ctx.stroke();
 const series=[["total",COLORS.total],["below",COLORS.below],["above",COLORS.above],["pass",COLORS.pass],["absent",COLORS.absent]],groupW=plotW/6,barW=Math.min(24,groupW/7),gap=3;
 grades.forEach((r,i)=>{const center=left+groupW*(i+.5);const vals=[r.total,r.below,r.above,passRate(r),r.absent];const totalBars=series.length*barW+(series.length-1)*gap;let x=center-totalBars/2;series.forEach((s,j)=>{const val=vals[j];const yy=y(val),bh=Math.max(0,top+plotH-yy);ctx.fillStyle=s[1];ctx.fillRect(x,yy,barW,bh);if(bh>22){ctx.fillStyle="#fff";ctx.font="bold 12px sans-serif";ctx.textAlign="center";ctx.fillText(j===3?Math.round(val):val,x+barW/2,yy+Math.min(bh/2,16));}x+=barW+gap;});ctx.fillStyle="#24344d";ctx.font="bold 18px 'Noto Sans Sinhala', sans-serif";ctx.textAlign="center";ctx.fillText(`ශ්‍රේණිය ${String(r.grade).padStart(2,"0")}`,center,h-35);});
 ctx.save();ctx.translate(20,top+plotH/2);ctx.rotate(-Math.PI/2);ctx.textAlign="center";ctx.fillStyle="#536176";ctx.font="15px 'Noto Sans Sinhala', sans-serif";ctx.fillText("සිසුන් ගණන / ප්‍රතිශතය",0,0);ctx.restore();
}
function renderSavedList(){const el=$("savedList");if(!savedReports.length){el.innerHTML='<p class="empty-state">තවම විෂයයන් සුරැකී නැත.</p>';return;}el.innerHTML=savedReports.map(r=>`<div class="saved-item"><div><strong>${escapeHtml(r.subject||"නම් නොකළ විෂය")} — ${escapeHtml(r.term||"")}</strong><small>${escapeHtml(r.school||"පාසලේ නම")} • ${r.year} • ${new Date(r.updatedAt||Date.now()).toLocaleDateString("si-LK")}</small></div><div class="saved-item-actions"><button class="btn btn-ghost" data-action="load" data-id="${r.id}">විවෘත කරන්න</button><button class="btn btn-ghost" data-action="delete" data-id="${r.id}">මකන්න</button></div></div>`).join("");}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function saveCurrent(){const d=getFormData(),err=validate(d);$("validationMsg").textContent=err;if(err)return;const existing=savedReports.findIndex(r=>r.subject.toLowerCase()===d.subject.toLowerCase()&&r.term===d.term&&Number(r.year)===d.year&&r.school===d.school);d.id=existing>=0?savedReports[existing].id:(crypto.randomUUID?crypto.randomUUID():String(Date.now()));d.updatedAt=new Date().toISOString();if(existing>=0)savedReports[existing]=d;else savedReports.unshift(d);persist();renderReport(d);$("validationMsg").textContent="දත්ත සාර්ථකව සුරකින ලදී.";}
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}
function exportJson(){download(`school-marks-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({format:"school-term-test-analysis",version:1,exportedAt:new Date().toISOString(),reports:savedReports},null,2),"application/json");}
function exportCsv(){const rows=[["School","Subject","Term","Year","Grade","Total Students","Below 40","40 or Above","Absent","Pass Percentage"]];savedReports.forEach(r=>(r.grades||[]).forEach(g=>rows.push([r.school,r.subject,r.term,r.year,g.grade,g.total,g.below,g.above,g.absent,passRate(g).toFixed(1)])));const csv=rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");download("school-marks-data.csv","\\ufeff"+csv,"text/csv;charset=utf-8");}
function resetForm(){ $("schoolName").value="";$("subjectName").value="";$("term").value="දෙවන වාරය";$("academicYear").value=new Date().getFullYear();makeGradeInputs();$("validationMsg").textContent="";renderReport(getFormData());}
$("generateBtn").addEventListener("click",()=>{const d=getFormData(),err=validate(d);$("validationMsg").textContent=err;if(err)return;renderReport(d);$("validationMsg").textContent="ප්‍රස්ථාරය යාවත්කාලීන කරන ලදී.";});
$("saveBtn").addEventListener("click",saveCurrent);$("newBtn").addEventListener("click",resetForm);$("printBtn").addEventListener("click",()=>window.print());
$("exportJsonBtn").addEventListener("click",exportJson);$("exportCsvBtn").addEventListener("click",exportCsv);
$("downloadPngBtn").addEventListener("click",()=>{const a=document.createElement("a");a.download="marks-analysis-chart.png";a.href=$("resultsChart").toDataURL("image/png");a.click();});
$("savedList").addEventListener("click",e=>{const b=e.target.closest("button[data-action]");if(!b)return;const r=savedReports.find(x=>x.id===b.dataset.id);if(!r)return;if(b.dataset.action==="load"){setFormData(r);$("validationMsg").textContent="සුරැකි දත්ත විවෘත කරන ලදී.";}else if(confirm(`"${r.subject}" මකා දැමීමට අවශ්‍යද?`)){savedReports=savedReports.filter(x=>x.id!==r.id);persist();}});
$("importJsonInput").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const list=Array.isArray(parsed)?parsed:parsed.reports;if(!Array.isArray(list))throw new Error("invalid");const clean=list.filter(r=>r&&r.subject&&Array.isArray(r.grades)).map(r=>({...r,id:r.id||((crypto.randomUUID&&crypto.randomUUID())||String(Date.now()+Math.random())),updatedAt:r.updatedAt||new Date().toISOString()}));if(!confirm(`${clean.length} විෂය දත්ත import කරන්නද? එකම ID ඇති දත්ත යාවත්කාලීන වේ.`))return;const map=new Map(savedReports.map(r=>[r.id,r]));clean.forEach(r=>map.set(r.id,r));savedReports=[...map.values()];persist();alert("Backup import සාර්ථකයි.");}catch{alert("මෙම Backup JSON ගොනුව කියවිය නොහැක.");}finally{e.target.value="";}});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("installBtn").hidden=false;});
$("installBtn").addEventListener("click",async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("installBtn").hidden=true;});
window.addEventListener("appinstalled",()=>{$("installBtn").hidden=true;});
makeGradeInputs();renderSavedList();renderReport();
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
