---
title: 'Metodik'
description: 'Så bygger vi scenarierna – från Energimyndighetens långsiktiga scenarier till detaljerade timkurvor för varje län, segment och scenario. Ramverket är öppet och byggt för att andra ska kunna förfina och bygga vidare.'
lastUpdated: '2026-03-03'
layout: reports
---

Scenarierna bygger på en kedja i fem steg. Varje steg förädlar data från det
föregående: från grova femårsscenarier till detaljerade timvärden som kan utforskas
per län, segment och scenario.

::MethodologySteps{}

:::InsightBox{variant="insight" title="Ett ramverk, inte bara en modell"}
Det här verktyget är byggt som ett öppet ramverk. Modellerna vi visar är de bästa vi
kunnat göra, men det primära syftet är att visa vad ramverket kan: ta scenariodata,
förädla den till hög tidsupplösning och göra den möjlig att utforska interaktivt.
Alla scenarier utgår från Energimyndighetens långsiktiga scenarier, publicerade under
<a href="https://www.energimyndigheten.se/framtida-elbehov-i-ditt-lan/" target="_blank" rel="noopener">Framtida elbehov i ditt län</a>. Vi lägger inte till egna
antaganden om energiutvecklingen.
:::

<!-- -->

## Steg 1: Energimyndighetens scenarier

Grunden är Energimyndighetens långtidsscenarier för elanvändning, publicerade under <a href="https://www.energimyndigheten.se/framtida-elbehov-i-ditt-lan/" target="_blank" rel="noopener">Framtida elbehov i ditt län</a> och i rapporten <a href="https://www.energimyndigheten.se/framtida-elbehov-i-ditt-lan/" target="_blank" rel="noopener"><em>Scenarier över Sveriges energisystem</em> (ER 2025:13)</a>. Scenarierna togs fram genom att kombinera två osäkerhetsdimensioner (graden av globalisering och graden av miljöhänsyn), vilket ger fyra principiella utvecklingsvägar. Tre av dessa valdes ut för regional nedbrytning, utförd av <a href="https://www.profu.se/" target="_blank" rel="noopener">Profu</a> på uppdrag av <a href="https://www.energimyndigheten.se/" target="_blank" rel="noopener">Energimyndigheten</a>.

Scenarierna innehåller värden för sex tidpunkter (2025, 2030, 2035, 2040, 2045, 2050),
uppdelade på fem sektorer och alla 21 svenska län.

#### De tre scenarierna

**Beslutad politik** är baserat på redan beslutade styrmedel och industrins egna deklarationer.
Det används som referensscenario i Sveriges klimatrapportering och representerar ingen
utforskande framtidsbild utan en utgångspunkt: vad händer om inga nya beslut fattas?

**Lokal miljöhänsyn** kombinerar lägre globalisering med högre miljöhänsyn. Begränsad
acceptans för att exploatera naturresurser leder till restriktiv vindkraftsutbyggnad och
högre elpriser. Scenariot ger den lägsta elanvändningen av de tre, en konservativ
utvecklingsväg där Sverige fokuserar inåt.

**Internationell tillväxt** kombinerar hög globalisering med lägre miljöhänsyn. Stark
industriexpansion, vätgasproduktion och goda förutsättningar för förnybar utbyggnad ger
den högsta elanvändningen. Trots högst efterfrågan blir elpriserna lägst tack vare
omfattande utbyggnad. Sverige blir en exportör av fossilfria produkter.

:::InsightBox{variant="info" title="Scenarierna beskriver möjligheter, inte sannolikheter"}
Inget av scenarierna ska ses som mer eller mindre sannolikt. De visar möjliga
utvecklingsvägar under olika antaganden om omvärlden och politiken.
:::

<!-- -->

#### Fem sektorer

Elanvändningen delas upp i fem sektorer som var och en har sina egna drivkrafter
och förbrukningsmönster:

- **Bostäder**: Hushållens elanvändning (uppvärmning, belysning, hushållsapparater)
- **Service**: Kontor, handel, sjukvård, skolor och andra lokaler
- **Industri**: Tillverkningsindustri, processindustri och byggsektorn
- **Transport**: Elfordon, tåg och övrig elektrifierad transport
- **Datacenter**: Serverhallar och molntjänster, ett snabbt växande segment

#### Regional upplösning

Scenarierna finns för alla 21 svenska län samt ett aggregerat riksvärde. Den regionala
fördelningen varierar efter sektor: industrins placering bygger på befintliga
industrianläggningar, bostäder och service fördelas efter befolkningsunderlag,
datacenter efter inventering av planerade och befintliga anläggningar, och transport
efter regionala elektrifieringsscenarier.

Läs mer om den regionala nedbrytningen på Energimyndighetens sida <a href="https://www.energimyndigheten.se/framtida-elbehov-i-ditt-lan/" target="_blank" rel="noopener">Framtida elbehov i ditt län</a>.

## Steg 2: Från femårsdata till årsdata

Energimyndighetens data innehåller värden för vart femte år. För att kunna visa
utvecklingen år för år och koppla på timprofiler behöver vi värden för varje enskilt
år.

Vi använder linjär interpolering, en enkel metod som drar en rak linje mellan varje
par av femårspunkter. Om Energimyndigheten anger 140 TWh för 2025 och 155 TWh för
2030, antar vi 143 TWh för 2026, 146 TWh för 2027, och så vidare.

::InterpolationChart{}

Resultatet: 6 femårspunkter blir 26 sammanhängande årsvärden (2025–2050), per
scenario, sektor och län.

:::InsightBox{variant="insight" title="Medveten enkelhet"}
Linjär interpolering valdes för sin transparens. Inga dolda antaganden om
tillväxttakt eller trendbrott. Kurvan följer exakt de officiella datapunkterna.
:::

<!-- -->

## Steg 3: Från årsenergi till timeffekt

Årsenergi i TWh säger oss _hur mycket_ el som behövs, men inte _när_. För nätplanering
är det timvariationen som avgör: när inträffar topparna? När är dalarna? Hur ser
belastningen ut en vintermorgon jämfört med en sommarnatt?

Normaliserade lastprofiler fördelar årsenergin över 8 760 timmar. En normaliserad profil
summerar till 1,0 över hela året. Multiplicera med årsenergimängden så får du timvärden
i MW.

Det här är inte en prognos för en specifik timme 25 år framåt. Profilerna visar
hur timmönster _kan_ se ut, baserat på dagens uppmätta data. En aktör med
tillgång till bättre eller mer lokala lastdata kan byta ut profilerna i
ramverket och få mer träffsäkra resultat.

#### Dygnsmönster per sektor

Diagrammet nedan visar det genomsnittliga dygnsmönstret för varje sektor,
alltså hur förbrukningen fördelar sig över dygnets 24 timmar.

::LoadProfileChart{}

#### Bostäder

Baserad på uppmätt timdata och lastprofiler från <a href="https://www.goteborgenergi.se/" target="_blank" rel="noopener">Göteborg Energi</a>
och <a href="https://skovdeenergi.se/" target="_blank" rel="noopener">Skövde Energi</a> (2024). Profilen
visar tydliga morgon- och kvällstoppar när hushållen är som mest aktiva: matlagning,
belysning, hushållsapparater. Vintermånaderna har högre total förbrukning på grund av
uppvärmning (värmepumpar, direktverkande el). Dygnsrytmen följer ett förutsägbart
mönster: låg förbrukning nattetid, morgonuppgång runt kl 06, en middagssvacka, sedan
kvällstopp kring kl 17–19. Helger har en något förskjuten morgonstart.

#### Service

