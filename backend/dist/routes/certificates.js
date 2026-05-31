"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.certificatesRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
exports.certificatesRouter = (0, express_1.Router)();
// Storage bucket convention:
//   certificates/<student-uuid>/<cert_id>.pdf
// We use signed URLs so the storage objects can remain private.
// POST /api/certificates/issue
// body: { cert_id, student_id, subject_id, snapshot?, exam_score?, issued_at? }
// NOTE: PDF generation + upload via Puppeteer is implemented later in Phase 6.
// This endpoint currently issues DB row only (stub) to unblock UI/API flow.
exports.certificatesRouter.post('/issue', requireAuth_1.requireAuth, async (req, res) => {
    // In Phase 6 we can allow teacher/admin. For now: allow any authenticated user.
    // Later: enforce teacher/admin via profiles.role.
    const _actorId = req.auth.userId;
    const { cert_id, student_id, subject_id, snapshot, exam_score, issued_at, } = req.body;
    if (!cert_id || !student_id || !subject_id) {
        return res.status(400).json({ error: 'missing_cert_id_or_student_id_or_subject_id' });
    }
    // Derive storage path (PDF file may be created in a later step)
    const pdfStoragePath = `certificates/${student_id}/${cert_id}.pdf`;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin.from('certificates').upsert({
        cert_id,
        student_id,
        subject_id,
        issued_at: issued_at ? new Date(issued_at).toISOString() : new Date().toISOString(),
        status: 'active',
        snapshot: snapshot ?? {},
        exam_score: exam_score ?? {},
        pdf_storage_path: pdfStoragePath,
    }, { onConflict: 'cert_id' }).select('*');
    if (error)
        return res.status(400).json({ error: 'certificate_issue_failed', details: error.message });
    return res.json({ certificate: data?.[0] });
});
// GET /api/certificates/me
exports.certificatesRouter.get('/me', requireAuth_1.requireAuth, async (req, res) => {
    const studentId = req.auth.userId;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('certificates')
        .select('id, cert_id, issued_at, status, snapshot, exam_score, pdf_storage_path')
        .eq('student_id', studentId)
        .order('issued_at', { ascending: false });
    if (error)
        return res.status(400).json({ error: 'certificates_fetch_failed', details: error.message });
    // Create signed URLs for the PDF objects
    const results = await Promise.all((data || []).map(async (c) => {
        const path = c.pdf_storage_path;
        // path convention: certificates/<student>/<file>.pdf
        const filePath = path.replace(/^certificates\//, '');
        const bucket = 'certificates';
        const signedUrl = await supabaseAdmin_1.supabaseAdmin
            .storage
            .from(bucket)
            .createSignedUrl(filePath, 60 * 60)
            .then((r) => r.data?.signedUrl ?? null)
            .catch(() => null);
        return {
            ...c,
            pdf_url: signedUrl,
        };
    }));
    return res.json({ certificates: results });
});
// GET /api/certificates/verify/:certId
// Public verify endpoint used by /verify/:certId page.
exports.certificatesRouter.get('/verify/:certId', async (req, res) => {
    const { certId } = req.params;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('certificates')
        .select('cert_id, issued_at, status, snapshot, exam_score, student_id, subject_id')
        .eq('cert_id', certId)
        .maybeSingle();
    if (error)
        return res.status(400).json({ error: 'certificate_verify_failed', details: error.message });
    if (!data)
        return res.status(404).json({ valid: false });
    const { data: subject } = await supabaseAdmin_1.supabaseAdmin
        .from('subjects')
        .select('name_ar, name_en')
        .eq('id', data.subject_id)
        .maybeSingle();
    const { data: student } = await supabaseAdmin_1.supabaseAdmin
        .from('profiles')
        .select('name')
        .eq('id', data.student_id)
        .maybeSingle();
    const filePath = `certificates/${data.student_id}/${data.cert_id}.pdf`.replace(/^certificates\//, '');
    const signedUrl = await supabaseAdmin_1.supabaseAdmin
        .storage
        .from('certificates')
        .createSignedUrl(filePath, 60 * 60)
        .then((r) => r.data?.signedUrl ?? null)
        .catch(() => null);
    return res.json({
        valid: data.status === 'active',
        cert_id: data.cert_id,
        issued_at: data.issued_at,
        status: data.status,
        student_name: student?.name || null,
        subject_name: subject || null,
        exam_score: data.exam_score,
        pdf_url: signedUrl,
    });
});
