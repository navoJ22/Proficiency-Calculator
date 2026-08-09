// #region Setup

const heroImg = document.getElementById("heroImg");
const heroName = document.getElementById("heroName");
const modal = document.getElementById("modal");
const heroGrid = document.getElementById("heroGrid");
const result1 = document.getElementById("result1");
const result2 = document.getElementById("result2");
const rightPanel = document.querySelector(".right");
const mobileLayoutQuery = window.matchMedia("(max-width: 760px)");

const currentLevelInput = document.getElementById("currentLevel");
const targetLevelInput = document.getElementById("targetLevel");
const pointsSlider = document.getElementById("pointsSlider");
const proficiencyText = document.getElementById("proficiencyText");

let calcClicks = 0;
let useOldBadges = false;

function isMobileLayout(){
	return mobileLayoutQuery.matches;
}

document.addEventListener("contextmenu", e => {
	e.preventDefault();
});

// #endregion

// #region Const
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

const modeToggle = document.getElementById("modeToggle");
const pointsInput = document.getElementById("pointsInput");
const maxPointsText = document.getElementById("maxPoints");
// #endregion

// #region Hero Data

function heroToFile(name){ return name.toLowerCase().replace(/[^a-z]/g,""); }
function heroPickerImg(name){ return `assets/heropicker/${heroToFile(name)}.png`; }
function heroDisplayImg(name){ return `assets/displayicon/${heroToFile(name)}.png`; }

const heroNames = ["Adam Warlock","Angela","Black Cat", "Black Panther","Black Widow","Blade","Bruce Banner",
	"Captain America","Cloak & Dagger", "Cyclops","Daredevil","Deadpool","Devil Dino","Doctor Strange", "Elsa Bloodstone",
	"Emma Frost","Gambit","Groot","Hawkeye","Hela","Human Torch",
	"Invisible Woman","Iron Fist","Iron Man","Jeff", "Jubilee",
	"Loki","Luna Snow","Magik","Magneto","Mantis","Mister Fantastic",
	"Moon Knight","Namor","Peni Parker","Phoenix","Psylocke",
	"Rocket Raccoon","Rogue","Scarlet Witch","Spider-Man",
	"Squirrel Girl","Star-Lord","Storm","The Hood", "The Punisher","The Thing",
	"Thor","Ultron","Venom","White Fox", "Winter Soldier","Wolverine"];

const heroes = heroNames.map(name => ({ name, pickerImg: heroPickerImg(name), displayImg: heroDisplayImg(name) }));
const heroNameLookup = new Map(heroNames.map(name => [heroToFile(name), name]));

function normalizeStrikeSquad(value){
	if(!Array.isArray(value)) return [];

	return [...new Set(
		value
			.map(name => heroNameLookup.get(heroToFile(String(name))))
			.filter(Boolean)
	)];
}

let currentHero = null;
const LAST_SELECTED_HERO_KEY = "lastSelectedHero";

const roleMissionNames = {
	Vanguard: ["Damage Blocked", "KOs"],
	Duelist: ["Damage Dealt", "Final Kills"],
	Strategist: ["Healing", "KOs & Assists"]
};

