let totalParticipants = localStorage.getItem("totalParticipants") || 0;
let prakritiChart = null;
let dashboardChart = null;
let deferredInstallPrompt = null;
let photoAnalysisResult = null;

const questions = [
{
q:"1. आपकी शरीर संरचना कैसी है?",
options:[
["दुबली-पतली","vata"],
["मध्यम","pitta"],
["भारी/मजबूत","kapha"]
]
},
{
q:"2. आपकी त्वचा कैसी है?",
options:[
["शुष्क","vata"],
["गर्म","pitta"],
["चिकनी","kapha"]
]
},
{
q:"3. आपकी भूख कैसी है?",
options:[
["अनियमित","vata"],
["तेज","pitta"],
["सामान्य","kapha"]
]
},
{
q:"4. आपकी पाचन शक्ति कैसी है?",
options:[
["कभी ठीक कभी खराब","vata"],
["बहुत अच्छी","pitta"],
["धीमी","kapha"]
]
},
{
q:"5. आपकी नींद कैसी है?",
options:[
["हल्की","vata"],
["मध्यम","pitta"],
["गहरी","kapha"]
]
},
{
q:"6. स्मरण शक्ति कैसी है?",
options:[
["जल्दी सीखता जल्दी भूलता","vata"],
["अच्छी","pitta"],
["धीरे सीखता लंबे समय तक याद","kapha"]
]
},
{
q:"7. स्वभाव कैसा है?",
options:[
["चंचल","vata"],
["नेतृत्वकारी","pitta"],
["शांत","kapha"]
]
},
{
q:"8. कौन सा मौसम कम सहन होता है?",
options:[
["ठंड","vata"],
["गर्मी","pitta"],
["नमी","kapha"]
]
},
{
q:"9. कार्य शैली कैसी है?",
options:[
["जल्दी शुरू जल्दी बदलता","vata"],
["योजनाबद्ध","pitta"],
["धीरे लेकिन निरंतर","kapha"]
]
},
{
q:"10. ऊर्जा स्तर कैसा है?",
options:[
["अस्थिर","vata"],
["स्थिर","pitta"],
["धीमा लेकिन टिकाऊ","kapha"]
]
},

{
q:"11. आपको सामान्यतः क्या अनुभव होता है?",
options:[
["हाथ-पैर ठंडे","vata"],
["अधिक गर्मी","pitta"],
["भारीपन","kapha"]
]
},
{
q:"12. आपको कौन सी समस्या रहती है?",
options:[
["गैस/कब्ज","vata"],
["अम्लपित्त","pitta"],
["सुस्ती","kapha"]
]
},
{
q:"13. मानसिक स्थिति कैसी रहती है?",
options:[
["चिंता","vata"],
["क्रोध","pitta"],
["संतोष","kapha"]
]
},
{
q:"14. नींद से संबंधित अनुभव?",
options:[
["बार-बार जागना","vata"],
["सपने अधिक","pitta"],
["अधिक सोना","kapha"]
]
},
{
q:"15. वर्तमान स्वास्थ्य समस्या?",
options:[
["जोड़ों का दर्द","vata"],
["त्वचा/अम्लपित्त","pitta"],
["मोटापा/एलर्जी","kapha"]
]
}

];

const container = document.getElementById("questions");

questions.forEach((item,index)=>{

let html = `<div class="question">

<h3>${item.q}</h3>`;

item.options.forEach(opt=>{

html += ` <label> <input type="radio" name="q${index}" value="${opt[1]}">
<span>${opt[0]}</span></label><br>`;

});

html += "</div>";

container.innerHTML += html;

});