Baserad på uppmätt timdata och lastprofiler från <a href="https://www.goteborgenergi.se/" target="_blank" rel="noopener">Göteborg Energi</a>
och <a href="https://skovdeenergi.se/" target="_blank" rel="noopener">Skövde Energi</a> (SNI-kod D–K, M–N, S: kontor, handel, sjukvård, skolor).
Följer kontorstider med topp under dagtid (08–17). Lägre kvällar och helger. Högre
basbelastning än bostäder, eftersom vissa verksamheter körs dygnet runt (sjukhus,
köpcentrum). Kylbehov ger en sommarkomponent i vissa fastigheter.

#### Industri

Baserad på uppmätt timdata och lastprofiler från <a href="https://www.goteborgenergi.se/" target="_blank" rel="noopener">Göteborg Energi</a>
och <a href="https://skovdeenergi.se/" target="_blank" rel="noopener">Skövde Energi</a> för tillverkningsindustri (SNI C). Relativt jämn profil som speglar
kontinuerlig drift. Skiftmönster syns men dygnsvariationen är mindre än för bostäder.
Hög basbelastning eftersom processindustrier körs dygnet runt. Veckoprofilen visar svag
minskning på helger för icke-kontinuerliga verksamheter.

#### Transport

Sammansatt profil av tre delsegment, viktade efter årlig energianvändning. Delsegmenten kombineras genom efterfrågeviktad medelvärdesbildning till en sammansatt transportprofil.

**Personbilar (49 %):** Grundprofilen bygger på en analys av 179 665 verkliga laddningssessioner från <a href="https://www.sciencedirect.com/science/article/pii/S0960148124015799" target="_blank" rel="noopener">svensk laddningsdata (2024)</a>. Säsongsvariation (vintern 28 % över sommar) baseras på forskning om batteriuppvärmning och kupévärme vid låga temperaturer, bland annat <a href="https://www.sciencedirect.com/science/article/abs/pii/S014206152100140X" target="_blank" rel="noopener">Lilleholt et al. (2021)</a> som visar 35 % lägre laddning maj–juni jämfört med januari–mars. Veckomönstret (vardagar 16 % högre än helger) hämtas från <a href="https://www.trafa.se/en/transportation-trends/travel-survey/" target="_blank" rel="noopener">RVU Sverige 2015–2016</a> (Trafikanalys). Profilen har topp sen kväll/natt när bilar laddas efter arbetsdagen.

**Tunga lastbilar (32 %):** Baserat på <a href="https://www.ai.se/" target="_blank" rel="noopener">AI Swedens</a> analys av elektrifiering av tunga transporter från den första versionen av Behovskartan. Profilen visar middagstopp (depå- och möjlighetsladdning under raster), mycket stark vardagsprofil (vardagsefterfrågan cirka 3× helg) och en juli–augusti-dipp som speglar minskad logistik under sommaren.

**Tåg (18 %):** Profilen bygger på <a href="https://www.energimyndigheten.se/globalassets/statistik/transport/bantrafik_energianvanding_en0118_final.pdf" target="_blank" rel="noopener">Energimyndighetens statistik över energianvändning i bantrafik</a> (EN0118, 2017) för fördelning mellan persontåg, godståg och infrastruktur, samt kvartalsdata från <a href="https://www.trafa.se/en/rail-traffic/railway-transport/" target="_blank" rel="noopener">Trafikanalys järnvägsstatistik</a> för säsongsvariation. Dygnsmönstret visar dubbla toppar vardagar (pendlartopp morgon och eftermiddag) och en jämnare dagsplatå helger.

#### Datacenter

Baserad på lastkurvor bidragna av <a href="https://www.airon.ai/" target="_blank" rel="noopener">Airon</a>.
Nästan helt jämn profil dygnet runt, året runt. Servrar körs 24/7 oavsett tid eller
dag. Den enda variationen kommer från kylning: under de varmare månaderna (april–oktober)
skapar kompressorbaserad kylning ett temperaturföljande mönster med topp kring kl 13.
Under vintermånaderna (november–mars) ger frikyla en nästan helt jämn profil. Ingen
veckovariation överhuvudtaget.

