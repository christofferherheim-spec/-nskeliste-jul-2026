# Slik får du ønskelisten ut på nettet

Denne guiden tar deg fra «koden ligger på GitHub» til «jeg har en lenke jeg kan sende til familien».
Du trenger ingen programmering. Alt foregår med museklikk i nettleseren og tar omtrent 15–20 minutter.
Begge tjenestene er gratis for dette bruket.

---

## Først: hva er alle disse tingene?

Det hjelper å vite hvilke deler som er med, så knappene gir mening.

| Ord | Hva det betyr her |
|---|---|
| **GitHub** | Et nettsted der koden til siden ligger lagret. Tenk på det som en Dropbox-mappe for kode, som også husker alle tidligere versjoner. |
| **Repo** (repository) | Selve mappen på GitHub. Din heter `-nskeliste-jul-2026`. |
| **Branch** og **main** | Et repo kan ha flere parallelle utgaver av koden, kalt *brancher*. `main` er hovedutgaven, den «offisielle». Jeg har lagt arbeidet mitt i en egen branch (`claude/shared-christmas-wishlist-c199kw`), sånn at du kan godkjenne det før det havner i `main`. |
| **Pull request** og **merge** | En *pull request* er en forespørsel om å flytte endringer fra én branch inn i `main`. Å *merge* betyr å godkjenne og slå dem sammen. |
| **Vercel** | En tjeneste som tar koden fra GitHub og gjør den om til en nettside med en ekte adresse. |
| **Deploy** | Å publisere en ny versjon av siden. Vercel gjør dette automatisk hver gang `main` endres på GitHub. |
| **Database** / **Upstash Redis** | Et lite lager på nettet som husker hvem som har krysset av hva. Uten det glemmer siden alt med en gang. Upstash er firmaet, Redis er typen database. |
| **Miljøvariabler** (env-variabler) | Hemmelige nøkler som lar nettsiden få tilgang til databasen. Vercel legger dem inn for deg automatisk, så du trenger aldri se eller kopiere dem. |

Slik henger det sammen:

```
  GitHub (koden)  ──►  Vercel (lager nettsiden)  ──►  din-adresse.vercel.app
                                │
                                └──►  Upstash (husker avkrysningene)
```

---

## Steg 1: Godkjenn koden på GitHub (merge til main)

Vercel publiserer det som ligger i `main`, så endringene mine må inn dit først.

1. Gå til **github.com** og logg inn.
2. Åpne repoet ditt: `github.com/christofferherheim-spec/-nskeliste-jul-2026`
3. Øverst ser du sannsynligvis en gul stripe der det står at branchen `claude/shared-christmas-wishlist-c199kw` har nye endringer, med en grønn knapp **Compare & pull request**. Trykk på den.
   - Ser du ikke stripen: trykk på fanen **Pull requests** → **New pull request**. Velg `main` i boksen til venstre («base») og `claude/shared-christmas-wishlist-c199kw` til høyre («compare»).
4. Du kommer til en side med tittel og beskrivelse. Du trenger ikke skrive noe. Trykk **Create pull request**.
5. Rull litt ned og trykk den grønne knappen **Merge pull request**, og deretter **Confirm merge**.
6. Det står nå «Merged» med lilla farge. Koden ligger i `main`.

> Vil du slippe dette steget, kan du bare be meg lage pull requesten. Da trenger du bare trykke **Merge**.

---

## Steg 2: Lag en Vercel-konto

> **Har du allerede en Vercel-konto som er koblet til GitHub?** Da hopper du over dette steget. Gå til **vercel.com**, logg inn med **Continue with GitHub**, og fortsett på steg 3.

1. Gå til **vercel.com/signup**.
2. Velg **Hobby** (gratis, til personlig bruk) og skriv inn navnet ditt.
3. Trykk **Continue with GitHub**. Da logger du inn med GitHub-kontoen din, og Vercel får lov til å lese repoene dine.
4. GitHub spør om du vil gi Vercel tilgang. Trykk **Authorize Vercel**.

---

## Steg 3: Koble repoet til Vercel og publiser første gang

1. Inne på Vercel, trykk **Add New…** oppe til høyre og velg **Project**.
2. Under **Import Git Repository** ser du en liste over repoene dine. Finn `-nskeliste-jul-2026` og trykk **Import**.
   - **Står ikke repoet i listen?** Trykk **Adjust GitHub App Permissions** (eller **Install**) under listen. Et GitHub-vindu åpnes. Velg **Only select repositories**, velg repoet ditt, og trykk **Save**. Da dukker det opp i listen.
3. Nå får du en side som heter **Configure Project**:
   - **Project Name**: dette blir en del av nettadressen. Skriv for eksempel `christoffer-onskeliste`. Da blir adressen `christoffer-onskeliste.vercel.app`, så sant ingen andre har tatt navnet.
   - **Framework Preset**: velg **Other**. («Framework» er en type byggeverktøy for større nettsider. Denne siden trenger ikke noe slikt.)
   - Ikke rør **Build and Output Settings** eller **Environment Variables**. La dem stå som de er.
4. Trykk **Deploy**.
5. Etter rundt et halvt minutt får du en side med konfetti og «Congratulations!». Trykk **Continue to Dashboard**.