function calculateResult(){

let vata = 0;
let pitta = 0;
let kapha = 0;

questions.forEach((q,index)=>{

let selected =
document.querySelector(
`input[name="q${index}"]:checked`
);

if(selected){

if(selected.value==="vata") vata++;
if(selected.value==="pitta") pitta++;
if(selected.value==="kapha") kapha++;

}

});

let total = vata + pitta + kapha;
if(total < 15){
alert("कृपया सभी 15 प्रश्नों के उत्तर चुनें");
return;
}

let vataPercent = Math.round((vata / total) * 100);
let pittaPercent = Math.round((pitta / total) * 100);
let kaphaPercent = Math.round((kapha / total) * 100);

let prakriti = "";
let advice = "";

if(vata > pitta && vata > kapha){
prakriti = "वातज प्रकृति";
}
else if(pitta > vata && pitta > kapha){
prakriti = "पित्तज प्रकृति";
}
else if(kapha > vata && kapha > pitta){
prakriti = "कफज प्रकृति";
}
else{
prakriti = "मिश्रित प्रकृति";
}
if(prakriti === "वातज प्रकृति"){

advice = `

<h3>वातज प्रकृति</h3>

<b>प्रमुख लक्षण:</b><br>
दुबला शरीर, शुष्क त्वचा, अनियमित भूख, शीघ्र थकान, चिंता की प्रवृत्ति।<br><br>

<b>आहार सलाह:</b><br>
• गर्म एवं ताजा भोजन लें।<br>
• घी, तिल का तेल, दूध, खिचड़ी, मूंग दाल उपयोगी।<br>
• ठंडे पेय, सूखे खाद्य पदार्थ एवं उपवास से बचें।<br><br>

<b>विहार:</b><br>
• नियमित दिनचर्या रखें।<br>
• पर्याप्त नींद लें।<br>
• अत्यधिक यात्रा एवं जागरण से बचें।<br><br>

<b>योग एवं प्राणायाम:</b><br>
• अनुलोम-विलोम<br>
• नाड़ी शोधन<br>
• शवासन<br>
• मकरासन<br><br>

<b>विशेष सावधानी:</b><br>
कब्ज, गैस, जोड़ों का दर्द एवं अनिद्रा की संभावना अधिक रहती है।
`;

}
else if(prakriti === "पित्तज प्रकृति"){

advice = `

<h3>पित्तज प्रकृति</h3>

<b>प्रमुख लक्षण:</b><br>
मध्यम शरीर, तीव्र भूख, अधिक पसीना, गर्मी असहनीय, क्रोध की प्रवृत्ति।<br><br>

<b>आहार सलाह:</b><br>
• शीतल एवं मधुर आहार लें।<br>
• नारियल पानी, आँवला, खीरा, तरबूज उपयोगी।<br>
• तीखा, खट्टा एवं तला भोजन कम लें।<br><br>

<b>विहार:</b><br>
• धूप एवं अत्यधिक गर्मी से बचें।<br>
• मानसिक तनाव कम रखें।<br><br>

<b>योग एवं प्राणायाम:</b><br>
• शीतली<br>
• शीतकारी<br>
• भ्रामरी<br>
• योग निद्रा<br><br>

<b>विशेष सावधानी:</b><br>
अम्लपित्त, त्वचा रोग एवं चिड़चिड़ापन की संभावना रहती है।
`;

}
else if(prakriti === "कफज प्रकृति"){

advice = `

<h3>कफज प्रकृति</h3>

<b>प्रमुख लक्षण:</b><br>
मजबूत शरीर, चिकनी त्वचा, शांत स्वभाव, गहरी नींद, वजन बढ़ने की प्रवृत्ति।<br><br>

<b>आहार सलाह:</b><br>
• हल्का एवं सुपाच्य भोजन लें।<br>
• शहद, अदरक, लहसुन, जौ उपयोगी।<br>
• मिठाई, दही एवं अधिक तैलीय भोजन कम लें।<br><br>

<b>विहार:</b><br>
• नियमित व्यायाम करें।<br>
• आलस्य एवं दिन में सोने से बचें।<br><br>

<b>योग एवं प्राणायाम:</b><br>
• सूर्य नमस्कार<br>
• कपालभाति<br>
• भस्त्रिका<br>
• तेज चाल से भ्रमण<br><br>

<b>विशेष सावधानी:</b><br>
मोटापा, मधुमेह, एलर्जी एवं श्वास संबंधी विकारों की संभावना रहती है।
`;

}
else{

advice = `

<h3>मिश्रित प्रकृति</h3>

<b>विश्लेषण:</b><br>
आपकी प्रकृति में दो या अधिक दोषों का संयुक्त प्रभाव पाया गया है।<br><br>

<b>आहार:</b><br>
• संतुलित एवं ताजा भोजन लें।<br>
• अत्यधिक तला, तीखा एवं भारी भोजन कम लें।<br><br>

<b>योग:</b><br>
• अनुलोम-विलोम<br>
• भ्रामरी<br>
• सूर्य नमस्कार<br><br>

<b>विशेष सलाह:</b><br>
ऋतु, आयु एवं वर्तमान स्वास्थ्य स्थिति के अनुसार चिकित्सकीय परामर्श लें।
`;

}


document.getElementById("vataScore").innerText =
vataPercent;

document.getElementById("pittaScore").innerText =
pittaPercent;

document.getElementById("kaphaScore").innerText =
kaphaPercent;

document.getElementById("prakritiName").innerText =
prakriti;
let reportCard =
document.getElementById("resultSection");

reportCard.classList.remove(
"vata-theme",
"pitta-theme",
"kapha-theme",
"mixed-theme"
);

if(prakriti === "वातज प्रकृति"){
reportCard.classList.add("vata-theme");
}
else if(prakriti === "पित्तज प्रकृति"){
reportCard.classList.add("pitta-theme");
}
else if(prakriti === "कफज प्रकृति"){
reportCard.classList.add("kapha-theme");
}
else{
reportCard.classList.add("mixed-theme");
}

document.getElementById("prakritiConclusion").innerText =
"यह परीक्षण आपकी प्रमुख आयुर्वेदिक प्रकृति " +
prakriti +
" को दर्शाता है।";

document.getElementById("prakritiAdvice").innerHTML =
advice;

document.getElementById("reportName").innerText =
document.getElementById("name").value;

document.getElementById("reportAge").innerText =
document.getElementById("age").value;

document.getElementById("reportGender").innerText =
document.getElementById("gender").value;

document.getElementById("reportMobile").innerText =
document.getElementById("mobile").value;

document.getElementById("reportOpdNo").innerText =
document.getElementById("opdNo").value;

document.getElementById("reportMobile").innerText =
document.getElementById("mobile").value;

document.getElementById("reportCity").innerText =
document.getElementById("city").value;

document.getElementById("reportDistrict").innerText =
document.getElementById("district").value;

document.getElementById("reportHospital").innerText =
document.getElementById("hospital").value;

document.getElementById("reportDoctor").innerText =
document.getElementById("doctor").value;

document.getElementById("reportHospital").innerText =
document.getElementById("hospital").value;

document.getElementById("reportDoctor").innerText =
document.getElementById("doctor").value;
document.getElementById("reportPhoto").src =
document.getElementById("photoPreview").src;

document.getElementById("reportPhoto").style.display =
"block";
let now = new Date();

let reportNo =
"PRK-" +
now.getFullYear() +
(now.getMonth()+1).toString().padStart(2,"0") +
now.getDate().toString().padStart(2,"0") +
"-" +
Math.floor(Math.random()*9000 + 1000);

document.getElementById("reportNo").innerText = reportNo;


document.getElementById("reportDate").innerText =
now.toLocaleDateString("hi-IN");

document.getElementById("reportTime").innerText =
now.toLocaleTimeString("hi-IN");

totalParticipants++;

localStorage.setItem(
"totalParticipants",
totalParticipants
);
let participantData = {

reportNo: reportNo,
date: document.getElementById("reportDate").innerText,
time: document.getElementById("reportTime").innerText,
savedAt: now.toISOString(),
name: document.getElementById("name").value,
age: document.getElementById("age").value,
gender: document.getElementById("gender").value,
mobile: document.getElementById("mobile").value,
opdNo: document.getElementById("opdNo").value,
city: document.getElementById("city").value,
district: document.getElementById("district").value,
hospital: document.getElementById("hospital").value,
doctor: document.getElementById("doctor").value,

vata: vataPercent,
pitta: pittaPercent,
kapha: kaphaPercent,

prakriti: prakriti

};

let allData =
JSON.parse(localStorage.getItem("prakritiData")) || [];

allData.push(participantData);

localStorage.setItem(
"prakritiData",
JSON.stringify(allData)
);

document.getElementById("participantCount").innerText =
totalParticipants;

updateDashboard();

console.log("Chart Start");

if(window.Chart){
const ctx =
document.getElementById("prakritiChart")
.getContext("2d");

if(prakritiChart){
prakritiChart.destroy();
}

prakritiChart = new Chart(ctx, {
type: "pie",
data: {
labels: ["वात", "पित्त", "कफ"],
datasets: [{
data: [
vataPercent,
pittaPercent,
kaphaPercent
],
backgroundColor: [
"#2196f3",
"#ff5722",
"#4caf50"
]
}]
},
options: {
responsive: false
}
}); 
}

document.getElementById("resultSection").style.display =
"block";
}
["photoFront","photoBack","photoGallery"].forEach(function(id){

document.getElementById(id).addEventListener("change", function(){

const file = this.files[0];

if(file){

const reader = new FileReader();

reader.onload = function(e){

document.getElementById("photoPreview").src =
e.target.result;

document.getElementById("photoPreview").style.display =
"block";

};

reader.readAsDataURL(file);

}

});

});

