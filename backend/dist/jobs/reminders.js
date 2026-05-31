"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runClassRemindersOnce = runClassRemindersOnce;
const supabaseAdmin_1 = require("../supabaseAdmin");
const reminderDispatch_js_1 = require("../services/reminderDispatch.js");
function getOffsetKey(offsetMins) {
    return `T-${offsetMins}m`;
}
function buildMessage(params) {
    const { topic, startTimeISO, offsetMins } = params;
    const when = new Date(startTimeISO);
    const dateStr = when.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
    const title = 'Upcoming live class';
    const body = `${topic ? `${topic} — ` : ''}Starts at ${dateStr} (${getOffsetKey(offsetMins)}).`;
    return { title, body };
}
async function notificationExists(args) {
    const { userId, classId, offsetMins } = args;
    // notifications schema currently has no metadata column.
    // We'll dedupe using the message prefix we generate.
    const offsetKey = getOffsetKey(offsetMins);
    const { data } = await supabaseAdmin_1.supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'class_reminder')
        .ilike('message', `%class_id:${classId}%${offsetKey}%`)
        .maybeSingle();
    return Boolean(data);
}
async function createNotification(args) {
    const { userId, classId, offsetMins, topic, startTimeISO } = args;
    const { title, body } = buildMessage({ topic, startTimeISO, offsetMins });
    // Encode classId + offset inside message for best-effort dedupe
    const message = `class_id:${classId} offset:${getOffsetKey(offsetMins)} ${body}`;
    const { error } = await supabaseAdmin_1.supabaseAdmin.from('notifications').insert({
        user_id: userId,
        type: 'class_reminder',
        message,
    });
    if (error) {
        // eslint-disable-next-line no-console
        console.error('createNotification failed', error);
    }
}
async function runClassRemindersOnce() {
    const now = new Date();
    const offsets = [60, 10];
    // Window: next 90 minutes to capture 60 and 10 minute offsets reliably.
    const windowStart = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const windowEnd = new Date(now.getTime() + 90 * 60 * 1000).toISOString();
    // Fetch classes in window
    const { data: classes, error: classErr } = await supabaseAdmin_1.supabaseAdmin
        .from('classes')
        .select('id, topic, start_time, teacher_id')
        .gte('start_time', windowStart)
        .lte('start_time', windowEnd)
        .order('start_time', { ascending: true });
    if (classErr) {
        // eslint-disable-next-line no-console
        console.error('runClassRemindersOnce classes query failed', classErr);
        return { inserted: 0 };
    }
    let inserted = 0;
    for (const cls of classes || []) {
        const classId = cls.id;
        const startTimeISO = cls.start_time;
        // For each offset, check if the class is exactly in the target minute bucket.
        // Because we run periodically, use a tolerance: now within +/- 2 minutes of target.
        for (const offsetMins of offsets) {
            const target = new Date(new Date(startTimeISO).getTime() - offsetMins * 60 * 1000);
            const diffMs = Math.abs(new Date().getTime() - target.getTime());
            if (diffMs > 2 * 60 * 1000)
                continue;
            // students enrolled in class
            const { data: enrollments, error: enrErr } = await supabaseAdmin_1.supabaseAdmin
                .from('class_enrollments')
                .select('student_id')
                .eq('class_id', classId);
            if (enrErr) {
                // eslint-disable-next-line no-console
                console.error('runClassRemindersOnce enrollment query failed', enrErr);
                continue;
            }
            for (const enr of enrollments || []) {
                const userId = enr.student_id;
                const already = await notificationExists({ userId, classId, offsetMins });
                if (already)
                    continue;
                await createNotification({
                    userId,
                    classId,
                    offsetMins,
                    topic: cls.topic,
                    startTimeISO,
                });
                inserted += 1;
                // Best-effort dispatch (push/email/whatsapp)
                await (0, reminderDispatch_js_1.sendClassReminderBestEffort)({
                    userId,
                    classId,
                    offsetMins,
                    topic: cls.topic,
                    startTimeISO,
                });
            }
        }
    }
    return { inserted };
}
