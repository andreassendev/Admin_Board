# Admin Board

Intern admin-app for ELgrossist. Brukes av kontoret for å se og håndtere ordrer,
pakke og sende varer, og få oversikt over aktivitet i nettbutikken.

## Oppsett

1. Installer dependencies:
```bash
npm install
```

2. Kopier `.env.example` til `.env.local` og fyll inn Supabase-credentials
   (samme prosjekt som `demoElgrossist`-butikken):
```bash
cp .env.example .env.local
```

3. Start dev-server:
```bash
npm run dev
```

4. Åpne [http://localhost:3000](http://localhost:3000)

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (samme database som butikken)

## Database

Kobler seg til samme Supabase-prosjekt som `demoElgrossist`. Leser fra:
- `orders` - kundeordrer
- `order_items` - produkter i hver ordre
- `cart_items` - aktive handlekurver
- `products` - produktkatalog
- `users` - kunder

## Planlagte funksjoner

**Fase 1 (MVP)**
- Dashboard med nøkkeltall (aktive kurver, ventende ordrer, sendte)
- Ordrer-tabell med filter på status
- Ordre-detalj med "Marker som pakket" / "Send"
- Handlekurv-tracker (abandoned carts)

**Fase 2 (krever firma)**
- Fraktetiketter via Posten/Bring API
- Printing
- E-post til kunde ved sending

**Fase 3**
- Lagerstyring
- Returer
- Tripletex-integrasjon