function downloadExcel() {

if(!window.XLSX){
alert("Excel export library is not available offline.");
return;
}

let data =
JSON.parse(localStorage.getItem("prakritiData")) || [];

if(data.length === 0){
alert("कोई डेटा उपलब्ध नहीं है");
return;
}

let worksheet = XLSX.utils.json_to_sheet(data);

let workbook = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
workbook,
worksheet,
"Prakriti Reports"
);

XLSX.writeFile(
workbook,
"Prakriti_Master_Report.xlsx"
);

}

function getStoredPrakritiData(){

try{
let data =
JSON.parse(localStorage.getItem("prakritiData")) || [];

return Array.isArray(data) ? data : [];
}
catch(error){
return [];
}

}

function setDashboardText(id,value){

let element =
document.getElementById(id);

if(element){
element.innerText = value;
}

}

function getDominantPrakriti(data){

let scores = {
vata: Number(data.vata) || 0,
pitta: Number(data.pitta) || 0,
kapha: Number(data.kapha) || 0
};

let highest =
Math.max(scores.vata,scores.pitta,scores.kapha);

let winners =
Object.keys(scores).filter(function(key){
return scores[key] === highest;
});

return winners.length === 1 ? winners[0] : "mixed";

}

function isInspectionFromToday(item){

let today =
new Date();

if(item.savedAt){
let savedDate =
new Date(item.savedAt);

return savedDate.toDateString() === today.toDateString();
}

return item.date === today.toLocaleDateString("hi-IN");

}

