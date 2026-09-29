# Sulyap — setup
1. Supabase: create a project (name it Sulyap, pick the closest region). Open SQL Editor > New query, paste `supabase/schema.sql`, click Run.
2. Authentication > Sign In / Providers > Email: turn OFF "Confirm email" while testing (turn it back on before going public).
3. Project Settings > API: copy the Project URL and the anon/public key. Copy `.env.local.example` to `.env.local` and paste them in. NEVER use or share the service_role key.
4. Run: `npm install` then `npm run dev` and open http://localhost:3000
5. Deploy: push this folder to GitHub, import the repo in Vercel, add the same two env variables, click Deploy.
