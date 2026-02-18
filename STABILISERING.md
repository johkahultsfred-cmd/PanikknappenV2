# Stabiliseringsplan – konfliktfri arbetsmodell

Det här dokumentet gör nästa deploy-fixar enklare och minskar merge-konflikter (sammanfogningskrockar).

## 1) En gemensam sökvägsstrategi
Vi håller fast vid en enda modell:

- `panik-overlay/index.html` länkar till undersidor med:
  - `./apps/child/`
  - `./apps/family/`
- `apps/child/index.html` och `apps/family/index.html` använder relativa filvägar för lokala filer (`./style.css`, `./script.js`) och uppåtsteg till delade assets (`../../assets/...`).
- Tidig URL-normalisering finns kvar för att hantera fall där hosten öppnar vägar utan avslutande snedstreck (`/`).

## 2) Merge-regel innan PR
Kör alltid i repo-roten innan push:

```bash
git fetch origin
git rebase origin/main
```

Om konflikt uppstår:

```bash
git add <fil>
git rebase --continue
```

## 3) Testmatris innan merge
Alla deploy-fixar ska testas i två lägen:

1. Rotläge: `/index.html`
2. Undermappsläge: `/PanikknappenV2/index.html`

Kontrollera alltid:
- Familjeläge går att låsa upp med kod `1234`
- Barnläge öppnar korrekt
- Inga 404 på CSS/JS i browsernätverk

## 4) Rekommenderad PR-gräns
Håll varje PR liten:
- Antingen **path-fix**
- Eller **workflow-fix**
- Eller **README/docs**

Undvik att blanda allt i samma PR.