function updateDashboard(){

let data =
getStoredPrakritiData();

let summary = {
vata: 0,
pitta: 0,
kapha: 0,
mixed: 0
};

let totals = {
vata: 0,
pitta: 0,
kapha: 0
};

let districts = new Set();
let hospitals = new Set();
let todayCount = 0;

data.forEach(function(item){

let prakritiType =
getDominantPrakriti(item);

summary[prakritiType]++;

totals.vata += Number(item.vata) || 0;
totals.pitta += Number(item.pitta) || 0;
totals.kapha += Number(item.kapha) || 0;

if(item.district){
districts.add(item.district.trim());
}

if(item.hospital){
hospitals.add(item.hospital.trim());
}

if(isInspectionFromToday(item)){
todayCount++;
}

});

let total =
data.length || Number(localStorage.getItem("totalParticipants")) || 0;

setDashboardText("participantCount",total);
setDashboardText("dashboardTotal",total);
setDashboardText("dashboardToday",todayCount);
setDashboardText("dashboardVata",summary.vata);
setDashboardText("dashboardPitta",summary.pitta);
setDashboardText("dashboardKapha",summary.kapha);
setDashboardText("dashboardMixed",summary.mixed);
setDashboardText("dashboardDistricts",districts.size);
setDashboardText("dashboardHospitals",hospitals.size);

let latest =
data[data.length - 1];

if(latest){
setDashboardText("latestReportNo",latest.reportNo || "-");
setDashboardText("latestName",latest.name || "-");
setDashboardText("latestPrakriti",latest.prakriti || "-");
setDashboardText("latestDate",latest.time ? latest.date + " " + latest.time : latest.date || "-");
setDashboardText("dashboardUpdated",latest.time ? latest.date + " " + latest.time : latest.date || "-");
}
else{
setDashboardText("latestReportNo","-");
setDashboardText("latestName","-");
setDashboardText("latestPrakriti","-");
setDashboardText("latestDate","-");
setDashboardText("dashboardUpdated","-");
}

let divisor =
data.length || 1;

let averageScores = [
Math.round(totals.vata / divisor),
Math.round(totals.pitta / divisor),
Math.round(totals.kapha / divisor)
];

renderInspectionHistory();
renderRecentInspections();

let chartCanvas =
document.getElementById("dashboardChart");

if(!chartCanvas || !window.Chart){
return;
}

let ctx =
chartCanvas.getContext("2d");

if(dashboardChart){
dashboardChart.destroy();
}

dashboardChart = new Chart(ctx,{
type:"bar",
data:{
labels:["Vata","Pitta","Kapha"],
datasets:[{
data:averageScores,
backgroundColor:["#2196f3","#ff5722","#4caf50"],
borderRadius:6
}]
},
options:{
responsive:false,
plugins:{
legend:{
display:false
}
},
scales:{
y:{
beginAtZero:true,
max:100,
ticks:{
callback:function(value){
return value + "%";
}
}
}
}
}
});

}