Siden ligger nå på nettet, og du kan åpne adressen. **Men avkrysningen virker ikke ennå.** Trykker du «Jeg kjøper denne», får du en feilmelding. Det er fordi databasen mangler. Den ordner vi i neste steg.

---

## Steg 4: Legg til databasen (Upstash Redis)

1. På prosjektsiden i Vercel, trykk fanen **Storage** øverst.
2. Trykk **Create Database**.
3. Du ser en liste med tilbydere. Under **Marketplace Database Providers** velger du **Upstash**, og deretter **Upstash for Redis**. Trykk **Continue**.
4. Godta vilkårene hvis du blir spurt.
5. Fyll inn:
   - **Primary Region**: velg **Frankfurt** (`eu-central-1`). Det er nærmest Norge og gir raskest side.
   - **Plan**: velg **Free**. Gratisplanen er mer enn nok, siden du har noen titalls besøkende og ikke millioner.
   - **Database Name**: for eksempel `onskeliste`.
6. Trykk **Continue** og deretter **Create**.
7. Du får spørsmål om å koble databasen til et prosjekt (**Connect Project**). Velg prosjektet ditt, og la alle tre hakene stå på (**Development**, **Preview**, **Production**). Trykk **Connect**.

Nå har Vercel lagt inn de hemmelige nøklene til databasen i prosjektet ditt. Du trenger ikke gjøre noe med dem.

---

## Steg 5: Publiser på nytt, så nettsiden får nøklene

Nettsiden ble publisert *før* databasen fantes, så den må publiseres én gang til for å få nøklene.

1. Trykk fanen **Deployments** øverst.
2. På den øverste linjen (den nyeste publiseringen) trykker du de tre prikkene **⋯** helt til høyre.
3. Velg **Redeploy**, og bekreft med **Redeploy** igjen.
4. Vent et halvt minutt til det står **Ready**.

---

## Steg 6: Test at alt virker

1. Åpne adressen din på telefonen (for eksempel `christoffer-onskeliste.vercel.app`).
2. Trykk **Jeg kjøper denne** på en vare, skriv et navn og trykk **Bekreft**. Du skal få konfetti og en «TATT»-stempel på varen.
3. Åpne siden i en annen nettleser eller på en annen telefon. Varen skal vises som tatt.
4. Trykk **Angre** på den første telefonen for å fjerne testen igjen.

**Lenkene du skal bruke:**

- **Til familien:** `https://christoffer-onskeliste.vercel.app/`
- **Til deg selv:** `https://christoffer-onskeliste.vercel.app/?eier=1`

Eierlenken skjuler alle avkrysninger, så du ikke ser hva som er kjøpt. Lagre den som bokmerke, og ikke åpne den vanlige lenken selv.

(Bytt ut `christoffer-onskeliste` med det navnet du faktisk valgte i steg 3. Du finner adressen øverst på prosjektsiden i Vercel under **Domains**.)

---

## Senere: slik legger du til eller endrer en vare

Du kan gjøre dette rett i nettleseren, uten å installere noe.

1. Gå til repoet på GitHub og trykk på filen **items.json**.
2. Trykk blyant-ikonet ✏️ oppe til høyre i filen («Edit this file»).
3. Gjør endringen. Det enkleste er å kopiere en eksisterende vare (alt fra `{` til `},`) og endre teksten. Husk:
   - Hver vare må ha en unik `id`, med bare små bokstaver, tall og bindestrek.
   - Mangler prisen, fjerner du linjen `"price"`. Da står det «Se butikken».
   - Størrelse skriver du inn mellom fnuttene i `"size": ""`, for eksempel `"size": "L"`.
   - Pass på kommaene. Mellom hver vare skal det være et komma, men ikke etter den siste i en gruppe.
4. Trykk den grønne knappen **Commit changes…**, og så **Commit changes** igjen. (Å «committe» betyr å lagre en ny versjon.)
5. Vercel oppdager endringen og publiserer på nytt av seg selv. Etter et minutt er den nye versjonen ute.

Blir du usikker, kan du bare be meg om å legge til varen.

---

## Hvis noe ikke virker

| Problem | Løsning |
|---|---|
| «Noe gikk galt. Prøv igjen.» når man trykker «Jeg kjøper denne» | Databasen er ikke koblet til, eller du har ikke gjort steg 5 (Redeploy). Sjekk fanen **Storage** og publiser på nytt. |
| Repoet vises ikke i Vercel | Vercel har ikke fått tilgang til det. Se tipset under steg 3, punkt 2. |
| Siden viser fortsatt den gamle versjonen | Sjekk at endringen er merget inn i `main` (steg 1), og at siste linje under **Deployments** står som **Ready**. Prøv å laste siden på nytt. |
| Noen krysset av ved en feil og har byttet telefon | Bare den som krysset av kan angre, og bare i samme nettleser. Du kan fjerne det selv i Vercel: **Storage** → databasen → **Open in Upstash** → **Data Browser** → `onskeliste:claims` → slett linjen med varens id. (Ikke se på de andre linjene, da ser du hva som er kjøpt!) |
| Siden ble ødelagt etter at jeg endret items.json | Sannsynligvis et komma for mye eller for lite. Be meg sjekke filen, eller gå til **Deployments** i Vercel, trykk **⋯** på en tidligere versjon som virket, og velg **Promote to Production**. |
