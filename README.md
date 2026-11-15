# Christoffers ønskeliste – jul 2026

Én statisk side (`index.html`) + én serverless-funksjon (`api/claims.js`) på Vercel.
Avkrysningene lagres i Upstash Redis. Varene ligger i `items.json`.

- Vanlig lenke (send til andre): `https://<din-url>/`
- Eierlenke (bruk selv, skjuler alle avkrysninger): `https://<din-url>/?eier=1`

## Oppsett (gjøres én gang)

1. **Main-branch:** Slå sammen arbeidsbranchen inn i `main` på GitHub. Vercel deployer det som ligger på `main` til produksjon.
2. **Koble repoet i Vercel:** vercel.com → *Add New… → Project* → *Import Git Repository* → velg dette repoet.
   Framework Preset: **Other**. La Build Command og Output Directory stå tomme. Trykk **Deploy**.
3. **Legg til Upstash Redis:** I Vercel-prosjektet → fanen **Storage** → *Create Database* (eller *Browse Marketplace*) → **Upstash for Redis** →
   velg region nær Norge (f.eks. Frankfurt / `eu-central-1`), gratisplanen holder → koble databasen til prosjektet for alle miljøer.
   Vercel legger da inn `KV_REST_API_URL` og `KV_REST_API_TOKEN` som env-variabler automatisk.
4. **Redeploy:** *Deployments* → ⋯ ved siste deploy → **Redeploy**, så funksjonen får env-variablene.
5. **Test:** Åpne siden på telefonen, trykk «Jeg kjøper denne», og åpne siden i en annen nettleser. Varen skal vises som tatt.

Etter dette deployes hver push til `main` automatisk.

## Legge til eller endre varer

Rediger `items.json` og push. Felter per vare:

| Felt        | Påkrevd | Beskrivelse |
|-------------|---------|-------------|
| `id`        | ja      | Unik, små bokstaver/tall/bindestrek. **Ikke endre** etter at noen har krysset av (avkrysningen henger på id-en). |
| `name`      | ja      | Navnet som vises. |
| `links`     | ja      | Liste med `{ "store": "Butikk", "url": "https://…" }`. Første lenke brukes for «Se butikken». |
| `price`     | nei     | Tall i kroner, f.eks. `1379`. Mangler den, vises «Se butikken». |
| `priceNote` | nei     | Liten tekst under prisen, f.eks. `"Black Week, ord. 1 899 kr"`. |
| `size`      | nei     | Størrelse. Vises bare hvis den er fylt inn. |
| `note`      | nei     | Notat i kursiv. |
| `favorite`  | nei     | `true` gir en stjerne. |
| `image`     | nei     | Bilde-URL. Mangler den, vises en plassholder. |

**Bilder:** `npm install && npm run bilder` henter `og:image` fra butikksiden for varer som mangler bilde.
Noen butikker (f.eks. Løpeshop) blokkerer dette. Da kan du lime inn en bilde-URL selv (høyreklikk på produktbildet → kopier bildeadresse), eller la plassholderen stå.

## Nyttig å vite

- Den som krysser av kan angre i samme nettleser (husket i localStorage). Bytter de telefon, kan du fjerne avkrysningen i Upstash-konsollen:
  *Data Browser* → nøkkelen `onskeliste:claims` → slett feltet med varens id.
- Eiervisningen skjuler avkrysningene, men er ikke en sperre. Bare ikke åpne den vanlige lenken selv.