function escapeHtml(value){

return String(value || "")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

}

function getInspectionDateText(item){

return item.time ? item.date + " " + item.time : item.date || "-";

}

function renderRecentInspections(){

let recentList =
document.getElementById("recentInspectionList");

if(!recentList){
return;
}

let data =
getStoredPrakritiData();

if(data.length === 0){
recentList.innerHTML =
"No inspections saved yet.";
return;
}

recentList.innerHTML =
data.slice().reverse().slice(0,5).map(function(item){

return `
<div class="recent-item">
<strong>${escapeHtml(item.name || "Unnamed")}</strong>
<span>${escapeHtml(item.prakriti || "-")}</span>
<small>${escapeHtml(getInspectionDateText(item))}</small>
</div>`;

}).join("");

}

function renderInspectionHistory(){

let historyList =
document.getElementById("historyList");

if(!historyList){
return;
}

let data =
getStoredPrakritiData();

if(data.length === 0){
historyList.innerHTML =
`<tr><td colspan="8" class="empty-history">No previous inspections saved.</td></tr>`;
return;
}

let searchValue =
(document.getElementById("historySearch")?.value || "").trim().toLowerCase();

let filterValue =
document.getElementById("historyFilter")?.value || "all";

let filteredData =
data.filter(function(item){

let prakritiType =
getDominantPrakriti(item);

let searchable =
[
item.reportNo,
item.opdNo,
item.name,
item.mobile,
item.city,
item.district,
item.hospital,
item.prakriti,
getInspectionDateText(item)
].join(" ").toLowerCase();

let matchesSearch =
!searchValue || searchable.includes(searchValue);

let matchesFilter =
filterValue === "all" || prakritiType === filterValue;

return matchesSearch && matchesFilter;

});

if(filteredData.length === 0){
historyList.innerHTML =
`<tr><td colspan="8" class="empty-history">No matching inspections found.</td></tr>`;
return;
}

historyList.innerHTML =
filteredData.slice().reverse().map(function(item){

let scores =
`V ${Number(item.vata) || 0}% / P ${Number(item.pitta) || 0}% / K ${Number(item.kapha) || 0}%`;

let dateText =
getInspectionDateText(item);

return `
<tr>
<td>${escapeHtml(item.reportNo || "-")}</td>
<td>${escapeHtml(item.opdNo || "-")}</td>
<td>${escapeHtml(dateText)}</td>
<td>${escapeHtml(item.name || "-")}</td>
<td>${escapeHtml(item.mobile || "-")}</td>
<td>${escapeHtml(item.district || "-")}</td>
<td>${escapeHtml(item.prakriti || "-")}</td>
<td>${escapeHtml(scores)}</td>
</tr>`;

}).join("");

}

