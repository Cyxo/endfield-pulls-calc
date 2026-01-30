
const STANDARD = ["Ardelia", "Ember", "Last Rite", "Lifeng", "Pogranichnik"]

class Banner {
    constructor (name, pullsName, uprateChar, otherChars) {
        this.name = name;
        this.pullsName = pullsName;
        this.uprateChar = uprateChar;
        this.otherChars = otherChars.concat(STANDARD);
    }
}

const BANNERS = [
    new Banner(
        "Scars of the Forge",
        "Firewalker's Trail",
        "Laevatain",
        ["Gilberta", "Yvonne"]
    ),
    new Banner(
        "The Floaty Messenger",
        "Firewalker's Trail",
        "Gilberta",
        ["Laevatain", "Yvonne"]
    ),
    new Banner(
        "Scars of the Forge",
        "Firewalker's Trail",
        "Yvonne",
        ["Laevatain", "Gilberta"]
    ),
]


let model = JSON.parse(localStorage.getItem("efpSave"));
if (model === null) {
    model = {
        hhPermits: 17,
        nhzPermits: 5,
        nhz10Permits: 0,
        origeometry: 34,
        oriBP: true,
        oroberyl: 18175,
        selectedBann: BANNERS[0].uprateChar,
        pity: 0,
        pullsToUse: 0,
        charCopies: 1,
        nbSimu: 1000000
    }
}

function loadData() {
    document.querySelector("#hh-permit").value = model.hhPermits;
    document.querySelector("#nhz-permit").value = model.nhzPermits;
    document.querySelector("#nhz-10-permit").value = model.nhz10Permits;
    document.querySelector("#origeometry").value = model.origeometry;
    document.querySelector("#keepOriBP").checked = model.oriBP;
    document.querySelector("#convertAllOri").checked = !model.oriBP;
    document.querySelector("#oroberyl").value = model.oroberyl;

    for (let bann of BANNERS) {
        opt = document.createElement("option");
        opt.value = bann.uprateChar;
        opt.innerText = bann.uprateChar + " - " + bann.name;
        document.querySelector("#banner").appendChild(opt);
    }
    document.querySelector("#banner").value = model.selectedBann;
    document.querySelector("#pity").value = model.pity;
    document.querySelector("#pullsToUse").value = model.pullsToUse;
    document.querySelector("#charCopies").value = model.charCopies;
    document.querySelector("#nbSimu").value = model.nbSimu;
}

function saveData() {
    model.hhPermits = parseInt(document.querySelector("#hh-permit").value);
    model.nhzPermits = parseInt(document.querySelector("#nhz-permit").value);
    model.nhz10Permits = parseInt(document.querySelector("#nhz-10-permit").value);
    model.origeometry = parseInt(document.querySelector("#origeometry").value);
    model.oriBP = document.querySelector("#keepOriBP").checked;
    model.oroberyl = parseInt(document.querySelector("#oroberyl").value);

    model.selectedBann = document.querySelector("#banner").value;
    model.pity = parseInt(document.querySelector("#pity").value);
    model.pullsToUse = parseInt(document.querySelector("#pullsToUse").value);
    model.charCopies = parseInt(document.querySelector("#charCopies").value);
    model.nbSimu = parseInt(document.querySelector("#nbSimu").value);

    localStorage.setItem("efpSave", JSON.stringify(model));
}

function updateTotalPulls() {
    saveData();
    let origeometry = model.origeometry;
    if (origeometry % 75 === 0 && origeometry > 150) {
        origeometry = Math.floor(origeometry / 75);
    }
    if (model.oriBP) {
        origeometry = Math.max(origeometry - 29, 0);
    }
    let totalPulls = model.hhPermits + model.nhzPermits + model.nhz10Permits*10 + Math.floor((model.oroberyl + origeometry * 75) / 500);
    document.querySelector("#totalPulls").innerText = totalPulls;
    document.querySelector("#pullsToUse").value = totalPulls;
}

