"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertTwoFactorSecret = upsertTwoFactorSecret;
exports.getTwoFactorSecret = getTwoFactorSecret;
exports.deleteTwoFactorSecret = deleteTwoFactorSecret;
const supabaseAdmin_1 = require("../supabaseAdmin");
async function upsertTwoFactorSecret(userId, secretEncrypted) {
    const { error } = await supabaseAdmin_1.supabaseAdmin
        .from('two_factor_secrets')
        .upsert({ user_id: userId, secret_encrypted: secretEncrypted }, { onConflict: 'user_id' });
    if (error)
        throw error;
}
async function getTwoFactorSecret(userId) {
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('two_factor_secrets')
        .select('secret_encrypted')
        .eq('user_id', userId)
        .maybeSingle();
    if (error)
        throw error;
    return data?.secret_encrypted ?? null;
}
async function deleteTwoFactorSecret(userId) {
    const { error } = await supabaseAdmin_1.supabaseAdmin.from('two_factor_secrets').delete().eq('user_id', userId);
    if (error)
        throw error;
}