function switchTab(tabName){

document.querySelectorAll(".tab-panel").forEach(function(panel){
panel.classList.remove("active");
});

document.querySelectorAll(".tab-button").forEach(function(button){
button.classList.toggle("active",button.dataset.tab === tabName);
});

let target =
document.getElementById(tabName + "Tab");

if(target){
target.classList.add("active");
}

if(tabName === "history"){
renderInspectionHistory();
}

localStorage.setItem("activePortalTab",tabName);

}

function applyTheme(themeName){

let themes = [
"theme-green",
"theme-blue",
"theme-maroon",
"theme-dark"
];

document.body.classList.remove.apply(document.body.classList,themes);

if(themeName && themeName !== "green"){
document.body.classList.add("theme-" + themeName);
}

document.querySelectorAll(".theme-option").forEach(function(button){
button.classList.toggle("active",button.dataset.theme === themeName);
});

localStorage.setItem("portalTheme",themeName || "green");

}

async function readAssetAsText(path){

let response =
await fetch(path);

if(!response.ok){
throw new Error(path + " could not be loaded");
}

return response.text();

}

async function readAssetAsDataUrl(path){

let response =
await fetch(path);

if(!response.ok){
throw new Error(path + " could not be loaded");
}

let blob =
await response.blob();

return new Promise(function(resolve,reject){

let reader =
new FileReader();

reader.onload =
function(){
resolve(reader.result);
};

reader.onerror =
function(){
reject(reader.error);
};

reader.readAsDataURL(blob);

});

}

async function downloadOfflineSite(){

try{

let html =
document.documentElement.outerHTML;

let css =
await readAssetAsText("style.css");

let appScript =
await readAssetAsText("app.js");

let logoData =
await readAssetAsDataUrl("logo.jpg");

html = html
.replace(/<link rel="stylesheet" href="style\.css">/i,`<style>${css}</style>`)
.replace(/<link rel="manifest" href="manifest\.webmanifest">\s*/i,"")
.replace(/<script src="app\.js"><\/script>/i,`<script>${appScript}<\/script>`)
.replace(/src="logo\.jpg"/g,`src="${logoData}"`);

let externalScripts =
[
`https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`,
`https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js`,
`https://cdn.jsdelivr.net/npm/chart.js`,
`https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`
];

externalScripts.forEach(function(src){
html = html.replace(new RegExp(`<script src="${src.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}"><\\/script>\\s*`,"i"),"");
});

let blob =
new Blob(["<!DOCTYPE html>\n" + html],{
type:"text/html"
});

let link =
document.createElement("a");

link.href =
URL.createObjectURL(blob);

link.download =
"AyurPrakritiPortal-offline.html";

document.body.appendChild(link);
link.click();
link.remove();
URL.revokeObjectURL(link.href);

}
catch(error){
alert("Offline copy could not be created from this browser. Open the portal through a local server and try again.");
}

}

