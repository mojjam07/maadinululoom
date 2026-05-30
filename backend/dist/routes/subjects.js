import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin';
export const subjectsRouter = Router();
subjectsRouter.get('/', async (_req, res) => {
    const { data, error } = await supabaseAdmin.from('subjects').select('id, name_ar, name_en, description, icon').order('id');
    if (error)
        return res.status(500).json({ error: 'subjects_failed' });
    return res.json({ subjects: data || [] });
});
