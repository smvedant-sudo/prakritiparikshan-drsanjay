let totalParticipants = localStorage.getItem("totalParticipants") || 0;
let prakritiChart = null;
let dashboardChart = null;
let deferredInstallPrompt = null;
let photoAnalysisResult = null;
let currentQuestion = 0;
let testStarted = false;

function setupPwaFeatures(){
if('serviceWorker' in navigator){
navigator.serviceWorker.register('./sw.js').then(function(){
console.log('Service worker registered');
}).catch(function(err){
console.error('Service worker failed', err);
});
}

const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', function(event){
  event.preventDefault();
  deferredInstallPrompt = event;
  if(installBtn){
    installBtn.style.display = 'inline-flex';
  }
});

window.addEventListener('appinstalled', function(){
  if(installBtn){
    installBtn.style.display = 'none';
  }
});

if(installBtn){
  installBtn.addEventListener('click', async function(){
    if(!deferredInstallPrompt){
      alert('इस ब्राउज़र में इंस्टॉलेशन विकल्प उपलब्ध नहीं है। कृपया Chrome/Edge में “Add to Home Screen” का उपयोग करें।');
      return;
    }
    deferredInstallPrompt.prompt();
    const choiceResult = await deferredInstallPrompt.userChoice;
    if(choiceResult.outcome === 'accepted'){
      console.log('User accepted install prompt');
    }
    deferredInstallPrompt = null;
    installBtn.style.display = 'none';
  });
}

if(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone){
  if(installBtn){
    installBtn.style.display = 'none';
  }
}
}

setupPwaFeatures();