function downloadDataBackup(){

let data =
getStoredPrakritiData();

let backup = {
exportedAt: new Date().toISOString(),
totalParticipants: Number(localStorage.getItem("totalParticipants")) || data.length,
prakritiData: data
};

let blob =
new Blob([JSON.stringify(backup,null,2)],{
type:"application/json"
});

let link =
document.createElement("a");

link.href =
URL.createObjectURL(blob);

link.download =
"Prakriti_Data_Backup.json";

document.body.appendChild(link);
link.click();
link.remove();
URL.revokeObjectURL(link.href);

}

function clearInspectionHistory(){

let confirmed =
confirm("Clear all saved inspection history from this browser?");

if(!confirmed){
return;
}

localStorage.removeItem("prakritiData");
localStorage.setItem("totalParticipants","0");
totalParticipants = 0;
updateDashboard();
alert("Inspection history cleared.");

}

function updateInstallButton(enabled){

let installButton =
document.getElementById("installAppButton");

if(!installButton){
return;
}

installButton.disabled =
!enabled;

installButton.innerText =
enabled ? "Install App" : "Install Unavailable";

}

async function installPortalApp(){

if(!deferredInstallPrompt){
alert("Install is available only after opening this portal from localhost or HTTPS in a supported browser.");
return;
}

deferredInstallPrompt.prompt();
await deferredInstallPrompt.userChoice;
deferredInstallPrompt = null;
updateInstallButton(false);

}

function registerServiceWorker(){

if("serviceWorker" in navigator && window.location.protocol !== "file:"){
navigator.serviceWorker.register("sw.js").catch(function(){
});
}

}

window.addEventListener("beforeinstallprompt",function(event){

event.preventDefault();
deferredInstallPrompt = event;
updateInstallButton(true);

});

window.addEventListener("appinstalled",function(){

deferredInstallPrompt = null;
updateInstallButton(false);

});

function initializeAppView(){

applyTheme(localStorage.getItem("portalTheme") || "green");

let savedTab =
localStorage.getItem("activePortalTab") || "home";

switchTab(savedTab);
updateInstallButton(false);
registerServiceWorker();

}

updateDashboard();
initializeAppView();
function openPhotoOption(){

let option =
document.getElementById("photoOption").value;



if(option === "back"){
document.getElementById("photoBack").click();
}

if(option === "gallery"){
document.getElementById("photoGallery").click();
}

}
async function startCamera(){

const stream =
await navigator.mediaDevices.getUserMedia({
video:true
});

document.getElementById("camera").style.display = "block";

document.getElementById("camera").srcObject =
stream;

}

function capturePhoto(){

const video =
document.getElementById("camera");

const canvas =
document.getElementById("canvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const ctx = canvas.getContext("2d");

ctx.drawImage(video,0,0);

const imageData =
canvas.toDataURL("image/png");

document.getElementById("photoPreview").src =
imageData;

document.getElementById("photoPreview").style.display =
"block";

document.getElementById("reportPhoto").src =
imageData;

}
async function downloadPDF(){

if(!window.jspdf || !window.html2canvas){
alert("PDF export library is not available offline.");
return;
}

const { jsPDF } = window.jspdf;

const report =
document.getElementById("resultSection");

const canvas =
await html2canvas(report,{
scale:2
});

const imgData =
canvas.toDataURL("image/png");

const pdf =
new jsPDF("p","mm","a4");

const pdfWidth =
pdf.internal.pageSize.getWidth();

const pdfHeight =
(canvas.height * pdfWidth) / canvas.width;

pdf.addImage(
imgData,
"PNG",
0,
0,
pdfWidth,
pdfHeight
);

pdf.save("Prakriti_Report.pdf");

}
document.getElementById("headerHospital").addEventListener("input", function(){

document.getElementById("headerHospitalName").innerText =
this.value || "राजकीय आयुर्वेद औषधालय / आयुष्मान आरोग्य मंदिर";

});
document.getElementById("extraHospital").addEventListener("input", function(){

document.getElementById("extraHospitalName").innerHTML =
this.value ? "<br>" + this.value : "";

});
