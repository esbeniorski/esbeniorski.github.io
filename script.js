let lkart = 52;
let listakart = [];
for (let i = 0; i < 4; i++) {
	listakart[i] = [];
	for (let j = 0; j < 13; j++) {
		listakart[i][j] = true;
	}
}
/**
 * Lista wydanych kart
 * @type {{krupier: {waga : string, kolor : string}[][], gracz: {waga : string, kolor : string}[][]}}
 */
let wydanekarty = {"krupier": [[]], "gracz": [[]]};

/**
 * Daje kartę wybranej osobie
 * @param kto : string - "gracz" || "krupier"
 * @param zakr : boolean - czy karta ma być zakryta
 * @param reka : number - ręka której dotyczy funkcja
 * @returns {undefined}
 */
function dajKarte(kto, zakr, reka) {
	if (!lkart) {
		dialog.textContent = "Karty zostały przetasowane...";
		dialog.appendChild(document.createElement("br"));
		tasujKarty();
	}
	let liczba = Math.floor(lkart * Math.random())
	let wybrana = {"kolor": 0, "waga": 0}
	let wyjdz = false;
	for (let i = 0; i < 4; i++) {
		let suma = 0;
		listakart[i].forEach(j => suma += j);
		if (suma <= liczba)
			liczba -= suma;
		else {
			for (let j = 0; j < 13; j++) {
				if (listakart[i][j]) {
					if (liczba)
						liczba -= 1;
					else {
						wybrana.kolor = i;
						wybrana.waga = j;
						listakart[i][j] = false;
						lkart -= 1;
						wyjdz = true;
						break;
					}
				}
			}
		}
		if (wyjdz)
			break;
	}
	const par = document.createElement("td");
	par.classList.add("karta");
	if (!zakr) {
		par.appendChild(document.createTextNode(["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"][wybrana.waga]));
		par.appendChild(document.createElement("br"));
		if (wybrana.kolor % 2)
			par.style.color = "Red";
		par.appendChild(document.createTextNode(["♠", "♥", "♣", "♦"][wybrana.kolor]));
	} else {
		par.classList.add("zakr");
	}
	document.getElementById({"krupier":"kartykrupiera", "gracz":"kartygracza"}[kto]).children[reka].appendChild(par);
	wydanekarty[kto][reka][wydanekarty[kto][reka].length] = {"waga":wybrana.waga, "kolor":wybrana.kolor};
}

function tasujKarty() {
	lkart = 52;
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 13; j++) {
			listakart[i][j] = true;
		}
	}
	for (let i = 0; i < wydanekarty.krupier[0].length; i++) {
		listakart[wydanekarty.krupier[0][i].kolor][wydanekarty.krupier[0][i].waga] = false;
		lkart--;
	}
	for (let i = 0; i < wydanekarty.gracz.length; i++) {
		for (let j = 0; j < wydanekarty.gracz[i].length; j++) {
			listakart[wydanekarty.gracz[i][j].kolor][wydanekarty.gracz[i][j].waga] = false;
			lkart--;
		}
	}
}

function odkryjKarty() {
	for (let i = 1; i <= wydanekarty.krupier[0].length; i++) {
		let t = document.getElementById("kartykrupiera").children[0].children[i];
		if (t.classList.contains("zakr")) {
			t.classList.remove("zakr");
			t.appendChild(document.createTextNode(["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"][wydanekarty.krupier[0][i-1].waga]));
			t.appendChild(document.createElement("br"));
			if (wydanekarty.krupier[0][i-1].kolor % 2)
				t.style.color = "Red";
			t.appendChild(document.createTextNode(["♠", "♥", "♣", "♦"][wydanekarty["krupier"][0][i-1].kolor]));
		}
	}
}

/**
 * Zwraca wartość kart wybranej osoby
 * @param kto : string - "gracz" || "krupier"
 * @param reka : number - ręka której dotyczy funkcja
 * @returns number
 */
function wartoscKart(kto, reka) {
	let suma = 0, asy = 0;
	for (let i = 0; i < wydanekarty[kto][reka].length ;i++) {
		if (wydanekarty[kto][reka][i].waga === 0) {
			asy++;
			suma += 11;
		} else if (wydanekarty[kto][reka][i].waga >= 10)
			suma += 10;
		else
			suma += wydanekarty[kto][reka][i].waga + 1;
	}
	while (suma > 21 && asy) {
		suma -= 10;
		asy--;
	}
	return suma;
}

function graHit() {
	document.getElementById("doubledownbutton").setAttribute("disabled", "");
	dajKarte("gracz", false, aktualna);
	if (wartoscKart("gracz", aktualna) >= 21)
		graStand();
}

function graStand() {
	if (aktualna === wydanekarty.gracz.length - 1) {
		while (wartoscKart("krupier", 0) <= 16)
			dajKarte("krupier", true, 0);
		odkryjKarty();
		caches["wk"] = wartoscKart("krupier", 0);
		for (let i = 0; i < stawka.length; i++) {
			caches["wg"] = wartoscKart("gracz", i);
			if (caches.wg <= 21) {
				if (caches.wk > 21) {
					zyskanakasa += 2 * stawka[i];
					dialog.appendChild(document.createTextNode("Wygrałeś! Krupier przebił 21 punktów."));
				} else if (caches.wg > caches.wk) {
					zyskanakasa += 2 * stawka[i];
					dialog.appendChild(document.createTextNode("Wygrałeś! Masz więcej punktów niż krupier."));
				} else if (caches.wg === caches.wk) {
					zyskanakasa += stawka[i];
					dialog.appendChild(document.createTextNode("Remis! Obaj macie tyle samo punktów."));
				} else if (caches.wg < caches.wk)
					dialog.appendChild(document.createTextNode("Przegrałeś! Krupier ma więcej punktów niż ty."));
			} else
				dialog.appendChild(document.createTextNode("Przegrałeś! Przebiłeś 21 punktów."));
			dialog.appendChild(document.createElement("br"));
		}
		stankonta += zyskanakasa;
		for (let j = 0; j < stawka.length; j++)
			zyskanakasa -= stawka[j];
		if (zyskanakasa > 0)
			muzyka("v");
		else if (zyskanakasa === 0)
			muzyka("s");
		else
			muzyka("f");
		koniec();
	} else {
		document.getElementById("kartygracza").children[aktualna].children[0].textContent = "";
		aktualna++;
		document.getElementById("kartygracza").children[aktualna].children[0].textContent = "►";
		sprawdzPrzyciski();
	}
}