function updateBannerDescription() {
    saveData();
    const bann = BANNERS.find(b => b.uprateChar == model.selectedBann);
    document.querySelectorAll(".pulls-name").forEach(el => el.innerText = bann.pullsName);
    document.querySelectorAll(".uprate-icon").forEach(el => el.src = `img/char/${bann.uprateChar}.webp`);
    document.querySelectorAll(".banner-name").forEach(el => el.innerText = bann.name);
    document.querySelectorAll(".uprate-char").forEach(el => el.innerText = bann.uprateChar);
    otherChars = document.querySelector("#otherChars");
    otherChars.innerHTML = "";
    let i = 0;
    for (let char of bann.otherChars) {
        let span = document.createElement("span");
        span.className = "text-nowrap";
        let charIcon = document.createElement("img");
        charIcon.src = `img/char/${char}.webp`;
        charIcon.className = "char-icon";
        span.appendChild(charIcon);
        span.innerHTML += " ";
        let charName = document.createElement("b");
        charName.innerText = char;
        span.appendChild(charName);
        otherChars.appendChild(span);
        if (i < bann.otherChars.length - 1)
            otherChars.innerHTML += ", ";
        i++;
    }
}

function simulation(initialPity, pulls) {
    let results = {
        pullsToPity: 80 - initialPity,
        totalPullsOnBanner: 0,
        uprateDrops: 0,
        offrateDrops: 0,
        // weapCurrency: 0
    }
    for (let i = 0; i < pulls; i++) {
        results.totalPullsOnBanner += 1;
        results.pullsToPity -= 1
        let proba = 0.8 / 100;
        if (results.pullsToPity === 0) {
            proba = 1;
        } else if (results.pullsToPity < 15) {
            proba += (15 - model.pullsToPity) * 5 / 100;
        }
        if (results.totalPullsOnBanner == 120 && results.uprateDrops === 0) {
            // First guarantee
            results.uprateDrops += 1;
            results.pullsToPity = 80;
        } else if (results.totalPullsOnBanner % 240 === 0) {
            // Free potential
            results.uprateDrops += 1;
        } else if (Math.random() < proba) {
            results.pullsToPity = 80;
            if (Math.random() > 0.5) {
                // 50-50 won
                results.uprateDrops += 1;
            } else {
                // 50-50 lost
                results.offrateDrops += 1;
            }
        }
        if (results.totalPullsOnBanner == 30) {
            freeMulti = simulation(0, 10);
            results.uprateDrops += freeMulti.uprateDrops;
            results.offrateDrops += freeMulti.offrateDrops;
        }
    }

    return results;
}


function runSimulations() {
    saveData();

    document.querySelector("#simuLoad").classList.remove("d-none");
    document.querySelector("#pullsRes").classList.add("d-none");

    setTimeout(() => {
        let nbUprate = 0;
        let nbOffrate = 0;
        for (let i = 0; i < model.nbSimu; i++) {
            let res = simulation(model.pity, model.pullsToUse);
            if (res.uprateDrops >= model.charCopies) {
                nbUprate += 1;
            }
            nbOffrate += res.offrateDrops;
        }

        document.querySelector("#numCopies").innerText = model.charCopies + (model.charCopies > 1 ? " copies" : " copy");
        document.querySelector("#uprateChances").innerText = (nbUprate / model.nbSimu * 100).toFixed(2) + "%";

        const bann = BANNERS.find(b => b.uprateChar == model.selectedBann);
        const offChance = nbOffrate / model.nbSimu / bann.otherChars.length * 100;
        let list = document.querySelector("#addChars");
        list.innerHTML = "";
        for (let char of bann.otherChars) {
            if (!STANDARD.includes(char)) {
                let li = document.createElement("li");
                li.className = "text-start mt-2";
                let charIcon = document.createElement("img");
                charIcon.src = `img/char/${char}.webp`;
                charIcon.className = "char-icon";
                li.appendChild(charIcon);
                li.innerHTML += " ";
                let charName = document.createElement("b");
                charName.innerText = char;
                li.appendChild(charName);
                li.innerHTML += ": ";
                let chance = document.createElement("b");
                chance.innerText = offChance.toFixed(2) + "%";
                li.appendChild(chance);
                list.appendChild(li);
            }
        }

        document.querySelector("#simuLoad").classList.add("d-none");
        const pullsRes = document.querySelector("#pullsRes");
        pullsRes.classList.remove("d-none");
        window.scrollBy(0, pullsRes.offsetHeight);
    }, 100);
}


window.addEventListener("load", () => {
    loadData();

    updateTotalPulls();

    document.querySelectorAll("#pullsCount input").forEach((el) => {
        el.addEventListener("change", updateTotalPulls);
        el.addEventListener("input", updateTotalPulls);
    });

    updateBannerDescription();
    document.querySelector("#banner").addEventListener("change", updateBannerDescription);
    document.querySelectorAll("#pullsSim input").forEach((el) => el.addEventListener("change", saveData));
    document.querySelector("#simulate").addEventListener("click", runSimulations);
});