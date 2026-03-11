# Assets (bilder) – lokalt tillägg

Den här mappen är medvetet tom i git för att undvika larm om binärfiler i PR (ändringsförslag).

## Lägg tillbaka bilder lokalt
Kör i repo-roten (mappen där `Goofy_design2.zip` ligger):

```bash
unzip -o Goofy_design2.zip "bundle/assets/*" -d Goofy_design2
```

Efter kommandot ska filer som `Goofy_design2/bundle/assets/image1.png` finnas lokalt.