function graDoubleDown() {
	if (stankonta < stawka[aktualna]) {
		alert("Nie masz tyle pieniędzy!");
		return;
	}
	stankonta -= stawka[aktualna];
	stawka[aktualna] *= 2;
	dajKarte("gracz", false, aktualna);
	graStand();
	wyswietl();
}

function graInsurance() {
	if (10 <= wydanekarty.krupier[0][1].waga && wydanekarty.krupier[0][1].waga <= 12) {
		stankonta += stawka[aktualna];
		stawka[aktualna] = 0;
		dialog.textContent = "Krupier miał Blackjacka. Ozdyskujesz pieniądze.";
		muzyka('v');
	} else {
		stankonta -= stawka[aktualna] / 2;
		stawka[aktualna] = 0;
		dialog.textContent = "Krupier nie miał Blackajacka.";
		muzyka('f');
	}
	odkryjKarty();
	koniec();
}

function graSplit() {
	wydanekarty.gracz[wydanekarty.gracz.length] = [];
	wydanekarty.gracz[wydanekarty.gracz.length - 1][0] = wydanekarty.gracz[aktualna][1];
	wydanekarty.gracz[aktualna].splice(1, 1);
	let h = document.createElement("tr");
	h.appendChild(document.createElement("td"));
	h.appendChild(document.getElementById("kartygracza").children[aktualna].children[2]);
	document.getElementById("kartygracza").appendChild(h);
	stawka[stawka.length] = stawka[0];
	stankonta -= stawka[0];
	wyswietl();
	dajKarte("gracz", false, aktualna);
	dajKarte("gracz", false, stawka.length - 1);
	sprawdzPrzyciski();
}

function postaw() {
	stawka[aktualna] = Number(document.getElementById("stawkainput").value);
	if (stawka[aktualna] > stankonta) {
		alert("Nie masz tyle pieniędzy!");
		return;
	} else if (stawka[aktualna] < 0) {
		alert("Nie możesz podać ujemnej liczby!");
		return;
	} else
		stankonta -= stawka[aktualna];
	wyswietl();
	nowaGra();
}

function nowaGra() {
	dialog.textContent = "";
	wydanekarty = {"krupier": [[]], "gracz": [[]]};
	document.getElementById("kartykrupiera").innerHTML = "<tr><td></td></tr>";
	document.getElementById("kartygracza").innerHTML = "<tr><td id=\"wskaznik\">►</td></tr>";
	dajKarte("krupier", false, 0);
	dajKarte("gracz", false, 0);
	dajKarte("krupier", true, 0);
	dajKarte("gracz", false, 0);
	document.getElementById("hitbutton").removeAttribute("disabled");
	document.getElementById("standbutton").removeAttribute("disabled");
	if (wydanekarty.krupier[0][0].waga === 0)
		document.getElementById("insurancebutton").removeAttribute("disabled");
	else
		document.getElementById("insurancebutton").setAttribute("disabled", "");
	sprawdzPrzyciski();
	muzyka("mgs");
}

/**
 * Dezaktywuje wszystkie przyciski i zeruje stawkę
 */
function koniec() {
	wyswietl();
	for (let i = 0; i < document.getElementById("przyciski").children.length; i++) {
		let j = document.getElementById("przyciski").children[i];
		if (j.nodeName === "BUTTON" && j.id.toString() !== "postawbutton")
			j.setAttribute("disabled", "");
	}
	stawka = [0];
	aktualna = 0;
	zyskanakasa = 0;
}

/**
 * Wyświetla stank konta i stawkę
 */
function wyswietl() {
	document.getElementById("stankonta").textContent = stankonta.toString();
	document.getElementById("stawka").textContent = "$" + stawka[0].toString();
	for (let i = 1; i < stawka.length; i++)
		document.getElementById("stawka").textContent += ", $" + stawka[i].toString();
}

function sprawdzPrzyciski() {
	if (wydanekarty.gracz[aktualna][0].waga === wydanekarty.gracz[aktualna][1].waga)
		document.getElementById("splitbutton").removeAttribute("disabled");
	else
		document.getElementById("splitbutton").setAttribute("disabled", "");
	if (wydanekarty.gracz[aktualna].length === 2)
		document.getElementById("doubledownbutton").removeAttribute("disabled");
	else
		document.getElementById("doubledownbutton").setAttribute("disabled", "");
}

/**
 * Odtwarza muzykę
 * @param n : string - Utwór muzyczny. "v" - Victory, "f" - Fail, "s" - Stalemate, "mgs" - Metal Gear Solid
 */
function muzyka(n) {
	let h = {v: "victory", s: "stalemate", f: "fail", mgs: "mgs"}[n];
	document.getElementById("muzyka").setAttribute("src", "music/" + h + ".mp3");
}

let stankonta = 1000;
let stawka = [0];
let aktualna = 0;
let zyskanakasa = 0;
let dialog = document.getElementById("dialog");
koniec();

