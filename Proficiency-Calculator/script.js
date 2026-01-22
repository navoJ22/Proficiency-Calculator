// #region Setup

const heroImg = document.getElementById("heroImg");
const heroName = document.getElementById("heroName");
const modal = document.getElementById("modal");
const heroGrid = document.getElementById("heroGrid");
const result1 = document.getElementById("result1");
const result2 = document.getElementById("result2");
const rightPanel = document.querySelector(".right");

const currentLevelInput = document.getElementById("currentLevel");
const targetLevelInput = document.getElementById("targetLevel");
const pointsSlider = document.getElementById("pointsSlider");
const proficiencyText = document.getElementById("proficiencyText");

let calcClicks = 0;
let useOldBadges = false;

// #endregion

// #region const
const RANK_TO_LEVEL = {
	Agent: 4, Knight: 9, Captain: 14, Centurion: 19, Lord: 24, Count: 29,
	Colonel: 34, Warrior: 39, Elite: 44, Guardian: 49, Champion: 70
};

const MAX_XP = [
	{ min: 1, max: 4, xp: 125 }, { min: 5, max: 9, xp: 240 },
	{ min: 10, max: 14, xp: 400 }, { min: 15, max: 19, xp: 480 },
	{ min: 20, max: 24, xp: 1600 }, { min: 25, max: 29, xp: 1600 },
	{ min: 30, max: 34, xp: 1600 }, { min: 35, max: 39, xp: 1600 },
	{ min: 40, max: 44, xp: 1600 }, { min: 45, max: 50, xp: 1600 },
	{ min: 51, max: 70, xp: 3100 }
];

const XP_PER_REPEAT = [
	{ min: 1, max: 4, xp: 7 }, { min: 5, max: 9, xp: 13 },
	{ min: 10, max: 14, xp: 20 }, { min: 15, max: 19, xp: 26 },
	{ min: 20, max: 70, xp: 80 }
];

const XP_PER_15_MIN = [
	{ min: 1, max: 19, xp: 20 },
	{ min: 20, max: 70, xp: 60 }
];
// #endregion

// #region Hero Data

function heroToFile(name){ return name.toLowerCase().replace(/[^a-z]/g,""); }
function heroPickerImg(name){ return `assets/hero/${heroToFile(name)}.png`; }
function heroDisplayImg(name){ return `assets/displayicon/${heroToFile(name)}.png`; }

const heroNames = ["Adam Warlock","Angela","Black Panther","Black Widow","Blade","Bruce Banner",
	"Captain America","Cloak & Dagger","Daredevil","Doctor Strange", "Deadpool",
	"Emma Frost","Gambit","Groot","Hawkeye","Hela","Human Torch",
	"Invisible Woman","Iron Fist","Iron Man","Jeff the Land Shark",
	"Loki","Luna Snow","Magik","Magneto","Mantis","Mister Fantastic",
	"Moon Knight","Namor","Peni Parker","Phoenix","Psylocke",
	"Rocket Raccoon","Rogue","Scarlet Witch","Spider-Man",
	"Squirrel Girl","Star-Lord","Storm","The Punisher","The Thing",
	"Thor","Ultron","Venom","Winter Soldier","Wolverine"];

const heroes = heroNames.map(name => ({ name, pickerImg: heroPickerImg(name), displayImg: heroDisplayImg(name) }));

let currentHero = null;

const roleMissionNames = {
	Vanguard: ["Damage Blocked", "KOs"],
	Duelist: ["Damage Dealt", "Final Kills"],
	Strategist: ["Healing", "KOs & Assists"]
};