const heroMissions = {
	"Adam Warlock": { 		role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 13, "5-9": 26, "10-14": 38, "15-70": 51 } },
	"Angela": { 			role: "Vanguard", 	mission2: { "1-4": 7500, "5-9": 15000, "10-14": 22000, "15-70": 30000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Black Cat": { 			role: "Duelist", 	mission2: { "1-4": 3700, "5-9": 7500, "10-14": 11000, "15-70": 15000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Black Panther": { 		role: "Duelist", 	mission2: { "1-4": 3700, "5-9": 7500, "10-14": 11000, "15-70": 15000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Black Widow": { 		role: "Duelist", 	mission2: { "1-4": 3100, "5-9": 6200, "10-14": 9200, "15-70": 12000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Blade": { 				role: "Duelist", 	mission2: { "1-4": 5100, "5-9": 10000, "10-14": 15000, "15-70": 20000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Bruce Banner": { 		role: "Vanguard", 	mission2: { "1-4": 10000, "5-9": 21000, "10-14": 31000, "15-70": 42000 }, mission3: { "1-4": 5, "5-9": 11, "10-14": 16, "15-70": 22 } },
	"Captain America": { 	role: "Vanguard", 	mission2: { "1-4": 9000, "5-9": 18000, "10-14": 27000, "15-70": 36000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Cloak & Dagger": { 	role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Cyclops": { 			role: "Duelist", 	mission2: { "1-4": 5700, "5-9": 11000, "10-14": 17000, "15-70": 23000 }, mission3: { "1-4": 6, "5-9": 11, "10-14": 17, "15-70": 23 } },
	"Daredevil": { 			role: "Duelist", 	mission2: { "1-4": 3700, "5-9": 7500, "10-14": 11000, "15-70": 15000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Deadpool": { 			role: "Special", 	mission2: { "1-4": 5700, "5-9": 11000, "10-14": 17000, "15-70": 23000 }, mission3: { "1-4": 5, "5-9": 30, "10-14": 45, "15-70": 60 }, 	mission2Name: "Damage and Healing", mission3Name: "KOs & Assists" },
	"Devil Dino": { 		role: "Vanguard", 	mission2: { "1-4": 14000, "5-9": 27000, "10-14": 41000, "15-70": 55000 }, mission3: { "1-4": 7, "5-9": 15, "10-14": 22, "15-70": 29 } },
	"Doctor Strange": { 	role: "Vanguard", 	mission2: { "1-4": 10000, "5-9": 21000, "10-14": 31000, "15-70": 42000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Elsa Bloodstone": { 	role: "Duelist", 	mission2: { "1-4": 5700, "5-9": 11000, "10-14": 17000, "15-70": 23000 }, mission3: { "1-4": 6, "5-9": 11, "10-14": 17, "15-70": 23 } },
	"Emma Frost": { 		role: "Vanguard", 	mission2: { "1-4": 10000, "5-9": 21000, "10-14": 31000, "15-70": 42000 }, mission3: { "1-4": 7, "5-9": 15, "10-14": 22, "15-70": 29 } },
	"Gambit": { 			role: "Strategist", mission2: { "1-4": 4500, "5-9": 9100, "10-14": 14000, "15-70": 18000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Groot": { 				role: "Vanguard", 	mission2: { "1-4": 14000, "5-9": 27000, "10-14": 41000, "15-70": 55000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Hawkeye": { 			role: "Duelist", 	mission2: { "1-4": 5100, "5-9": 10000, "10-14": 15000, "15-70": 20000 }, mission3: { "1-4": 6, "5-9": 11, "10-14": 17, "15-70": 23 } },
	"Hela": { 				role: "Duelist", 	mission2: { "1-4": 5700, "5-9": 11000, "10-14": 17000, "15-70": 23000 }, mission3: { "1-4": 7, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Human Torch": { 		role: "Duelist", 	mission2: { "1-4": 4400, "5-9": 8800, "10-14": 13000, "15-70": 18000 }, mission3: { "1-4": 4, "5-9": 8, "10-14": 12, "15-70": 17 } },
	"Invisible Woman": { 	role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Iron Fist": { 			role: "Duelist", 	mission2: { "1-4": 3100, "5-9": 6200, "10-14": 9200, "15-70": 12000 }, mission3: { "1-4": 4, "5-9": 8, "10-14": 12, "15-70": 17 } },
	"Iron Man": { 			role: "Duelist", 	mission2: { "1-4": 4400, "5-9": 8800, "10-14": 13000, "15-70": 18000 }, mission3: { "1-4": 4, "5-9": 8, "10-14": 12, "15-70": 17 } },
	"Jeff": {				role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 13, "5-9": 26, "10-14": 38, "15-70": 51 } },
	"Jubilee": { 			role: "Strategist", mission2: { "1-4": 6200, "5-9": 12000, "10-14": 18000, "15-70": 25000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Loki": { 				role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Luna Snow": { 			role: "Strategist", mission2: { "1-4": 6200, "5-9": 12000, "10-14": 18000, "15-70": 25000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
	"Magik": { 				role: "Duelist", 	mission2: { "1-4": 4400, "5-9": 8800, "10-14": 13000, "15-70": 18000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"Magneto": { 			role: "Vanguard", 	mission2: { "1-4": 9000, "5-9": 18000, "10-14": 27000, "15-70": 36000 }, mission3: { "1-4": 7, "5-9": 15, "10-14": 22, "15-70": 29 } },
	"Mantis": { 			role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 17, "5-9": 35, "10-14": 52, "15-70": 70 } },
	"Mister Fantastic": { 	role: "Duelist", 	mission2: { "1-4": 5100, "5-9": 10000, "10-14": 15000, "15-70": 20000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
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
	"The Hood": { 			role: "Vanguard", 	mission2: { "1-4": 9000, "5-9": 18000, "10-14": 27000, "15-70": 36000 }, mission3: { "1-4": 7, "5-9": 15, "10-14": 22, "15-70": 29 } },
	"The Punisher": { 		role: "Duelist", 	mission2: { "1-4": 5100, "5-9": 10000, "10-14": 15000, "15-70": 20000 }, mission3: { "1-4": 5, "5-9": 10, "10-14": 15, "15-70": 20 } },
	"The Thing": { 			role: "Vanguard", 	mission2: { "1-4": 10000, "5-9": 21000, "10-14": 31000, "15-70": 42000 }, mission3: { "1-4": 7, "5-9": 15, "10-14": 22, "15-70": 29 } },
	"Thor": { 				role: "Vanguard", 	mission2: { "1-4": 9000, "5-9": 18000, "10-14": 27000, "15-70": 36000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"Ultron": { 			role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 17, "5-9": 35, "10-14": 52, "15-70": 70 } },
	"Venom": { 				role: "Vanguard", 	mission2: { "1-4": 10000, "5-9": 21000, "10-14": 31000, "15-70": 42000 }, mission3: { "1-4": 6, "5-9": 13, "10-14": 19, "15-70": 25 } },
	"White Fox": {		 	role: "Strategist", mission2: { "1-4": 5400, "5-9": 11000, "10-14": 16000, "15-70": 21000 }, mission3: { "1-4": 15, "5-9": 30, "10-14": 45, "15-70": 60 } },
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
	let xp = 0;

	for(const b of XP_PER_REPEAT){
		if(level >= b.min && level <= b.max){
			xp = b.xp;
			break;
		}
	}

	if(modeToggle.checked && level >= 20){
		xp = 60;
	}

	return xp;
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

	let val = Math.min(Number(pointsSlider.value)||0, max);
	pointsSlider.value = val;
	pointsInput.value = val;

	maxPointsText.innerText = max;
}

pointsInput.addEventListener("input", ()=>{
	const max = Number(pointsSlider.max);
	let val = Math.min(Math.max(0, Number(pointsInput.value)||0), max);

	pointsInput.value = val;
	pointsSlider.value = val;
});

currentLevelInput.addEventListener("input", ()=>{
	limitCurrent();
	updateHeroPickerRanks();
});

targetLevelInput.addEventListener("blur", limitTarget);

pointsSlider.addEventListener("input", ()=>{
	pointsInput.value = pointsSlider.value;
	updateProficiencyUI();
	saveHeroInputs();
	updateHeroPickerRanks();
});

pointsInput.addEventListener("input", ()=>{
	saveHeroInputs();
});
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

// #region Strike Squad


let strikeSquad = JSON.parse(localStorage.getItem("strikeSquad")) || [];

function saveStrikeSquad(){
	localStorage.setItem("strikeSquad", JSON.stringify(strikeSquad));
}

const strikeSquadOnlyToggle = document.getElementById("strikeSquadOnly");
const strikeSquadFirstToggle = document.getElementById("strikeSquadFirst");

strikeSquadOnlyToggle.addEventListener("change", () => {
	renderHeroes(roleFilter.value, searchInput.value);
});

strikeSquadFirstToggle.addEventListener("change", () => {
	renderHeroes(roleFilter.value, searchInput.value);
});

// #endregion

// #region Hero Picker

function updateHeroPickerRanks(){
	document.querySelectorAll(".herocard").forEach(card => {
		const name = card.querySelector(".herocard-name")?.innerText;
		if(!name) return;

		const heroName = name
			.split(" ")
			.map(x => x[0] + x.slice(1).toLowerCase())
			.join(" ");

		const data = JSON.parse(localStorage.getItem(getHeroCommonKey(heroName)) || "{}");
		const rank = getRankFromLevel(Number(data.currentLevel) || 0);

		const img = card.querySelector(".herocard-rank");
		if(img && rank){
			img.src = `assets/badge/${rank.toLowerCase()}.png`;
		}
	});
}


function openPicker(){
	modal.style.display = "flex";
}

function goToHeroPicker(){
	if(window.location.pathname.endsWith("index.html") || window.location.pathname === "/"){
		openPicker();
		return;
	}

	window.location.href = "index.html?picker=true";
}

modal.onclick = e=>{
	if(e.target === modal){
		modal.style.display = "none";
	}
};

modal.onclick = e=>{ if(e.target===modal) modal.style.display="none"; }

document.querySelectorAll("[data-close-panel]").forEach(button => {
	button.addEventListener("click", e => {
		e.stopPropagation();
		document.getElementById(button.dataset.closePanel).style.display = "none";
	});
});


const roleFilter = document.getElementById("roleFilter");
const heroSort = document.getElementById("heroSort");

function getHeroCurrentLevel(heroName){
	const data = JSON.parse(localStorage.getItem(getHeroCommonKey(heroName)) || "{}");
	return Number(data.currentLevel) || 0;
}

function compareHeroes(a, b){
	const nameOrder = a.name.localeCompare(b.name);

	if(strikeSquadFirstToggle.checked){
		const strikeSquadOrder = Number(strikeSquad.includes(b.name)) - Number(strikeSquad.includes(a.name));
		if(strikeSquadOrder) return strikeSquadOrder;
	}

	if(heroSort.value === "level"){
		const levelOrder = getHeroCurrentLevel(b.name) - getHeroCurrentLevel(a.name);
		return levelOrder || nameOrder;
	}

	if(heroSort.value === "role"){
		const roleOrder = { Special: 0, Vanguard: 1, Duelist: 2, Strategist: 3 };
		const aRole = a.name === "Deadpool" ? "Special" : (heroMissions[a.name]?.role || "Special");
		const bRole = b.name === "Deadpool" ? "Special" : (heroMissions[b.name]?.role || "Special");
		return (roleOrder[aRole] - roleOrder[bRole]) || nameOrder;
	}

	return nameOrder;
}

function getRoleIcon(role){
	return {
		Vanguard: "assets/vanguard.png",
		Duelist: "assets/duelist.png",
		Strategist: "assets/strategist.png",
		Special: "assets/special.png"
	}[role] || "";
}

function renderHeroes(filter = "All", search = "") {
	search = search.toLowerCase().trim();

	heroGrid.innerHTML = "";

	heroes
		.filter(hero => {
		const heroRole = heroMissions[hero.name]?.role || "Special";

		return (hero.name === "Deadpool" || filter === "All" || heroRole === filter)
			&& hero.name.toLowerCase().includes(search)
			&& (!strikeSquadOnlyToggle.checked || strikeSquad.includes(hero.name));
	})
		.sort(compareHeroes)
		.forEach(hero => {
		const heroRole = heroMissions[hero.name]?.role || "Special";

		const card = document.createElement("div");
		card.className = "herocard";
		card.addEventListener("mouseenter", () => {
			cursorImg.src = card.classList.contains("strike-selected")
				? "assets/cursor-removess.png"
				: "assets/cursor-addss.png";

			cursorImg.style.display = "block";
		});

		card.addEventListener("mouseleave", () => {
			cursorImg.style.display = "none";
		});
		if(strikeSquad.includes(hero.name)){
			card.classList.add("strike-selected");
		}
		const rank = getRankFromLevel(
			Number(localStorage.getItem(getHeroCommonKey(hero.name)) 
			? JSON.parse(localStorage.getItem(getHeroCommonKey(hero.name))).currentLevel 
			: 0)
		);

		card.innerHTML = `
			<div class="herocard-bg">
				<img src="${hero.pickerImg}" class="herocard-img">

				<div class="herocard-holder">
					<div class="herocard-info">

						<div class="herocard-inforow1">
							<p class="herocard-name">${hero.name.toUpperCase()}</p>
							<img class="herocard-role" src="${getRoleIcon(heroRole)}">
						</div>

						<div class="herocard-inforow2">
							<img class="herocard-rank" src="assets/badge/${rank.toLowerCase()}.png">
							<img class="herocard-ss" src="${strikeSquad.includes(hero.name) ? "assets/strikesquadyellow.png" : ""}" style="display:${strikeSquad.includes(hero.name) ? "block" : "none"}">
						</div>

					</div>
				</div>
			</div>
		`;

		card.onclick = () => selectHero(hero);

		card.oncontextmenu = e => {
			e.preventDefault();
			e.stopPropagation();

			const index = strikeSquad.indexOf(hero.name);

			if(index === -1){
				strikeSquad.push(hero.name);
			}else{
				strikeSquad.splice(index, 1);
			}

			saveStrikeSquad();
			queueSupabaseSync();
			renderHeroes(filter, search);
		};

		heroGrid.appendChild(card);
	});
}

renderHeroes();
const searchInput = document.getElementById("SearchInput");




roleFilter.addEventListener("change", () => {
	renderHeroes(roleFilter.value, searchInput.value);
});

heroSort.addEventListener("change", () => {
	renderHeroes(roleFilter.value, searchInput.value);
});

searchInput.addEventListener("input", () => {
	renderHeroes(roleFilter.value, searchInput.value);
});

function selectHero(hero){
	currentHero=hero;
	localStorage.setItem(LAST_SELECTED_HERO_KEY, hero.name);
	heroName.innerText=hero.name;
	heroImg.src=hero.displayImg;
	modal.style.display="none";
	buildMissionInputs(hero);
	loadHeroInputs();

	const heroBg = document.getElementById("heroBg");
	heroBg.style.backgroundImage = `url('assets/shadow/${heroToFile(hero.name)}.png')`;

	const herobgcolor = document.getElementById("herobgcolor");
	herobgcolor.style.backgroundImage = `url('assets/background/${heroToFile(hero.name)}.png')`;

	const herologo = document.getElementById("herologo");
	herologo.style.backgroundImage = `url('assets/logo/${heroToFile(hero.name)}.png')`;

	mainInputs.style.display = "flex";
	noHeroMessage.style.display = "none";
	selectHeroText.style.display = "none";
	saveURLState();
	continueTutorialAfterHeroSelection();

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

	let missionInputs = "";
	const right = document.querySelector(".right");
	if(!isMobileLayout()){
		right.style.height = "600px";
		right.style.marginTop = "calc((100vh - 600px) / 2)";
	}else{
		right.style.height = "";
		right.style.marginTop = "";
	}

	if(role === "Strategist"){
		missionInputs = `
			<div class="input-field input-mission">
				<input type="number" id="missionKO" required spellcheck="false">
				<label>KOs per 10 minutes</label>
			</div>

			<div class="input-field input-mission">
				<input type="number" id="missionAssist" required spellcheck="false">
				<label>Assists per 10 minutes</label>
			</div>
		`;
	}else if(hero.name === "Deadpool"){
		missionInputs = `
			<div class="input-field input-mission">
				<input type="number" id="missionDamage" required spellcheck="false">
				<label>Damage per 10 minutes</label>
			</div>

			<div class="input-field input-mission">
				<input type="number" id="missionHealing" required spellcheck="false">
				<label>Healing per 10 minutes</label>
			</div>

			<div class="input-field input-mission">
				<input type="number" id="missionKO" required spellcheck="false">
				<label>KOs per 10 minutes</label>
			</div>

			<div class="input-field input-mission">
				<input type="number" id="missionAssist" required spellcheck="false">
				<label>Assists per 10 minutes</label>
			</div>
		`;

		if(hero.name === "Deadpool" && !isMobileLayout()){
			right.style.height = "670px";
			right.style.marginTop = "calc((100vh - 670px) / 2)";
		}
	}else{
		const mission3Name = heroMissions[hero.name]?.mission3Name || roleMissionNames[role]?.[1] || "Mission 3";

		missionInputs = `
			<div class="input-field input-mission">
				<input type="number" id="mission3" required spellcheck="false">
				<label>${mission3Name} per 10 minutes</label>
			</div>
		`;
	}



	const mission2Input = hero.name === "Deadpool" ? "" : `
		<div class="input-field input-mission">
			<input type="number" id="mission2" required spellcheck="false">
			<label>${mission2Name} per 10 minutes</label>
		</div>
	`;

	wrap.innerHTML = `
	<div class="missioncal-holder">

		${mission2Input}

		${missionInputs}

	</div>







	<button class="calculate" id="calculate" onclick="simulate()">
		<div class="yellowleft"></div>
		<div class="yellowmiddle" id="calculateText">Calculate</div>
		<div class="yellowright"></div>
	</button>
	`;
	const button = document.getElementById("calculate");

	button.addEventListener("mouseenter", playButtonAnimation);
}
document.addEventListener("input", (e) => {
	if(e.target.id === "mission2" || e.target.id === "mission3"){
		e.target.value = Math.floor(e.target.value);
	}

	if(e.target.classList.contains("input-error")){
		e.target.classList.remove("input-error");
	}
});

document.addEventListener("focusin", (e)=>{
	if(e.target.classList.contains("input-error")){
		e.target.classList.remove("input-error");
	}
});

// #endregion

// #region Hero Save Data

function getHeroCommonKey(heroName){
	return `heroCommon_${heroName}`;
}

function getHeroModeKey(heroName){
	const mode = modeToggle.checked ? "arcade" : "normal";
	return `heroMode_${heroName}_${mode}`;
}

function getSavedHeroModeData(heroName){
	const key = getHeroModeKey(heroName);
	const legacyKey = key.replace("_normal", "_classic");
	const saved = localStorage.getItem(key) ?? localStorage.getItem(legacyKey) ?? "{}";
	return JSON.parse(saved);
}

function saveHeroInputs(){
	if(!currentHero) return;

	const commonData = {
		currentLevel: currentLevelInput.value,
		targetLevel: targetLevelInput.value,
		points: pointsSlider.value
	};

	localStorage.setItem(
		getHeroCommonKey(currentHero.name),
		JSON.stringify(commonData)
	);


	const modeData = {
		currentLevel: currentLevelInput.value,
		targetLevel: targetLevelInput.value,
		points: pointsSlider.value,
		mission2: document.getElementById("mission2")?.value || "",
		mission3: document.getElementById("mission3")?.value || "",
		missionKO: document.getElementById("missionKO")?.value || "",
		missionAssist: document.getElementById("missionAssist")?.value || "",
		missionDamage: document.getElementById("missionDamage")?.value || "",
		missionHealing: document.getElementById("missionHealing")?.value || "",
	};

	localStorage.setItem(
		getHeroModeKey(currentHero.name),
		JSON.stringify(modeData)
	);
}


function loadHeroInputs(){
	if(!currentHero) return;


	const commonData = JSON.parse(localStorage.getItem(getHeroCommonKey(currentHero.name)) || "{}");
	const modeData = getSavedHeroModeData(currentHero.name);

	currentLevelInput.value = modeData.currentLevel ?? commonData.currentLevel ?? "";
	targetLevelInput.value = modeData.targetLevel ?? commonData.targetLevel ?? "";

	updateProficiencyUI();

	pointsSlider.value = modeData.points ?? commonData.points ?? 0;
	pointsInput.value = modeData.points ?? commonData.points ?? 0;


	currentLevelInput.dispatchEvent(new Event("input"));
	targetLevelInput.dispatchEvent(new Event("input"));
	
	const mission2 = document.getElementById("mission2");
	const mission3 = document.getElementById("mission3");

	if(mission2) mission2.value = modeData.mission2 || "";
	if(mission3) mission3.value = modeData.mission3 || "";
	const missionKO = document.getElementById("missionKO");
	const missionAssist = document.getElementById("missionAssist");
	const missionDamage = document.getElementById("missionDamage");
	const missionHealing = document.getElementById("missionHealing");

	if(missionKO) missionKO.value = modeData.missionKO || "";
	if(missionAssist) missionAssist.value = modeData.missionAssist || "";
	if(missionDamage) missionDamage.value = modeData.missionDamage || "";
	if(missionHealing) missionHealing.value = modeData.missionHealing || "";
}


document.addEventListener("input", e=>{
	if([
		"currentLevel",
		"targetLevel",
		"mission2",
		"mission3",
		"missionDamage",
		"missionHealing",
		"missionKO",
		"missionAssist",
		"pointsInput",
		"pointsSlider"
	].includes(e.target.id)){
		saveHeroInputs();
		queueSupabaseSync();
	}
});

modeToggle.addEventListener("change", ()=>{
	const previousMode = modeToggle.checked;

	modeToggle.checked = !previousMode;
	saveHeroInputs();

	modeToggle.checked = previousMode;
	loadHeroInputs();

	simulate();
	queueSupabaseSync();
});

// #endregion

// #region Simulation
function validateInputs(){
    let valid = true;

	playButtonAnimation()

	const inputs = [
		currentLevelInput,
		targetLevelInput,
		document.getElementById("mission2"),
		document.getElementById("mission3"),
		document.getElementById("missionKO"),
		document.getElementById("missionAssist"),
		document.getElementById("missionDamage"),
		document.getElementById("missionHealing")
	].filter(Boolean);

    inputs.forEach(input => {
        if(!input || input.value === ""){
            input.classList.add("input-error");
            valid = false;
        }
    });

    const warningId = "emptyFieldsWarning";
    let warning = document.getElementById(warningId);
    if(!valid){
        if(!warning){
            warning = document.createElement("div");
            warning.id = warningId;
            warning.style.color = "red";
            warning.style.fontWeight = "bold";
			warning.style.display = "flex";
			warning.style.justifyContent = "center";
            warning.innerText = "Some fields are empty, so the result will be inaccurate.";
            mainInputs.appendChild(warning);
        }
    } else if(warning){
        warning.remove();
    }

    return true; 
}

function simulate(){

/*  Lattice
	const latticeEl = document.querySelector(".latticedisplay p");

	if(!latticeEl) return;

	let current = parseInt(latticeEl.innerText) || 0;

	current -= 100;

	if(current == 0){
		alert("April Fools!");
	}

	latticeEl.innerText = current;
 */
	calcClicks++;

	if(!validateInputs()) return;

	if(calcClicks === 10){
		useOldBadges = true;
		document.querySelectorAll(".rankpicker input").forEach(input=>{
			input.dispatchEvent(new Event("input"));
		});
		console.log("Easter egg unlocked");
		showRetroPopup();
	}
	if(calcClicks === 66){
		useOldBadges = true;
		document.querySelectorAll(".rankpicker input").forEach(input=>{
			input.dispatchEvent(new Event("input"));
		});
		console.log("Easter egg unlocked");
		Order66();
	}

	if(!currentHero){ alert("Pick a hero first."); return; }

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

	let mission2Input;
	let mission3Input;

	if(currentHero.name === "Deadpool"){
		const damage = Number(document.getElementById("missionDamage")?.value || 0);
		const healing = Number(document.getElementById("missionHealing")?.value || 0);
		const ko = Number(document.getElementById("missionKO")?.value || 0);
		const assists = Number(document.getElementById("missionAssist")?.value || 0);

		mission2Input = damage + healing;
		mission3Input = ko + assists;
	}
	else if(role === "Strategist"){
		mission2Input = Number(document.getElementById("mission2")?.value || 0);

		const ko = Number(document.getElementById("missionKO")?.value || 0);
		const assists = Number(document.getElementById("missionAssist")?.value || 0);

		mission3Input = ko + assists;
	}
	else{
		mission2Input = Number(document.getElementById("mission2")?.value || 0);
		mission3Input = Number(document.getElementById("mission3")?.value || 0);
	}

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
Time needed: ${Math.floor(minutes/60)}h ${minutes%60}m
Points needed: ${pointsrequired}`;

	result2.innerText=`Missions Completed:
    Play for 15 min: ${completed.time} times
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
setupPanel("#about", "aboutPanel");
setupPanel(".settings", "settingsPanel");
setupPanel("#discordBot", "discordBotPanel");



// #region First-visit tutorial
const TUTORIAL_COMPLETE_KEY = "proficiencyTutorialComplete";
const tutorialHeroButton = document.querySelector(".herobutton");
const playTutorialButton = document.getElementById("playTutorial");
let tutorialBubble;
let tutorialTarget;
let tutorialStep = -1;
let tutorialActive = false;
let tutorialWaitingForHero = false;

const tutorialSteps = [
	{ target: "#currentLevel", side: "top-left", text: "Check your in-game statistics, then enter your current level." },
	{ target: "#targetLevel", side: "top-right", text: "Enter the level you want to reach." },
	{ target: "#dynamicInputs .missioncal-holder", side: "top-left", text: "Enter your mission statistics per 10 minutes." },
	{ target: "#calculate", side: "top-right", text: "Click Calculate to see the results." }
];

function getTutorialBubble(){
	if(!tutorialBubble){
		tutorialBubble = document.createElement("div");
		tutorialBubble.className = "tutorial-bubble tutorial-bubble--top-right";
		tutorialBubble.innerHTML = '<span class="tutorial-bubble-text"></span><button class="tutorial-bubble-check" type="button" aria-label="Continue tutorial"></button>';
		tutorialBubble.querySelector(".tutorial-bubble-check").addEventListener("click", advanceTutorial);
		document.body.appendChild(tutorialBubble);
	}
	return tutorialBubble;
}

function positionTutorialBubble(target, side = "top-right"){
	const bubble = getTutorialBubble();
	const rect = target.getBoundingClientRect();
	const bubbleWidth = 208;
	const bubbleHeight = 92;
	const bubbleLeft = side === "top-left" ? rect.left - 20 : rect.right - bubbleWidth + 28;
	const left = Math.max(8, Math.min(window.innerWidth - bubbleWidth - 8, bubbleLeft));
	const top = Math.max(8, Math.min(window.innerHeight - bubbleHeight - 8, rect.bottom + 12));
	bubble.style.left = `${left}px`;
	bubble.style.top = `${top}px`;
}

function showTutorialBubble(target, text, side = "top-right"){
	if(tutorialTarget) tutorialTarget.classList.remove("tutorial-target");
	tutorialTarget = target;
	tutorialTarget.classList.add("tutorial-target");
	const bubble = getTutorialBubble();
	bubble.className = `tutorial-bubble tutorial-bubble--${side}`;
	bubble.querySelector(".tutorial-bubble-text").textContent = text;
	bubble.hidden = false;
	positionTutorialBubble(target, side);
}

function hideTutorialBubble(){
	if(tutorialBubble) tutorialBubble.hidden = true;
	if(tutorialTarget) tutorialTarget.classList.remove("tutorial-target");
	tutorialTarget = null;
}

function startTutorial(){
	if(!tutorialHeroButton) return;
	tutorialActive = true;
	tutorialWaitingForHero = false;
	tutorialStep = -1;
	showTutorialBubble(tutorialHeroButton, "First, select a hero.", "top-left");
}

function showTutorialStep(step){
	const config = tutorialSteps[step];
	const target = config && document.querySelector(config.target);
	if(!target) return;
	tutorialStep = step;
	showTutorialBubble(target, config.text, config.side);
}

function advanceTutorial(){
	if(!tutorialActive) return;

	if(tutorialStep === -1){
		tutorialWaitingForHero = true;
		hideTutorialBubble();
		goToHeroPicker();
		return;
	}

	const nextStep = tutorialStep + 1;
	if(nextStep < tutorialSteps.length){
		showTutorialStep(nextStep);
		return;
	}

	hideTutorialBubble();
	tutorialActive = false;
	localStorage.setItem(TUTORIAL_COMPLETE_KEY, "true");
}

function continueTutorialAfterHeroSelection(){
	if(tutorialActive && tutorialWaitingForHero){
		tutorialWaitingForHero = false;
		showTutorialStep(0);
	}
}

window.addEventListener("resize", () => {
	if(tutorialActive && tutorialTarget){
		const side = tutorialStep === -1 ? "top-left" : tutorialSteps[tutorialStep].side;
		positionTutorialBubble(tutorialTarget, side);
	}
});

playTutorialButton?.addEventListener("click", () => {
	document.getElementById("infoPanel").style.display = "none";
	startTutorial();
});
// #endregion

function showRetroPopup(){
	const div = document.createElement("div");
	div.className = "retro-popup";
	div.innerText = "Retro Mode Activated!";

	document.body.appendChild(div);

	requestAnimationFrame(()=>div.classList.add("show"));

	setTimeout(()=>{
		div.classList.remove("show");
		setTimeout(()=>div.remove(), 300);
	}, 1200);
}

function Order66(src){
	const div = document.createElement("div");
	div.className = "retro-popup";
	div.innerText = "Execute Order 66";

	document.body.appendChild(div);

	requestAnimationFrame(()=>div.classList.add("show"));

	const audio = new Audio("assets/order66.mp3");
	audio.play();
	setTimeout(()=>{
		div.classList.remove("show");
		setTimeout(()=>div.remove(), 300);
	}, 1200);
}

const mainInputs = document.getElementById("mainInputs");
const readGuideText = document.getElementById("readGuideText");
const selectHeroText = document.getElementById("selectHeroText");
const noHeroMessage = document.getElementById("noHeroMessage");

mainInputs.style.display = "none";

readGuideText.onclick = () => {
	document.getElementById("infoPanel").style.display = "flex";
};
selectHeroText.onclick = () => {
	document.getElementById("modal").style.display = "flex";
};


console.log(
	"%cExecute Order 66",
	"color:#FF0000;font-size:64px;font-weight:bold;"
);

console.log(
	"%cCyberbond Fix? Return of OG Cyber Snare?",
	"color:#FF9900;font-size:16px;font-weight:bold;"
);

console.log(
	"%cNIGHTCRAWLER WHEN? 👀",
	"color:#0055FF;font-size:24px;font-weight:bold;"
);

console.log(
	"%cBuy me a coffee ☕👉👈💙",
	"color:#FEE75C;font-size:12px;font-weight:bold;"
);

console.log(
	"%cYou can also check my GitHub page😅",
	"color:#FFFFFF;font-size:20px; font-weight:bold;"
);


// #endregion

// #region Visual Effects

function playButtonAnimation() {
	const button = document.getElementById("calculate");

	const img = document.createElement("img");

	img.src = "assets/lightning.gif?t=" + Date.now();
	img.style.position = "absolute";
	img.style.inset = "0";
	img.style.width = "100%";
	img.style.height = "100%";
	img.style.opacity = "50%";
	img.style.objectFit = "cover";
	img.style.pointerEvents = "none";

	button.style.position = "relative";
	button.style.overflow = "hidden";

	button.appendChild(img);

	setTimeout(() => {
		img.remove();
	}, 1000);
}
function playButtonAnimation2() {
	const addtodiscord = document.getElementById("addtodiscord");

	const img = document.createElement("img");

	img.src = "assets/lightning.gif?t=" + Date.now();
	img.style.position = "absolute";
	img.style.inset = "0";
	img.style.width = "100%";
	img.style.height = "100%";
	img.style.opacity = "0.5";
	img.style.objectFit = "cover";
	img.style.pointerEvents = "none";

	addtodiscord.style.position = "relative";
	addtodiscord.style.overflow = "hidden";

	addtodiscord.appendChild(img);

	setTimeout(() => {
		img.remove();
	}, 1000);
}

const addtodiscord = document.getElementById("addtodiscord");

addtodiscord.addEventListener("mouseenter", playButtonAnimation2);
addtodiscord.addEventListener("click", playButtonAnimation2);



const cursorImg = document.getElementById("cursorImg");

document.addEventListener("mousemove", e => {
	cursorImg.style.left = (e.clientX + 10) + "px";
	cursorImg.style.top = (e.clientY + 10) + "px";
});

//#endregion

// #region URL Save

function saveURLState(){
	const params = new URLSearchParams();

	if(currentHero){
		params.set("hero", currentHero.name);
	}

	history.replaceState(null, "", params.toString() ? "?" + params.toString() : window.location.pathname);
}


function loadURLState(){
	const params = new URLSearchParams(window.location.search);

	const savedHeroName = localStorage.getItem(LAST_SELECTED_HERO_KEY);
	const requestedHeroName = params.get("hero") || savedHeroName;

	if(requestedHeroName){
		const hero = heroes.find(h => h.name === requestedHeroName);

		if(hero){
			selectHero(hero);
		}
	}

	if(params.get("picker") === "true"){
		openPicker();
	}
}


currentLevelInput.addEventListener("input", saveURLState);
targetLevelInput.addEventListener("input", saveURLState);
pointsSlider.addEventListener("input", saveURLState);
pointsInput.addEventListener("input", saveURLState);
modeToggle.addEventListener("change", saveURLState);

// #endregion

// #region Save File


const savefiledelete = document.getElementById("savefiledelete");


function clearCalculatorData() {
	const keys = [];

	for(let i = 0; i < localStorage.length; i++){
		const key = localStorage.key(i);

		if(
			key.startsWith("hero") ||
			key === "strikeSquad" ||
			key === LAST_SELECTED_HERO_KEY
		){
			keys.push(key);
		}
	}

	keys.forEach(key => localStorage.removeItem(key));

	strikeSquad = [];
}


savefiledelete.onclick = async () => {
	const confirmClear = confirm(
		"Warning: this will delete your local save file."
	);

	if(!confirmClear) return;

	clearCalculatorData();

	if(currentUser){
		await pushToSupabase();
	}

	location.reload();
};


const saveFileExport = document.getElementById("savefileexport");
const saveFileImport = document.getElementById("savefileimport");

saveFileExport.onclick = () => {
	const data = buildSupabaseDataFromLocalStorage();

	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json"
	});

	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = "proficiency-calculator.json";

	document.body.appendChild(a);
	a.click();
	a.remove();

	setTimeout(() => URL.revokeObjectURL(a.href), 100);
};


saveFileImport.onclick = () => {
	const input = document.createElement("input");
	input.type = "file";
	input.accept = "application/json";

	input.addEventListener("change", () => {
		const file = input.files[0];
		if(!file) return;

		if(file.size > 1024 * 1024){
			alert("Save file is too large. Please import a JSON file under 1 MB.");
			return;
		}

		const reader = new FileReader();

		reader.onload = async () => {
			let data;

			try {
				data = JSON.parse(reader.result);
			} catch (error) {
				alert("Invalid JSON save file.");
				return;
			}

			if(data && typeof data.heroes === "object"){
				syncSupabaseToLocalStorage(data);
			} else if(data && typeof data === "object") {
				Object.entries(data).forEach(([key, value]) => {
					if(typeof value === "string") localStorage.setItem(key, value);
				});
			} else {
				alert("Invalid proficiency save file.");
				return;
			}

			if(currentUser){
				await pushToSupabase();
			}

			location.reload();
		};

		reader.readAsText(file);
	});

	document.body.appendChild(input);
	input.click();
	input.remove();
};
// #endregion

// #region Supabase & Discord OAuth Setup

const SUPABASE_URL="https://sefbznbeybvgovzzzfdy.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmJ6bmJleWJ2Z292enp6ZmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNTk0OTMsImV4cCI6MjEwMDYzNTQ5M30.-sVoPGKvW3X-YakJ9ZEMfNm3UDy02rbnYQ32MzRcfus";




const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


let currentUser = null;
let saveDebounceTimer = null;

async function initSupabaseAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        handleUserLogin(session.user);
    }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
            await handleUserLogin(session.user);
        } else if (event === "SIGNED_OUT") {
            currentUser = null;
            updateAuthUI(null);
        }
    });
}

async function loginWithDiscord() {
	console.log("Starting Discord login");

	const { data, error } = await supabaseClient.auth.signInWithOAuth({
		provider: "discord",
		options: {
			redirectTo: window.location.origin + window.location.pathname
		}
	});

	console.log("OAuth result:", data, error);

	if(error){
		console.error("Discord Login Error:", error.message);
	}
}

async function logoutDiscord() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    updateAuthUI(null);
}

async function handleUserLogin(user) {
    currentUser = user;
	const userId = user.id;
	const discordId =
		currentUser.user_metadata?.provider_id ||
		currentUser.user_metadata?.sub;

    updateAuthUI(user);


	const { data: profile, error } = await supabaseClient
		.from("profiles")
		.select("data")
		.eq("user_id", user.id)
		.single();

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching Supabase profile:", error.message);
        return;
    }

	if(profile && profile.data){
		syncSupabaseToLocalStorage(profile.data);

		renderHeroes(roleFilter.value, searchInput.value);

		if(currentHero){
			loadHeroInputs();
		}

		updateHeroPickerRanks();
	} else {
        await pushToSupabase();
    }
}

function updateAuthUI(user) {
	const authBtn = document.getElementById("discordAuthBtn");
	const profilePics = document.querySelectorAll(".profile-img");
	const profileNames = document.querySelectorAll(".profile-name");
	const discordpfp = document.querySelectorAll(".discordpfp")
	const loginwarning = document.querySelectorAll(".loginwarning")

	if(!authBtn) return;

	if(user){
		const username =
			user.user_metadata?.full_name ||
			user.user_metadata?.global_name ||
			user.user_metadata?.preferred_username ||
			user.user_metadata?.name ||
			"Discord User";

		const avatar =
			user.user_metadata?.avatar_url ||
			user.user_metadata?.picture;

		profileNames.forEach(profileName => {
			profileName.textContent = "Logged in as " + username;
		});

		loginwarning.forEach(warning => {
			warning.style.display = "none";
		});

		profilePics.forEach(profilePic => {
			if(avatar){
				profilePic.src = avatar;
				profilePic.style.display = "block";
			}else{
				profilePic.src = "";
				profilePic.style.display = "none";
			}
		});

		authBtn.textContent = "Logout";
	}else{
		profileNames.forEach(profileName => {
			profileName.textContent = "Connect with Discord";
		});

		profilePics.forEach(profilePic => {
			profilePic.src = "assets/profiledefault.png";
			profilePic.style.display = "block";
		});

		discordpfp.forEach(profilePic => {
			profilePic.src = "assets/discordpfp.png";
			profilePic.style.display = "block";
		});

		loginwarning.forEach(warning => {
			warning.style.display = "block";
		});

		authBtn.textContent = "Login";
	}
}

function buildSupabaseDataFromLocalStorage() {
    const heroData = { heroes: {} };

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key.startsWith("heroCommon_")) {
            const heroName = key.replace("heroCommon_", "");
            const parsed = JSON.parse(localStorage.getItem(key) || "{}");

            if (!heroData.heroes[heroName]) heroData.heroes[heroName] = { modes: {} };

            heroData.heroes[heroName].currentLevel = Number(parsed.currentLevel) || 1;
            heroData.heroes[heroName].targetLevel = Number(parsed.targetLevel) || 1;
            heroData.heroes[heroName].points = Number(parsed.points) || 0;
        }


        if (key.startsWith("heroMode_")) {
            const parts = key.split("_");
            if (parts.length >= 3) {
                const heroName = parts[1];
                const rawMode = parts[2];
				if (rawMode === "classic" && localStorage.getItem(`heroMode_${heroName}_normal`)) {
					continue;
				}
				const dbMode = rawMode === "classic" ? "normal" : rawMode;
                const parsed = JSON.parse(localStorage.getItem(key) || "{}");

                if (!heroData.heroes[heroName]) heroData.heroes[heroName] = { modes: {} };
                if (!heroData.heroes[heroName].modes) heroData.heroes[heroName].modes = {};

				heroData.heroes[heroName].modes[dbMode] = {
					...(heroData.heroes[heroName].modes[dbMode] || {}),
					currentLevel: Number(parsed.currentLevel) || 0,
					targetLevel: Number(parsed.targetLevel) || 0,
					points: Number(parsed.points) || 0,
					mission2: Number(parsed.mission2) || 0,
					mission3: Number(parsed.mission3) || 0,
					mission4: Number(parsed.mission4) || 0,
					mission5: Number(parsed.mission5) || 0,
					missionKO: Number(parsed.missionKO) || 0,
					missionAssist: Number(parsed.missionAssist) || 0,
					missionDamage: Number(parsed.missionDamage) || 0,
					missionHealing: Number(parsed.missionHealing) || 0
				};

                heroData.heroes[heroName].lastGameMode = dbMode;
            }
        }
    }
	heroData.strikeSquad = normalizeStrikeSquad(JSON.parse(
		localStorage.getItem("strikeSquad") || "[]"
	));
    return heroData;
}

function syncSupabaseToLocalStorage(dbData) {
    if (!dbData) return;

    if(Array.isArray(dbData.strikeSquad)){
        strikeSquad = normalizeStrikeSquad(dbData.strikeSquad);
        localStorage.setItem("strikeSquad", JSON.stringify(strikeSquad));
    }

    if (!dbData.heroes) return;

    Object.entries(dbData.heroes).forEach(([heroName, data]) => {
        const commonData = {
            currentLevel: data.currentLevel || 1,
            targetLevel: data.targetLevel || 1,
            points: data.points || 0
        };
        localStorage.setItem(`heroCommon_${heroName}`, JSON.stringify(commonData));

        if (data.modes) {
            Object.entries(data.modes).forEach(([modeName, modeValues]) => {
				const localMode = modeName;
				const isDeadpool = heroName === "Deadpool";
				const isStrategist = heroMissions[heroName]?.role === "Strategist";

				const missionDamage = modeValues.missionDamage ?? (isDeadpool ? modeValues.mission2 : "");
				const missionHealing = modeValues.missionHealing ?? (isDeadpool ? modeValues.mission3 : "");
				const missionKO = modeValues.missionKO ?? ((isDeadpool || isStrategist) ? (isDeadpool ? modeValues.mission4 : modeValues.mission3) : "");
				const missionAssist = modeValues.missionAssist ?? ((isDeadpool || isStrategist) ? (isDeadpool ? modeValues.mission5 : modeValues.mission4) : "");
				const modeData = {
					currentLevel: modeValues.currentLevel ?? data.currentLevel ?? "",
					targetLevel: modeValues.targetLevel ?? data.targetLevel ?? "",
					points: modeValues.points ?? data.points ?? 0,
					mission2: modeValues.mission2 || "",
					mission3: modeValues.mission3 || "",
					mission4: modeValues.mission4 || "",
					mission5: modeValues.mission5 || "",
					missionKO: missionKO || "",
                    missionAssist: missionAssist || "",
                    missionDamage: missionDamage || "",
                    missionHealing: missionHealing || ""
                };
                localStorage.setItem(`heroMode_${heroName}_${localMode}`, JSON.stringify(modeData));
            });
        }
    });
}

async function pushToSupabase() {
    if (!currentUser) return;

	const userId = currentUser.id;
	const discordId =
		currentUser.user_metadata?.provider_id ||
		currentUser.user_metadata?.sub;
    const payload = buildSupabaseDataFromLocalStorage();


    const { error } = await supabaseClient
        .from("profiles")
		.upsert({
			user_id: userId,
			discord_id: discordId,
			data: payload
		}, { onConflict: "user_id", ignoreDuplicates: false });

	console.log({
		currentUser,
		userId,
		discordId,
		payload
	});

    if (error) console.error("Error saving to Supabase:", error.message);
}

function queueSupabaseSync() {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
        pushToSupabase();
    }, 1000);
}


const btn = document.getElementById("discordAuthBtn");


document.getElementById("discordAuthBtn").addEventListener("click", () => {
	if(currentUser){
		logoutDiscord();
	}else{
		loginWithDiscord();
	}
});

// #endregion
















loadURLState();
initSupabaseAuth();

if(!localStorage.getItem(TUTORIAL_COMPLETE_KEY)) startTutorial();
