/* Načtení vestavěného modulu fs (file system) - umožňuje práci se souborovým systémem v Node JS */
const fs = require("fs");
/* Načtení externího modulu joi (musí být nejprve naistalován pomocí npm install joi).
   Usnadňuje ověření správného zadání dat (validaci).  
 */
const Joi = require("joi");
/* Načtení externího modulu cors (musí být nejprve naistalován pomocí npm install cors).
   Umožní serveru zpracovat i požadavky, které přicházejí z jiné domény a které by mohly 
   být vyhodnoceny jako potenciálně nebezpečné.
   Podrobněji viz https://cs.wikipedia.org/wiki/CORS
*/
const cors = require("cors");
/* Načtení externího modulu express - oblíbený framework pro tvorbu webových aplikací 
   v Node JS. */
const express = require("express");
/* Vytvoření základního objektu aplikace */
const app = express();
/* Povolí v aplikaci zpracování dat ve formátu JSON */
app.use(express.json());
/* Povolí v aplikaci zpracovat požadavky přicházející z jiné domény */
app.use(cors());

app.use(express.static('public'));

/** Pomocné funkce **/
/* Funkce umožní validaci dat určitého objektu (zde hráče) */
function validateRecord(data) {
    /* Validační schéma nastavuje pravidla platná pro jednotlivé atributy objektu. 
       Příklady různých možností tvorby schémat knihovny Joi naleznete třeba zde: https://www.digitalocean.com/community/tutorials/node-api-schema-validation-with-joi 
    */ 
    const schema = Joi.object({
      /* Jméno hráče musí být ve formátu string, musí obsahovat aspoň 2 znaky a jeho
      zadání je povinné (required) */
      name: Joi.string().min(2).required(),
      /* Stát */  
      state: Joi.string().regex((/^[A-Z]{3}$/)),
      /* Počet bodů musí být kladné desetinné číslo s přesností na 2 desetinná místa */  
      points: Joi.number().positive().precision(2).required(),
    });
    /* Provede validaci dat podle nastaveného schématu a vrátí false (zadaná data jsou v pořádku), nebo objekt s chybou (když je něco špatně). */
    return schema.validate(data); 
}

  /* Funkce slouží k asynchronnímu zápisu dat ve formě pole objektů do souboru ve formátu JSON umístěného v pathToFile */
function writeJSON(arrayObj, pathToFile) {
    /* Pole objektů je převedeno na řetězec ve formátu JSON, hodnota 2 v třetím parametru znamená odsazení */
    let data = JSON.stringify(arrayObj, null, 2);
    /* Metoda writeFile modulu fs zapíše do souboru pathToFile připravená data */
    fs.writeFile(pathToFile, data, err => {
      /* Jestliže byla zaznamenaná chyba, vypíše se tato chyba v konzoli */
      if (err) {
        console.log(`Data couldn't be saved! Error: ${err}`);
      } else {
        /* Není-li zjištěna žádná chyba při zápisu souboru, vypíše se hláška do konzoly */
        console.log(`Data was saved successfully to ${pathToFile}`);
      }
    });
}
  
  /* Funkce slouží k synchronnímu načtení dat do pole objektů ze souboru ve formátu JSON umístěného v pathToFile */
function readJSON(pathToFile) {
    /* Ošetření výjimky - dojde-li k nějaké chybě v bloku try, je chyba zachycena (a ošetřena) v bloku catch. 
       K výjimce může dojít například po neúspěšném čtení ze souboru nebo parsování dat z formátu JSON. 
    */
    try {
      /* Metoda JSON.parse vytvoří pole objektů z dat získaných načtením souboru */
      let data = JSON.parse(fs.readFileSync(pathToFile, 'utf8'));
      /* Vypíše se hlášení o úspěšně provedené akci do konzole */
      console.log(`Data was read successfully from file ${pathToFile}`);
      /* Funkce vrátí načtená data */
      return data;  
    } catch(err) {
      /* V případě chyby se vypíše hláška do konzole */
      console.log(`Data couldn't be read! Error: ${err}`);
    }
}
  
/* Do proměnné movies se načtou všechna data ze souboru movies.json */
let players = readJSON("./players.json");

