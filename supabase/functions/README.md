# Supabase Edge Functions pour TFExpress

Ce dossier contient les Edge Functions Supabase pour gérer les paiements Jeko.

## Installation

1. Installer le CLI Supabase :

```bash
npm install -g supabase
```

2. Se connecter à votre projet Supabase :

```bash
supabase login
supabase link --project-ref dqikchghdgdcfbgdrlro
```

3. Configurer les secrets :

```bash
supabase secrets set JEKO_API_KEY=votre_cle_api
supabase secrets set JEKO_KEY_ID=votre_key_id
supabase secrets set JEKO_STORE_ID=votre_store_id
supabase secrets set JEKO_WEBHOOK_SECRET=votre_webhook_secret
```

4. Déployer les functions :

```bash
supabase functions deploy jeko-checkout
supabase functions deploy jeko-webhook
```

## URLs des fonctions

Après déploiement, vos fonctions seront disponibles à :

- Checkout: `https://dqikchghdgdcfbgdrlro.supabase.co/functions/v1/jeko-checkout`
- Webhook: `https://dqikchghdgdcfbgdrlro.supabase.co/functions/v1/jeko-webhook`

## Configuration du frontend

Mettre à jour `src/services/api/config.js` :

```javascript
export const API_URL = "https://dqikchghdgdcfbgdrlro.supabase.co/functions/v1";
```

## Configuration Jeko

Dans votre dashboard Jeko, configurer l'URL du webhook :

```
https://dqikchghdgdcfbgdrlro.supabase.co/functions/v1/jeko-webhook
```
