import { supabaseAdmin } from '../supabaseAdmin'

export async function upsertTwoFactorSecret(userId: string, secretEncrypted: string) {
  const { error } = await supabaseAdmin
    .from('two_factor_secrets')
    .upsert({ user_id: userId, secret_encrypted: secretEncrypted }, { onConflict: 'user_id' })

  if (error) throw error
}

export async function getTwoFactorSecret(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('two_factor_secrets')
    .select('secret_encrypted')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data?.secret_encrypted ?? null
}

export async function deleteTwoFactorSecret(userId: string) {
  const { error } = await supabaseAdmin.from('two_factor_secrets').delete().eq('user_id', userId)
  if (error) throw error
}