/* Request: použití metody GET, URL adresy /:
   Response: HTML stránka  */
/*app.get("/", (req, res) => {
    res.send("<h1>Úvodní stránka</h1>");
});*/
  
/* Načtení všech záznamů (data o všech hráčích)
   Request: použití metody GET, URL adresy /players:
   Response: posílá obsah proměnné players (pole objektů) - údaje o všech hráčích  */
app.get("/players", (req, res) => {
    res.send(players);
});
  
/* Načtení jednoho záznamu (data o jednom hráči podle zadaného id) 
   Request: použití metody GET, URL adresy /players, parametr id
   Response: výpis konkrétního hráče podle zadaného id  */
app.get("/players/:id", (req, res) => {
    /* Přečte z požadavku uživatele zadaný parametr id a převede ho na číslo */
    let id = Number(req.params.id);
    /* Vyhledá v poli objektů players hráče, jehož id se shoduje s parametrem id */
    let player = players.find(player => player.id === id);
    /* Jestliže proměnná player není prázdná */
    if (player) {
      /* V odpovědi odešle vyhledaný datový objekt - hráče */
      res.send(player);
    } else {
      /* Jako odpověď odešle chybovou zprávu (404) a informaci o chybě */
      res.status(404).send("Záznam nebyl nalezen.");
    }
});
  
  /* Vytvoření nového záznamu 
     Request: použití metody POST, URL adresy /players
     Response: výpis nového filmu   */
app.post("/players", (req, res) => {
    /* Pomocí funkce validateRecord zkontroluje data odeslaná v těle požadavku; případná chyba se uloží ve formě objektu. */
    let { error } = validateRecord(req.body);
    /* Jestliže došlo k chybě při validaci dat (např. nesprávný formát zkratky státu) */
    if (error) {
      /* v odpovědi serveru se pošle zpráva 400 a informace o detailech chyby */
      res.status(400).send(error.details[0].message);
    } else {
      /* V případě, že validace dat proběhla úspěšně, vytvoří se objekt player s potřebnými atributy a z těla požadavku se do něj uloží všechna data */
      let player = {
        /* id musí být nastaveno na hodnotu o 1 vyšší než je id posledního objektu, nebo 1 (pokud jde o první objekt v dosud prázdném poli) */
        id: players.length !== 0 ? players[players.length - 1].id + 1 : 1,
        name: req.body.name,
        state: req.body.state,
        points: req.body.points,
      };
      /* Přidá nový záznam (hráče) do pole */
      players.push(player);
      /* Jako odpověď pošle úspěšně vložený objekt */
      res.send(player);
      /* Zapíše aktuální data do souboru JSON */
      writeJSON(players, "players.json");
    }
  });
  
  /* Aktualizace záznamu 
     Request: použití metody PUT, URL adresy /players a parametru id
     Response: výpis aktualizovaného záznamu o hráči   */
app.put("/players/:id", (req, res) => {
    /* Podle id v parametru se vybere požadovaného hráče a dále se postupuje podobně jako při vytváření nového záznamu */
    let id = Number(req.params.id);
    let player = players.find(player => player.id === id);
    if (!player) {
      res.status(404).send("Záznam nebyl nalezen.");
      return;
    }
    let { error } = validateRecord(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
    } else {
      player.name = req.body.name;
      player.state = req.body.state;
      player.points = req.body.points;
      res.send(player);
      writeJSON(players, "players.json");
    }
});
  
  /* Odstranění záznamu 
     Request: použití metody DELETE, URL adresy /players a parametru id
     Response: výpis smazaného záznamu hráče   */
  app.delete("/players/:id", (req, res) => {
    let id = Number(req.params.id);
    let player = players.find(player => player.id === id);
    if (!player) {
      res.status(404).send("Záznam nebyl nalezen.");
    } else {
      /* Vybraný záznam (podle proměnné player) se odstraní z pole players */
      let index = players.indexOf(player);
      players.splice(index, 1);
      res.send(player);
      writeJSON(players, "players.json");
    }
  });
  
  /* Serverová aplikace je spuštěna a naslouchá na portu 3000 */
  app.listen(3000, () => console.log("Listening on port 3000..."));
  