const questions = [
{
q:"1. आपकी शरीर संरचना कैसी है?\n1. What is your body constitution?",
options:[
["दुबली-पतली / Thin/Lean","vata"],
["मध्यम / Moderate","pitta"],
["भारी/मजबूत / Heavy/Strong","kapha"]
]
},
{
q:"2. आपकी त्वचा कैसी है?\n2. What is your skin like?",
options:[
["शुष्क / Dry","vata"],
["गर्म / Warm","pitta"],
["चिकनी / Smooth","kapha"]
]
},
{
q:"3. आपकी भूख कैसी है?\n3. What is your appetite like?",
options:[
["अनियमित / Irregular","vata"],
["तेज / Strong","pitta"],
["सामान्य / Normal","kapha"]
]
},
{
q:"4. आपकी पाचन शक्ति कैसी है?\n4. How is your digestion?",
options:[
["कभी ठीक कभी खराब / Variable","vata"],
["बहुत अच्छी / Very good","pitta"],
["धीमी / Slow","kapha"]
]
},
{
q:"5. आपकी नींद कैसी है?\n5. What is your sleep like?",
options:[
["हल्की / Light","vata"],
["मध्यम / Moderate","pitta"],
["गहरी / Deep","kapha"]
]
},
{
q:"6. स्मरण शक्ति कैसी है?\n6. How is your memory?",
options:[
["जल्दी सीखता जल्दी भूलता / Learns fast but forgets fast","vata"],
["अच्छी / Good","pitta"],
["धीरे सीखता लंबे समय तक याद / Learns slowly but remembers long","kapha"]
]
},
{
q:"7. स्वभाव कैसा है?\n7. What is your temperament like?",
options:[
["चंचल / Restless","vata"],
["नेतृत्वकारी / Leadership-oriented","pitta"],
["शांत / Calm","kapha"]
]
},
{
q:"8. कौन सा मौसम कम सहन होता है?\n8. Which season is difficult for you?",
options:[
["ठंड / Cold","vata"],
["गर्मी / Heat","pitta"],
["नमी / Humidity","kapha"]
]
},
{
q:"9. कार्य शैली कैसी है?\n9. What is your work style?",
options:[
["जल्दी शुरू जल्दी बदलता / Starts quickly and changes quickly","vata"],
["योजनाबद्ध / Organized","pitta"],
["धीरे लेकिन निरंतर / Slow but steady","kapha"]
]
},
{
q:"10. ऊर्जा स्तर कैसा है?\n10. What is your energy level?",
options:[
["अस्थिर / Unstable","vata"],
["स्थिर / Stable","pitta"],
["धीमा लेकिन टिकाऊ / Slow but lasting","kapha"]
]
},

{
q:"11. आपको सामान्यतः क्या अनुभव होता है?\n11. What do you usually experience?",
options:[
["हाथ-पैर ठंडे / Cold hands and feet","vata"],
["अधिक गर्मी / Excess heat","pitta"],
["भारीपन / Heaviness","kapha"]
]
},
{
q:"12. आपको कौन सी समस्या रहती है?\n12. What problem do you usually face?",
options:[
["गैस/कब्ज / Gas/Constipation","vata"],
["अम्लपित्त / Acidity","pitta"],
["सुस्ती / Lethargy","kapha"]
]
},
{
q:"13. मानसिक स्थिति कैसी रहती है?\n13. What is your mental state like?",
options:[
["चिंता / Anxiety","vata"],
["क्रोध / Anger","pitta"],
["संतोष / Contentment","kapha"]
]
},
{
q:"14. नींद से संबंधित अनुभव?\n14. Sleep-related experience?",
options:[
["बार-बार जागना / Frequent waking","vata"],
["सपने अधिक / More dreams","pitta"],
["अधिक सोना / Sleeping more","kapha"]
]
},
{
q:"15. वर्तमान स्वास्थ्य समस्या?\n15. Current health concern?",
options:[
["जोड़ों का दर्द / Joint pain","vata"],
["त्वचा/अम्लपित्त / Skin/Acidity","pitta"],
["मोटापा/एलर्जी / Obesity/Allergies","kapha"]
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
initializeTestUI();

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
<div class="advice-card">
<h3>वातज प्रकृति</h3>
<p><b>प्रमुख लक्षण:</b> दुबला शरीर, शुष्क त्वचा, अनियमित भूख, शीघ्र थकान, चिंता की प्रवृत्ति तथा हल्की नींद जैसी विशेषताएँ दिखाई देती हैं।</p>

<div class="advice-block">
<h4>🍲 आहार एवं जीवनशैली</h4>
<ul>
<li>गर्म, स्निग्ध एवं ताजा भोजन लें; यह वात को शांत करने में सहायक है।</li>
<li>घी, तिल का तेल, दूध, खिचड़ी, मूंग दाल, गेहूँ और साग-सब्ज़ी नियमित रूप से लें।</li>
<li>ठंडे पेय, सूखे खाद्य पदार्थ, अत्यधिक उपवास व बहुत अधिक यात्रा से बचें।</li>
</ul>
</div>

<div class="advice-block">
<h4>🧘 दिनचर्या एवं विहार</h4>
<ul>
<li>नियमित समय पर सोएँ-जागें और संतुलित दिनचर्या अपनाएँ।</li>
<li>हल्का मसाज, गरम पानी और पर्याप्त नींद से वात का संतुलन बना रहता है।</li>
<li>अत्यधिक तनाव, शीत और देर रात तक जागने से बचें।</li>
</ul>
</div>

<div class="advice-block">
<h4>🌿 योग एवं प्राणायाम</h4>
<ul>
<li>अनुलोम-विलोम</li>
<li>नाड़ी शोधन</li>
<li>शवासन</li>
<li>मकरासन</li>
</ul>
</div>

<p><b>विशेष सावधानी:</b> यदि कब्ज, गैस, जोड़ों का दर्द या अनिद्रा बढ़ जाए तो आयुर्वेद चिकित्सक से परामर्श लें।</p>
</div>
`;

}
else if(prakriti === "पित्तज प्रकृति"){

advice = `
<div class="advice-card">
<h3>पित्तज प्रकृति</h3>
<p><b>प्रमुख लक्षण:</b> मध्यम शरीर, तीव्र भूख, अधिक पसीना, गर्मी सहन न होना, चिड़चिड़ापन और जल्दी क्रोध आने की प्रवृत्ति होती है।</p>

<div class="advice-block">
<h4>🍲 आहार एवं जीवनशैली</h4>
<ul>
<li>शीतल, मधुर तथा हल्का आहार लें, जिससे पित्त शांत रहे।</li>
<li>नारियल पानी, आँवला, खीरा, तरबूज, छाछ, चावल और शीतल सब्ज़ियाँ उपयोगी हैं।</li>
<li>तीखा, खट्टा, गरम, तला-भुना तथा अधिक मसालेदार भोजन कम करें।</li>
</ul>
</div>

<div class="advice-block">
<h4>🧘 दिनचर्या एवं विहार</h4>
<ul>
<li>धूप और अत्यधिक गर्मी से बचें तथा पर्याप्त आराम करें।</li>
<li>मानसिक तनाव कम रखें और शांत वातावरण अपनाएँ।</li>
<li>अधिक परिश्रम, तेज़ क्रोध और लंबी धूप से बचना लाभदायक है।</li>
</ul>
</div>

<div class="advice-block">
<h4>🌿 योग एवं प्राणायाम</h4>
<ul>
<li>शीतली</li>
<li>शीतकारी</li>
<li>भ्रामरी</li>
<li>योग निद्रा</li>
</ul>
</div>

<p><b>विशेष सावधानी:</b> अम्लपित्त, त्वचा संबंधी समस्या या चिड़चिड़ापन बढ़ने पर चिकित्सकीय सलाह लें।</p>
</div>
`;

}
else if(prakriti === "कफज प्रकृति"){

advice = `
<div class="advice-card">
<h3>कफज प्रकृति</h3>
<p><b>प्रमुख लक्षण:</b> मजबूत शरीर, चिकनी त्वचा, शांत स्वभाव, गहरी नींद तथा वजन बढ़ने की प्रवृत्ति दिखाई देती है।</p>

<div class="advice-block">
<h4>🍲 आहार एवं जीवनशैली</h4>
<ul>
<li>हल्का, सुपाच्य और ताज़ा भोजन लें, जिससे कफ कम बने।</li>
<li>शहद, अदरक, लहसुन, जौ, बाजरा, सब्ज़ियाँ और हल्का आहार लाभकारी है।</li>
<li>मिठाई, दही, अधिक तैलीय और भारी भोजन कम करें।</li>
</ul>
</div>

<div class="advice-block">
<h4>🧘 दिनचर्या एवं विहार</h4>
<ul>
<li>नियमित व्यायाम, तेज़ चाल से चलना और सक्रिय जीवनशैली अपनाएँ।</li>
<li>आलस्य, दिन में लंबा आराम तथा अधिक नींद से बचें।</li>
<li>खुली हवा में समय बिताना और पानी पर्याप्त मात्रा में पीना फ़ायदेमंद है।</li>
</ul>
</div>

<div class="advice-block">
<h4>🌿 योग एवं प्राणायाम</h4>
<ul>
<li>सूर्य नमस्कार</li>
<li>कपालभाति</li>
<li>भस्त्रिका</li>
<li>तेज़ चाल से भ्रमण</li>
</ul>
</div>

<p><b>विशेष सावधानी:</b> मोटापा, एलर्जी, श्वास या सुस्ती बढ़ने पर चिकित्सकीय परामर्श लें।</p>
</div>
`;

}
else{

advice = `
<div class="advice-card">
<h3>मिश्रित प्रकृति</h3>
<p><b>विश्लेषण:</b> आपकी प्रकृति में दो या अधिक दोषों का संयुक्त प्रभाव पाया गया है, इसलिए संतुलन बनाए रखने पर विशेष ध्यान देना उचित है।</p>

<div class="advice-block">
<h4>🍲 सामान्य आहार नियम</h4>
<ul>
<li>संतुलित, ताज़ा और सुपाच्य भोजन लें।</li>
<li>अत्यधिक तला-भुना, तीखा, भारी और बहुत अधिक मीठा भोजन कम करें।</li>
<li>प्रत्येक दिन पर्याप्त पानी पिएँ और भोजन का समय नियमित रखें।</li>
</ul>
</div>

<div class="advice-block">
<h4>🧘 जीवनशैली एवं दिनचर्या</h4>
<ul>
<li>नियमित रूप से सोएँ-जागें और मन को शांत रखें।</li>
<li>हल्का योग, प्राणायाम और शांत वातावरण अपनाएँ।</li>
<li>मौसम, आयु और वर्तमान स्वास्थ्य स्थिति के अनुसार आहार एवं गतिविधियाँ समायोजित करें।</li>
</ul>
</div>

<p><b>विशेष सलाह:</b> यदि कोई लक्षण लगातार बने रहें तो ऋतु, आयु एवं स्वास्थ्य स्थिति के अनुसार आयुर्वेद चिकित्सक से परामर्श लें।</p>
</div>
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

const hospitalValue = document.getElementById("hospital").value;
const cityValue = document.getElementById("city").value;
const districtValue = document.getElementById("district").value;
const defaultDoctorValue = localStorage.getItem("portalDoctor") || "";
const doctorValue = (document.getElementById("doctor").value || defaultDoctorValue || "डॉ. नाम").trim();
const doctorDisplayValue = doctorValue || "डॉ. नाम";
if(document.getElementById("doctor")){
document.getElementById("doctor").value = doctorDisplayValue;
}

document.getElementById("reportHospital").innerText = hospitalValue;
document.getElementById("reportCity").innerText = cityValue;
document.getElementById("reportDistrict").innerText = districtValue;
document.getElementById("reportDoctor").innerText = doctorDisplayValue;
document.getElementById("reportDoctorSignature").innerText = doctorDisplayValue;

const headerBaseText = "राजकीय आयुर्वेद औषधालय / आयुष्मान आरोग्य मंदिर";
document.getElementById("headerHospitalName").innerText = hospitalValue ? headerBaseText + " - " + hospitalValue : headerBaseText;

const reportValues = [
document.getElementById("reportName"),
document.getElementById("reportAge"),
document.getElementById("reportGender"),
document.getElementById("reportMobile"),
document.getElementById("reportOpdNo"),
document.getElementById("reportCity"),
document.getElementById("reportDistrict"),
document.getElementById("reportHospital"),
document.getElementById("reportDoctor")
];
reportValues.forEach(function(el){ if(el) el.style.visibility = "visible"; });

localStorage.setItem("portalHospital", hospitalValue);
localStorage.setItem("portalCity", cityValue);
localStorage.setItem("portalDistrict", districtValue);
localStorage.setItem("portalDoctor", doctorDisplayValue);
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
photo:
document.getElementById("photoPreview").src || "",
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
    alert("Excel Start");
alert(typeof XLSX);

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

let cleanData = data.map(item => ({

reportNo: item.reportNo,
name: item.name,
age: item.age,
gender: item.gender,
mobile: item.mobile,
opdNo: item.opdNo,
city: item.city,
district: item.district,
hospital: item.hospital,
doctor: item.doctor,
prakriti: item.prakriti,
vata: item.vata,
pitta: item.pitta,
kapha: item.kapha,
savedAt: item.savedAt

}));

let worksheet =
XLSX.utils.json_to_sheet(cleanData);

let workbook = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
workbook,
worksheet,
"Prakriti Reports"
);
alert("Data Length: " + data.length);

alert("Before Download");

try{

XLSX.writeFile(
workbook,
"Prakriti_Master_Report.xlsx"
);

alert("After Download");

}catch(error){

alert("Excel Error: " + error.message);
console.log(error);

}
alert("After Download");

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
`<tr><td colspan="9" class="empty-history">No previous inspections saved.</td></tr>`;
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

<td>
<button onclick="openHistoryReport('${item.reportNo}')">
📄 Open
</button>
<button onclick="downloadHistoryPDF('${item.reportNo}')">
🖨 PDF
</button>
<button onclick="deleteHistoryReport('${item.reportNo}')">
🗑 Delete
</button>
</td>

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

function getPortalSettings(){
return {
hospital: localStorage.getItem("portalHospital") || "",
doctor: localStorage.getItem("portalDoctor") || ""
};
}

function savePortalSettings(){
const rawDoctor = document.getElementById("settingsDoctor").value.trim();
const settings = {
hospital: document.getElementById("settingsHospital").value.trim(),
doctor: rawDoctor
};
const savedDoctor = settings.doctor || "डॉ. नाम";

localStorage.setItem("portalHospital", settings.hospital);
localStorage.setItem("portalDoctor", savedDoctor);

if(document.getElementById("hospital")){
document.getElementById("hospital").value = settings.hospital;
}
if(document.getElementById("doctor")){
document.getElementById("doctor").value = savedDoctor;
}
if(document.getElementById("headerHospital")){
document.getElementById("headerHospital").value = settings.hospital;
}
if(document.getElementById("headerHospitalName")){
const headerBaseText = "राजकीय आयुर्वेद औषधालय / आयुष्मान आरोग्य मंदिर";
document.getElementById("headerHospitalName").innerText = settings.hospital ? headerBaseText + " - " + settings.hospital : headerBaseText;
}
alert("डिफ़ॉल्ट जानकारी सहेज ली गई है।");
}

function applyPortalSettingsToForm(){
const settings = getPortalSettings();
if(document.getElementById("settingsHospital")){
document.getElementById("settingsHospital").value = settings.hospital;
}
if(document.getElementById("settingsDoctor")){
document.getElementById("settingsDoctor").value = settings.doctor;
}
if(document.getElementById("hospital")){
document.getElementById("hospital").value = settings.hospital;
}
if(document.getElementById("doctor")){
const savedDoctor = (settings.doctor || localStorage.getItem("portalDoctor") || "डॉ. नाम").trim();
document.getElementById("doctor").value = savedDoctor || "डॉ. नाम";
}
if(document.getElementById("headerHospital")){
document.getElementById("headerHospital").value = settings.hospital;
}
if(document.getElementById("headerHospitalName")){
const headerBaseText = "राजकीय आयुर्वेद औषधालय / आयुष्मान आरोग्य मंदिर";
document.getElementById("headerHospitalName").innerText = settings.hospital ? headerBaseText + " - " + settings.hospital : headerBaseText;
}
}

function initializeAppView(){

applyTheme(localStorage.getItem("portalTheme") || "green");
applyPortalSettingsToForm();

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
const report = document.getElementById("resultSection");

if(!report){
alert("रिपोर्ट अनुभाग नहीं मिला।");
return;
}

report.style.display = "block";
report.style.position = "relative";
report.style.background = "#fff";
report.style.padding = "8px";
report.style.width = "100%";
report.style.maxWidth = "100%";
report.style.boxSizing = "border-box";
report.style.fontSize = "11px";
report.style.lineHeight = "1.2";

await new Promise(resolve => setTimeout(resolve, 250));

const fallbackPrintPDF = () => {
const printWindow = window.open("", "_blank", "width=900,height=700");

if(!printWindow){
window.print();
return;
}

printWindow.document.write(`<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<title>आयुर्वेदिक प्रकृति परीक्षण रिपोर्ट</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;700&display=swap" rel="stylesheet">
<style>
@page{margin:5mm; size:A4 portrait;}
body{font-family:"Noto Sans Devanagari", Arial, sans-serif; margin:0; padding:4px; background:white; color:#111; box-sizing:border-box;}
#resultSection{display:block !important; width:100%; margin:0; padding:6px 8px; border:1px solid #0f7d32; border-radius:10px; box-sizing:border-box; font-size:11px; line-height:1.2; page-break-inside:avoid; overflow:hidden;}
.report-header{display:flex; justify-content:space-between; align-items:center; gap:8px; min-height:60px; margin-bottom:4px;}
.logo-left, .logo-right{width:52px; min-width:52px; display:flex; align-items:center; justify-content:center; flex-shrink:0;}
.logo-left img, .logo-right img{width:48px; height:48px; object-fit:contain; display:block;}
.title-center{flex:1; text-align:center; min-width:0; padding:0 4px;}
.title-center h2{font-size:15px; margin:2px 0;}
.title-center p{font-size:11px; margin:1px 0;}
#prakritiName{font-size:18px; padding:6px; margin:8px 0;}
.score-container{gap:6px; margin-top:8px;}
.score-box{padding:6px; font-size:11px;}
#reportPhoto{width:80px; height:80px; object-fit:cover; margin-bottom:6px;}
img{max-width:100%; height:auto;}
</style>
</head>
<body>${report.outerHTML}</body>
</html>`);
printWindow.document.close();
setTimeout(() => {
printWindow.focus();
printWindow.print();
}, 500);
};

try {
if(window.jspdf && window.jspdf.jsPDF && window.html2canvas){
const { jsPDF } = window.jspdf;
const canvas = await window.html2canvas(report, {
scale: 2,
useCORS: true,
allowTaint: true,
width: report.scrollWidth,
height: report.scrollHeight
});

const imgData = canvas.toDataURL("image/png");
const pdf = new jsPDF("p", "mm", "a4");
const pdfWidth = pdf.internal.pageSize.getWidth();
const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
pdf.save("Prakriti_Report.pdf");
return;
}
}catch(error){
console.error("PDF image export failed:", error);
}

fallbackPrintPDF();
}
document.getElementById("headerHospital").addEventListener("input", function(){

const headerBaseText = "राजकीय आयुर्वेद औषधालय / आयुष्मान आरोग्य मंदिर";
document.getElementById("headerHospitalName").innerText =
this.value ? headerBaseText + " - " + this.value : headerBaseText;

});
document.getElementById("extraHospital").addEventListener("input", function(){

document.getElementById("extraHospitalName").innerHTML =
this.value ? "<br>" + this.value : "";

});

window.downloadPDF = downloadPDF;

function initializeTestUI(){
testStarted = false;
const startScreen = document.getElementById("startScreen");
const testContent = document.getElementById("testContent");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const resultBtn = document.getElementById("resultBtn");

if(startScreen) startScreen.style.display = "block";
if(testContent) testContent.style.display = "none";
if(nextBtn) nextBtn.style.display = "none";
if(prevBtn) prevBtn.style.display = "none";
if(resultBtn) resultBtn.style.display = "none";

const progressText = document.getElementById("questionProgress");
if(progressText) progressText.innerText = "प्रकृति परीक्षण शुरू करें";

const progressBar = document.getElementById("progressBar");
if(progressBar) progressBar.style.width = "0%";

document.querySelectorAll(".question").forEach(q => q.classList.remove("active"));
}

function startPrakritiTest(){
testStarted = true;
const startScreen = document.getElementById("startScreen");
const testContent = document.getElementById("testContent");
if(startScreen) startScreen.style.display = "none";
if(testContent) testContent.style.display = "block";
showQuestion(0);
}

function showQuestion(index){
currentQuestion = index;

if(!testStarted) return;

let questions =
document.querySelectorAll(".question");

questions.forEach(q =>
q.classList.remove("active"));

if(questions[index]){
questions[index].classList.add("active");
}

let nextBtn =
document.getElementById("nextBtn");
let resultBtn =
document.getElementById("resultBtn");

if(index === questions.length - 1){

nextBtn.style.display = "none";

if(resultBtn){
resultBtn.style.display = "inline-block";
}

}else{

nextBtn.style.display = "inline-block";

if(resultBtn){
resultBtn.style.display = "none";
}

}
document.getElementById("questionProgress").innerText =
`प्रश्न ${index + 1} / ${questions.length}`;

document.getElementById("progressBar").style.width =
((index + 1) / questions.length * 100) + "%";
}

function nextQuestion(){

let selected =
document.querySelector(
`input[name="q${currentQuestion}"]:checked`
);

if(!selected){
alert("कृपया उत्तर चुनें");
return;
}

let questions =
document.querySelectorAll(".question");

if(currentQuestion < questions.length - 1){
currentQuestion++;
showQuestion(currentQuestion);
}

}

function prevQuestion(){

if(currentQuestion > 0){
currentQuestion--;
showQuestion(currentQuestion);
}

}
function openHistoryReport(reportNo){


let data =
getStoredPrakritiData();


let report =
data.find(x => x.reportNo == reportNo);


if(!report){

return;
}

document.getElementById("reportNo").innerText =
report.reportNo || "";


document.getElementById("reportDate").innerText =
report.date || "";


document.getElementById("reportNo").innerText =
report.reportNo || "";

document.getElementById("reportDate").innerText =
report.date || "";

document.getElementById("reportTime").innerText =
report.time || "";
document.getElementById("reportName").innerText =
report.name;

document.getElementById("reportMobile").innerText =
report.mobile || "";


document.getElementById("reportAge").innerText =
report.age || "";

document.getElementById("reportGender").innerText =
report.gender || "";

document.getElementById("reportOpdNo").innerText =
report.opdNo || "";


document.getElementById("reportCity").innerText =
report.city || "";

document.getElementById("reportDistrict").innerText =
report.district || "";

const hospitalField = document.getElementById("reportHospital");
if(hospitalField){
hospitalField.innerText = report.hospital || "";
}

const doctorField = document.getElementById("reportDoctor");
if(doctorField){
const doctorDisplay = (report.doctor || "डॉ. नाम").trim();
doctorField.innerText = doctorDisplay || "डॉ. नाम";
}
const signatureDoctorField = document.getElementById("reportDoctorSignature");
if(signatureDoctorField){
const doctorDisplay = (report.doctor || "डॉ. नाम").trim();
signatureDoctorField.innerText = doctorDisplay || "डॉ. नाम";
}
if(report.photo){

document.getElementById("reportPhoto").src =
report.photo;

document.getElementById("reportPhoto").style.display =
"block";

}

document.getElementById("vataScore").innerText =
report.vata || 0;

document.getElementById("pittaScore").innerText =
report.pitta || 0;

document.getElementById("kaphaScore").innerText =
report.kapha || 0;

document.getElementById("prakritiName").innerText =
report.prakriti || "";
const resultSection = document.getElementById("resultSection");
if(resultSection){
resultSection.style.display = "block";
resultSection.style.visibility = "visible";
}
switchTab("home");
setTimeout(function(){
if(resultSection){
resultSection.scrollIntoView({
behavior:"smooth",
block:"start"
});
}
}, 100);

}
function deleteHistoryReport(reportNo){

if(!confirm("क्या आप यह रिपोर्ट हटाना चाहते हैं?")){
return;
}

let data =
getStoredPrakritiData();

data =
data.filter(item =>
item.reportNo !== reportNo
);

localStorage.setItem(
"prakritiData",
JSON.stringify(data)
);

renderInspectionHistory();
updateDashboard();

alert("रिपोर्ट सफलतापूर्वक हटाई गई");
}
async function downloadHistoryPDF(reportNo){
openHistoryReport(reportNo);
await new Promise(function(resolve){
setTimeout(resolve, 1000);
});
try{
await downloadPDF();
}catch(error){
console.error("History PDF export failed:", error);
window.print();
}
}