---
title: 'Om projektet'
description: 'Behovskartan: ett verktyg för att utforska scenarier för Sveriges framtida elbehov, utvecklat av AI Sweden med finansiering från Energimyndigheten'
layout: reports
---

Behovskartan är ett öppet verktyg för att utforska scenarier för Sveriges framtida elbehov. Det underlättar diskussioner mellan industri, kommuner, regioner, myndigheter och allmänhet kring framtidens elsystem. Syftet är att stödja informerade beslut, minska affärsrisker för svensk industri och främja den gröna omställningen genom en gemensam, neutral bild av elbehovet.

Användaren kan variera parametrar som elektrifiering av transportsektorn och industrins gröna omställning, och se effekterna på effektbehovet nationellt och regionalt. Scenarier kan studeras på olika geografiska nivåer, från hela landet ner till enskilda län.

## Del av Energy Toolkit

Behovskartan är byggt med <a href="https://toolkit.energy" target="_blank" rel="noopener">Energy Toolkit</a>, en samling öppna verktyg för att skapa, dela och visualisera energiprognoser. Varje verktyg i ramverket följer samma mönster: en Python-generator skapar scenariodata, ett API serverar den, och en webbapplikation gör den möjlig att utforska interaktivt. Tanken är att vem som helst ska kunna ta ramverket, koppla in sin egen data och driftsätta.

Energy Toolkit innehåller idag två verktyg:

- **Demand** (efterfrågan): Scenariobaserade prognoser för elbehov, från historisk data till interaktiva kartor och diagram. Behovskartan är den första tillämpningen.
- **Generation** (produktion): Planering av förnybar kapacitet med PyPSA-optimering för att beräkna vilken mix av sol, vind och lagring som behövs för att möta framtidens efterfrågan.

Västra Götalandsregionen använder redan produktionsverktyget i <a href="https://vgr.toolkit.energy" target="_blank" rel="noopener">PyPSA-VGR</a>, som beräknar optimal utbyggnad av förnybar energi i regionen.

## Öppen källkod

Projektet är öppen källkod under MIT-licens och utvecklas av <a href="https://www.ai.se" target="_blank" rel="noopener">AI Sweden</a>. Koden finns på <a href="https://github.com/aidotse/behovskartan" target="_blank" rel="noopener">GitHub</a>.

- [Metodik](/reports/methodology): Hur scenarierna byggs upp
- [Data & API](/data): Öppet API och dokumentation

---

<div style="display: flex; align-items: center; gap: 3rem; flex-wrap: wrap; margin-top: 1.5rem;">
  <a href="https://www.ai.se" target="_blank" rel="noopener">
    <img src="/logo-ai-sweden.png" alt="AI Sweden" style="height: 64px;" />
  </a>
  <a href="https://www.energimyndigheten.se" target="_blank" rel="noopener">
    <img src="/logo-energimyndigheten.png" alt="Energimyndigheten" style="height: 48px;" />
  </a>
</div>

<p style="margin-top: 0.75rem; font-size: 0.875rem; color: #6b7280;">Utvecklat av AI Sweden med finansiering från Energimyndigheten.</p>