const heroMissions = {
	"Adam Warlock": { 		role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 13, "5-9": 26, "10-14": 38, "15-70": 51 } },
	"Angela": { 			role: "Vanguard", 	mission2: { "1-4": 7500, "5-9": 15000, "10-14": 22000, "15-70": 30000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Black Panther": { 		role: "Duelist", 	mission2: { "1-4": 3700, "5-9": 7500, "10-14": 11000, "15-70": 15000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Black Widow": { 		role: "Duelist", 	mission2: { "1-4": 3100, "5-9": 6200, "10-14": 9200, "15-70": 12000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Blade": { 				role: "Duelist", 	mission2: { "1-4": 5100, "5-9": 10000, "10-14": 15000, "15-70": 20000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Bruce Banner": { 		role: "Vanguard", 	mission2: { "1-4": 10000, "5-9": 21000, "10-14": 31000, "15-70": 42000 }, mission3: { "1-4": 5, "5-9": 11, "10-14": 16, "15-70": 22 } },
	"Captain America": { 	role: "Vanguard", 	mission2: { "1-4": 9000, "5-9": 18000, "10-14": 27000, "15-70": 36000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Cloak & Dagger": { 	role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Daredevil": { 			role: "Duelist", 	mission2: { "1-4": 3700, "5-9": 7500, "10-14": 11000, "15-70": 15000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Deadpool": { 			role: "Special", 	mission2: { "1-4": 5700, "5-9": 11000, "10-14": 17000, "15-70": 23000 }, mission3: { "1-4": 5, "5-9": 30, "10-14": 45, "15-70": 60 }, 	mission2Name: "Damage and Healing", mission3Name: "KOs & Assists" },
	"Doctor Strange": { 	role: "Vanguard", 	mission2: { "1-4": 10000, "5-9": 21000, "10-14": 31000, "15-70": 42000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Emma Frost": { 		role: "Vanguard", 	mission2: { "1-4": 10000, "5-9": 21000, "10-14": 31000, "15-70": 42000 }, mission3: { "1-4": 7, "5-9": 15, "10-14": 22, "15-70": 29 } },
	"Gambit": { 			role: "Strategist", mission2: { "1-4": 4500, "5-9": 9100, "10-14": 14000, "15-70": 18000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Groot": { 				role: "Vanguard", 	mission2: { "1-4": 14000, "5-9": 27000, "10-14": 41000, "15-70": 55000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Hawkeye": { 			role: "Duelist", 	mission2: { "1-4": 5100, "5-9": 10000, "10-14": 15000, "15-70": 20000 }, mission3: { "1-4": 6, "5-9": 11, "10-14": 17, "15-70": 23 } },
	"Hela": { 				role: "Duelist", 	mission2: { "1-4": 5700, "5-9": 11000, "10-14": 17000, "15-70": 23000 }, mission3: { "1-4": 7, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Human Torch": { 		role: "Duelist", 	mission2: { "1-4": 4400, "5-9": 8800, "10-14": 13000, "15-70": 18000 }, mission3: { "1-4": 4, "5-9": 8, "10-14": 12, "15-70": 17 } },
	"Invisible Woman": { 	role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Iron Fist": { 			role: "Duelist", 	mission2: { "1-4": 3100, "5-9": 6200, "10-14": 9200, "15-70": 12000 }, mission3: { "1-4": 4, "5-9": 8, "10-14": 12, "15-70": 17 } },
	"Iron Man": { 			role: "Duelist", 	mission2: { "1-4": 4400, "5-9": 8800, "10-14": 13000, "15-70": 18000 }, mission3: { "1-4": 4, "5-9": 8, "10-14": 12, "15-70": 17 } },
	"Jeff the Land Shark": {role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 13, "5-9": 26, "10-14": 38, "15-70": 51 } },
	"Loki": { 				role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Luna Snow": { 			role: "Strategist", mission2: { "1-4": 6200, "5-9": 12000, "10-14": 18000, "15-70": 25000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Magik": { 				role: "Duelist", 	mission2: { "1-4": 4400, "5-9": 8800, "10-14": 13000, "15-70": 18000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Magneto": { 			role: "Vanguard", 	mission2: { "1-4": 9000, "5-9": 18000, "10-14": 27000, "15-70": 36000 }, mission3: { "1-4": 7, "5-9": 15, "10-14": 22, "15-70": 29 } },
	"Mantis": { 			role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 17, "5-9": 35, "10-14": 52, "15-70": 70 } },
	"Mister Fantastic": { 	role: "Duelist", 	mission2: { "1-4": 5100, "5-9": 10000, "10-14": 10000, "15-70": 10000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 10, "15-70": 10 } },
	"Moon Knight": { 		role: "Duelist", 	mission2: { "1-4": 4400, "5-9": 8800, "10-14": 13000, "15-70": 18000 }, mission3: { "1-4": 4, "5-9": 8, "10-14": 12, "15-70": 17 } },
	"Namor": { 				role: "Duelist", 	mission2: { "1-4": 5100, "5-9": 10000, "10-14": 15000, "15-70": 20000 }, mission3: { "1-4": 4, "5-9": 8, "10-14": 12, "15-70": 17 } },
	"Peni Parker": { 		role: "Vanguard", 	mission2: { "1-4": 7500, "5-9": 15000, "10-14": 22000, "15-70": 30000 }, mission3: { "1-4": 7, "5-9": 15, "10-14": 22, "15-70": 29 } },
	"Phoenix": { 			role: "Duelist", 	mission2: { "1-4": 5700, "5-9": 11000, "10-14": 17000, "15-70": 23000 }, mission3: { "1-4": 7, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Psylocke": { 			role: "Duelist", 	mission2: { "1-4": 3700, "5-9": 7500, "10-14": 11000, "15-70": 15000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Rocket Raccoon": { 	role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Rogue": { 				role: "Vanguard", 	mission2: { "1-4": 9000, "5-9": 18000, "10-14": 27000, "15-70": 36000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Scarlet Witch": { 		role: "Duelist", 	mission2: { "1-4": 3700, "5-9": 7500, "10-14": 11000, "15-70": 15000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Spider-Man": { 		role: "Duelist", 	mission2: { "1-4": 3100, "5-9": 6200, "10-14": 9200, "15-70": 12000 }, mission3: { "1-4": 4, "5-9": 8, "10-14": 12, "15-70": 17 } },
	"Squirrel Girl": { 		role: "Duelist", 	mission2: { "1-4": 5100, "5-9": 10000, "10-14": 15000, "15-70": 20000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Star-Lord": { 			role: "Duelist", 	mission2: { "1-4": 4400, "5-9": 8800, "10-14": 13000, "15-70": 18000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Storm": { 				role: "Duelist", 	mission2: { "1-4": 4400, "5-9": 8800, "10-14": 13000, "15-70": 18000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"The Punisher": { 		role: "Duelist", 	mission2: { "1-4": 5100, "5-9": 10000, "10-14": 15000, "15-70": 20000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"The Thing": { 			role: "Vanguard", 	mission2: { "1-4": 10000, "5-9": 21000, "10-14": 31000, "15-70": 42000 }, mission3: { "1-4": 7, "5-9": 15, "10-14": 22, "15-70": 29 } },
	"Thor": { 				role: "Vanguard", 	mission2: { "1-4": 9000, "5-9": 18000, "10-14": 27000, "15-70": 36000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Ultron": { 			role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 17, "5-9": 35, "10-14": 52, "15-70": 70 } },
	"Venom": { 				role: "Vanguard", 	mission2: { "1-4": 10000, "5-9": 21000, "10-14": 31000, "15-70": 42000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Winter Soldier": { 	role: "Duelist", 	mission2: { "1-4": 3700, "5-9": 7500, "10-14": 11000, "15-70": 15000 }, mission3: { "1-4": 4, "5-9": 8, "10-14": 12, "15-70": 17 } },
	"Wolverine": {			role: "Duelist", 	mission2: { "1-4": 4400, "5-9": 8800, "10-14": 13000, "15-70": 18000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } }
};
// #endregion

// #region Xp & lvl up system 

function limitCurrent(){
	if(currentLevelInput.value === "") return;

	let val = Number(currentLevelInput.value);
	currentLevelInput.value = Math.min(69, Math.max(1, val));

	if(targetLevelInput.value && Number(targetLevelInput.value) <= val){
		targetLevelInput.value = val + 1;
	}

	clampPoints();
	updateProficiencyUI();
}


function limitTarget(){
    if(targetLevelInput.value === "") return;

    let min = currentLevelInput.value ? Number(currentLevelInput.value)+1 : 2;
    targetLevelInput.value = Math.min(70, Math.max(min, Number(targetLevelInput.value)));
}


function getXPForLevel(level){
	for(const b of XP_PER_REPEAT) if(level>=b.min && level<=b.max) return b.xp;
	return 0;
}

function getXPFor15Min(level){
	for(const b of XP_PER_15_MIN)
		if(level >= b.min && level <= b.max) return b.xp;
	return 0;
}

function getMaxXP(level){
	for(const b of MAX_XP) if(level>=b.min && level<=b.max) return b.xp;
	return 0;
}

function getRankFromLevel(level){
	let lastRank=null;
	for(const [rank,maxLvl] of Object.entries(RANK_TO_LEVEL)){
		lastRank=rank;
		if(level<=maxLvl) return rank;
	}
	return lastRank;
}

function clampPoints(){
	const max = getMaxXP(Number(currentLevelInput.value)||1);
	if(Number(pointsSlider.value) > max) pointsSlider.value = max;
	updateProficiencyUI();
}

function updateProficiencyUI(){
	const level = Number(currentLevelInput.value)||1;
	const max = getMaxXP(level);
	pointsSlider.max = max;
	pointsSlider.value = Math.min(Number(pointsSlider.value)||0, max);
	proficiencyText.innerText = `PROFICIENCY ${pointsSlider.value} / ${max}`;
}

currentLevelInput.addEventListener("input", limitCurrent);
targetLevelInput.addEventListener("blur", limitTarget);
pointsSlider.addEventListener("input", updateProficiencyUI);

// #endregion

// #region Rank Picker

document.querySelectorAll(".rankpicker").forEach(picker=>{
	const input = picker.querySelector('input[type="number"]');
	const img = picker.querySelector(".rankimage");
	if(!input||!img) return;
	input.addEventListener("input", ()=>{
		const lvl=parseInt(input.value);
		if(!lvl){ img.style.display="none"; return; }
		const rank=getRankFromLevel(lvl);
		if(!rank){ img.style.display="none"; return; }
		const base = useOldBadges ? "assets/badge/oldbadge" : "assets/badge";
		img.src = `${base}/${rank.toLowerCase()}.png`;

		img.style.display="block";
	});
});

// #endregion

// #region Hero Picker

function openPicker(){ modal.style.display="flex"; }
modal.onclick = e=>{ if(e.target===modal) modal.style.display="none"; }

heroes.forEach(hero=>{
	const card=document.createElement("div");
	card.className="hero-card";
	card.innerHTML=`<img src="${hero.pickerImg}"><div>${hero.name}</div>`;
	card.onclick=()=>selectHero(hero);
	heroGrid.appendChild(card);
});

const roleFilter = document.getElementById("roleFilter");

function renderHeroes(filter="All") {
  heroGrid.innerHTML = "";
  heroes.forEach(hero => {
    const heroRole = heroMissions[hero.name]?.role || "Special";

    if(hero.name !== "Deadpool" && filter !== "All" && heroRole !== filter) return;

    const card = document.createElement("div");
    card.className = "hero-card";
    card.innerHTML = `<img src="${hero.pickerImg}"><div>${hero.name}</div>`;
    card.onclick = () => selectHero(hero);
    heroGrid.appendChild(card);
  });
}
renderHeroes();

roleFilter.addEventListener("change", () => {
  renderHeroes(roleFilter.value);
});

function selectHero(hero){
	currentHero=hero;
	heroName.innerText=hero.name;
	heroImg.src=hero.displayImg;
	modal.style.display="none";
	buildMissionInputs(hero);

	const heroBg = document.getElementById("heroBg");
	heroBg.style.backgroundImage = `url('assets/shadow/${heroToFile(hero.name)}.png')`;

	const herobgcolor = document.getElementById("herobgcolor");
	herobgcolor.style.backgroundImage = `url('assets/background/${heroToFile(hero.name)}.png')`;

	const herologo = document.getElementById("herologo");
	herologo.style.backgroundImage = `url('assets/logo/${heroToFile(hero.name)}.png')`;
}
// #endregion

// #region Inputs
function buildMissionInputs(hero){
	const rightContent=document.querySelector(".rightcontent");
	let wrap=document.getElementById("dynamicInputs");

	if(!wrap){
		wrap=document.createElement("div");
		wrap.id="dynamicInputs";
		rightContent.appendChild(wrap);
	}

	const role = heroMissions[hero.name]?.role;
	const mission2Name = heroMissions[hero.name]?.mission2Name || roleMissionNames[role]?.[0] || "Mission 2";
	const mission3Name = heroMissions[hero.name]?.mission3Name || roleMissionNames[role]?.[1] || "Mission 3";

	wrap.innerHTML = `
	<div class="missioncal-holder">
		<div class="input-field input-mission">
			<input type="number" id="mission2" required spellcheck="false">
			<label>${mission2Name} per 10 minutes</label>
		</div>
		<div class="input-field input-mission">
			<input type="number" id="mission3" required spellcheck="false">
			<label>${mission3Name} per 10 minutes</label>
		</div>
	</div>
	<button class="calculate" onclick="simulate()">Calculate</button>
	`;
}
// #endregion

// #region Simulation
function simulate(){
	calcClicks++;

	if(calcClicks === 10){
		useOldBadges = true;
		document.querySelectorAll(".rankpicker input").forEach(input=>{
			input.dispatchEvent(new Event("input"));
		});
		console.log("Easter egg unlocked");
		showRetroPopup();
	}

	if(!currentHero){ alert("Pick a hero first"); return; }

	let currentLevel=Number(currentLevelInput.value)||1;
	const targetLevel=Number(targetLevelInput.value)||1;
	let points=Number(pointsSlider.value)||0;
	let pointsrequired=0;

	for(let lvl=currentLevel; lvl<targetLevel; lvl++) pointsrequired+=getMaxXP(lvl);
	pointsrequired-=points;
	if(pointsrequired<0) pointsrequired=0;

	const heroData=heroMissions[currentHero.name];
	const role=heroData.role;

	function getBracket(obj, level){
		for(const key in obj){
			const [min,max]=key.split("-").map(Number);
			if(level>=min && level<=max) return obj[key];
		}
		return 0;
	}

	let mission2Req=getBracket(heroData.mission2,currentLevel);
	let mission3Req=getBracket(heroData.mission3,currentLevel);
	const mission2Name=heroData.mission2Name || roleMissionNames[role][0];
	const mission3Name=heroData.mission3Name || roleMissionNames[role][1];

	let progress={ time:0, mission2:0, mission3:0 };
	let completed={ time:0, mission2:0, mission3:0 };
	let minutes=0;

	const mission2Input=Number(document.getElementById("mission2")?.value||0);
	const mission3Input=Number(document.getElementById("mission3")?.value||0);

	while(currentLevel<targetLevel){
		minutes++;
		progress.time++;
		progress.mission2 += mission2Input/10;
		progress.mission3 += mission3Input/10;

		if(progress.time>=15){
			points+=getXPFor15Min(currentLevel);
			completed.time++;
			progress.time-=15;
		}

		while(progress.mission2>=mission2Req){
			points+=getXPForLevel(currentLevel);
			completed.mission2++;
			progress.mission2-=mission2Req;
		}

		while(progress.mission3>=mission3Req){
			points+=getXPForLevel(currentLevel);
			completed.mission3++;
			progress.mission3-=mission3Req;
		}

		const max=getMaxXP(currentLevel);
		if(points>=max){
			points-=max;
			currentLevel++;
			mission2Req=getBracket(heroData.mission2,currentLevel);
			mission3Req=getBracket(heroData.mission3,currentLevel);
		}
	}

	result1.innerText=`Hero: ${currentHero.name}
Role: ${role}
Time to complete: ${Math.floor(minutes/60)}h ${minutes%60}m
Points: ${pointsrequired}`;

	result2.innerText=`Missions Completed:
    Play for 15mins: ${completed.time} times
    ${mission2Name}: ${completed.mission2} times
    ${mission3Name}: ${completed.mission3} times`;
}
// #endregion

// #region Popups

function setupPanel(buttonSelector, panelId){
	const btn = document.querySelector(buttonSelector);
	const panel = document.getElementById(panelId);

	btn.addEventListener("click", e => {
		e.stopPropagation();
		panel.style.display = "flex";
	});

	panel.addEventListener("click", () => panel.style.display = "none");

	const content = panel.firstElementChild; 
	content.addEventListener("click", e => e.stopPropagation());
}

setupPanel(".infobutton", "infoPanel");
setupPanel(".creditsbutton", "creditsPanel");
setupPanel(".aboutbutton", "aboutPanel");

function showRetroPopup(){
	const div = document.createElement("div");
	div.className = "retro-popup";
	div.innerText = "Retro Mode Activated!";

	document.body.appendChild(div);

	requestAnimationFrame(()=>div.classList.add("show"));

	setTimeout(()=>{
		div.classList.remove("show");
		setTimeout(()=>div.remove(), 300);
	}, 1800);
}

// #endregion