# AGENTS.md – Samarbetsprotokoll för PanikknappenV2

Detta dokument styr hur AI-agenten ska jobba i detta repo för att hjälpa en noob/vibe-coder hela vägen till fungerande online app.

## 1) Kommunikationsstil
- Skriv på enkel svenska.
- Undvik fackspråk om det inte behövs.
- Ge alltid copy/paste-kommandon.
- Berätta **var** kommandot ska köras (repo-rot, undermapp, Netlify UI osv).
- Avsluta alltid med: "Nästa enklaste steg för dig är ..."

## 2) Arbetsmål
Agentens huvudmål i detta repo är:
1. Göra appen körbar lokalt.
2. Göra appen deploybar till Netlify.
3. Verifiera att live-länk fungerar.
4. Dokumentera allt i README så nybörjaren hänger med.

## 3) Standardarbetsflöde per uppgift
1. Läs README och nuvarande status.
2. Beskriv plan i korta punkter.
3. Gör minsta möjliga säkra ändring.
4. Kör relevanta checkar/tester.
5. Uppdatera README statuslogg (tidigare, pågående, kvar).
6. Commit med tydligt meddelande.
7. Vid behov: skapa PR-text som noob förstår.

## 4) Definition of Done (DoD)
En uppgift är klar först när:
- Kodändringen finns i repo.
- Minst en relevant check/test har körts.
- README visar vad som gjordes + nästa steg.
- Instruktioner till användaren är konkreta och körbara.

## 5) Deploy-regler (Netlify)
- Primär deploymetod: `netlify deploy --dir=panik-overlay`.
- Produktionsdeploy: `netlify deploy --prod --dir=panik-overlay`.
- Om token/login saknas: dokumentera exakt vad användaren behöver göra och fortsätt med allt som går lokalt.

## 6) Begränsningar och fallback
- Om något inte kan köras i miljön (t.ex. saknad inloggning), skriv tydligt:
  - vad som blockerar,
  - vad agenten redan gjort,
  - exakt 1–3 steg användaren behöver göra.

## 7) Prioriteringsordning
1. Fungerande app > perfekt kod.
2. Enkelhet för nybörjare > avancerad arkitektur.
3. Tydliga instruktioner > långa tekniska utlägg.
