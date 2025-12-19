# Secrets Setup Guide

This guide explains how to configure secrets for the notification pipeline.

## Required Secrets

The notification pipeline requires the following secrets to be configured:

### 1. RESEND_API_KEY (Required)

Your Resend API key for sending emails.

**Get your API key:**
1. Sign up at https://resend.com
2. Navigate to API Keys in the dashboard
3. Create a new API key

**Set locally:**
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Set in production:**
```bash
supabase secrets set --project-ref <your-project-ref> RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 2. EMAIL_FROM (Optional)

The sender email address for notifications. Defaults to `noreply@saele.com`.

**Set locally:**
```bash
supabase secrets set EMAIL_FROM=noreply@yourdomain.com
```

### 3. Vault Secrets (Auto-configured)

The following secrets are automatically available in Supabase Vault:
- `project_url` - Your Supabase project URL
- `anon_key` - Your Supabase anonymous key

These are used by the pg_cron scheduler to invoke the Edge Function.

## Setup Instructions

### Local Development

1. **Start Supabase locally:**
   ```bash
   pnpm run db:start
   ```

2. **Set local secrets:**
   ```bash
   # Create .env.local file with:
   echo "RESEND_API_KEY=re_xxxxxxxxxxxxx" >> .env.local
   echo "EMAIL_FROM=noreply@saele.com" >> .env.local
   
   # Set secrets in Supabase
   supabase secrets set --env-file .env.local
   ```

3. **Verify secrets are set:**
   ```bash
   supabase secrets list
   ```

### Production Deployment

1. **Link to your production project:**
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

2. **Set production secrets:**
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
   supabase secrets set EMAIL_FROM=noreply@yourdomain.com
   ```

3. **Verify secrets in production:**
   ```bash
   supabase secrets list --project-ref <your-project-ref>
   ```

## Testing Secrets

You can test if secrets are properly configured by invoking the Edge Function manually:

```bash
# Local test
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-notifications' \
  --header 'Authorization: Bearer <your-anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"test": true}'

# Production test
curl -i --location --request POST 'https://<your-project-ref>.supabase.co/functions/v1/process-notifications' \
  --header 'Authorization: Bearer <your-anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"test": true}'
```

## Troubleshooting

### Secret not found error

If you get "Secret not found" errors:

1. Verify secrets are set:
   ```bash
   supabase secrets list
   ```

2. Redeploy the Edge Function:
   ```bash
   supabase functions deploy process-notifications
   ```

### Permission denied

If you get permission errors accessing secrets:

1. Ensure you're using the service role key in the Edge Function
2. Check that the Supabase client is initialized correctly
3. Verify your project permissions

### Resend API errors

If you get Resend API errors:

1. Verify your API key is valid at https://resend.com/api-keys
2. Check your Resend account status and limits
3. Ensure your domain is verified (if using custom domain)
4. Review Resend API logs for specific error messages

## Security Best Practices

1. **Never commit secrets to git**
   - `.env.local` is in `.gitignore`
   - Use `supabase secrets` CLI for production

2. **Rotate secrets regularly**
   - Update Resend API key periodically
   - Use `supabase secrets set` to update

3. **Use different keys for environments**
   - Use test API keys for local development
   - Use production API keys only in production

4. **Monitor secret usage**
   - Check Edge Function logs for authentication errors
   - Monitor Resend dashboard for API usage

## Additional Resources

- [Supabase Secrets Documentation](https://supabase.com/docs/guides/functions/secrets)
- [Resend API Documentation](https://resend.com/docs/api-reference/introduction)
- [Resend Dashboard](https://resend.com/overview)