:::InsightBox{variant="info" title="8 760 timmar × 26 år × 21 län × 5 sektorer × 3 scenarier"}
Totalt cirka 72 miljoner datapunkter.
:::

<!-- -->

## Steg 4: Scenarioparametrar

<a href="https://www.energimyndigheten.se/framtida-elbehov-i-ditt-lan/" target="_blank" rel="noopener">Energimyndighetens tre scenarier</a> beskriver möjliga utvecklingsbanor. För enkelhetens
skull har vi valt <em>Beslutad politik</em> som standardscenario. Parametersystemet låter
användaren skapa egna variationer: vad händer om en sektor växer snabbare eller
långsammare än grundscenariot?

#### Tillväxtkurvor

Varje sektor kan justeras med en tillväxtparameter som ökar eller minskar
energianvändningen. Justeringen följer en S-kurva: förändringen börjar
långsamt, accelererar, och planar sedan ut. Det speglar hur teknologiska
förändringar och beteendeskiften faktiskt sprids i samhället. Omställningen
är centrerad kring 2037.

::GrowthLevelGrid{}

#### Flexkurvor

Flexparametern jämnar ut förbrukningsprofilen utan att ändra den totala
energimängden per år. Varje timvärde dras närmare årsmedelvärdet: toppar
sänks och dalar höjs. Det modellerar efterfrågeflexibilitet, till exempel
att elbilar laddas nattetid istället för kvällstid, eller att industri
förskjuter processer till timmar med lägre belastning.

Effekten är en jämnare belastningskurva, vilket kan minska behovet av
nätförstärkning och dyra effekttoppar.

:::InsightBox{variant="info" title="Parametrarna ändrar inte basantagandena"}
Tillväxt- och flexparametrarna appliceras ovanpå Energimyndighetens scenarier.
De ersätter aldrig grundscenariot, utan låter dig utforska hur resultat påverkas av
rimliga avvikelser från baslinjen.
:::

<!-- -->

## Steg 5: Kvalitetssäkring

Varje steg i kedjan har inbyggda kontroller för att säkerställa att den förädlade
datan är konsistent med källorna.

#### Normalisering bevarar årstotaler

Efter att timprofiler applicerats normaliseras resultatet så att summan av alla
8 760 timmar exakt motsvarar årsenergin. Ingen energi tillkommer eller försvinner
i omvandlingen.

#### Kontrollerat brus för realism

Ett litet slumpmässigt brus (±2 %, reproducerbart med fast slumpfrö) läggs till
timvärdena för att undvika orealistiskt jämna mönster. Bruset appliceras _före_
normaliseringen, så årstotalerna bevaras exakt.

#### Skottårshantering

Källprofilerna från 2024 (skottår, 8 784 timmar) justeras till 8 760 timmar genom
att 29 februari tas bort.

#### Transportaggregering

Tre delsegment (personbilar 49 %, lastbilar 32 %, tåg 18 %) kombineras genom
efterfrågeviktad medelvärdesbildning till en sammansatt transportprofil.

#### Profilförlängning

Profiler från källåret (2024) förlängs till att täcka 2025–2050 med
veckodagsmedveten mappning (vardagar matchas mot vardagar, helger mot helger)
för att bevara realistiska mönster.

:::InsightBox{variant="insight" title="Transparens genom hela kedjan"}
All kod och alla antaganden är öppna. De lastprofiler som driver scenarierna
publiceras som del av datasetet, men det underliggande rådata som profilerna
bygger på (från energibolag och datacenteraktörer) delas inte vidare.
Varje steg i kedjan kan granskas, ifrågasättas och förbättras. Scenarier
som inte kan förklaras bör inte användas för beslut.

Ramverket är byggt för att växa. Varje steg i kedjan, från lastprofiler
och scenariodata till flexmodeller och visualiseringar, kan bytas ut eller
förfinas av den som har bättre data eller mer avancerade metoder.
Vi hoppas att forskare, nätbolag och myndigheter bygger vidare.
:::
