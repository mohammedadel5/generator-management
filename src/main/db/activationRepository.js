const { createClient } = require('@supabase/supabase-js');
const { machineIdSync } = require('node-machine-id');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Supabase Configuration (Hardcoded for easy distribution)
const SUPABASE_URL = 'https://ndznebhuopyortrubnwj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem5lYmh1b3B5b3J0cnVibndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDA4MTgsImV4cCI6MjA4ODU3NjgxOH0.330PUvbCjdWr4f5HxcJyI0jgY2UJEl85b6hDY9JqhFM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const activationPath = path.join(app.getPath('userData'), 'activation.json');

const getHWID = () => {
    return machineIdSync();
};

const verifyLicenseStatus = async () => {
    if (!fs.existsSync(activationPath)) return false;
    
    try {
        const localData = JSON.parse(fs.readFileSync(activationPath, 'utf8'));
        const hwid = getHWID();

        // Basic HWID check first
        if (localData.machine_id !== hwid) return false;

        // Try to check online status
        const { data, error, status } = await supabase
            .from('licenses')
            .select('is_active, machine_id')
            .eq('key', localData.key)
            .single();

        if (error) {
            // Status 406 means "No rows found"
            if (status === 406) {
                if (fs.existsSync(activationPath)) fs.unlinkSync(activationPath);
                return false;
            }
            // Trust local activation for network issues
            return true; 
        }

        if (!data.is_active || data.machine_id !== hwid) {
            if (fs.existsSync(activationPath)) fs.unlinkSync(activationPath);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Verify License Error:', e);
        return false;
    }
};

const activateLicense = async (key) => {
    const hwid = getHWID();
    try {
        const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('key', key)
            .single();

        if (error || !data) return { success: false, error: 'رمز التنشيط غير صحيح' };
        if (!data.is_active) return { success: false, error: 'هذا الرمز تم إيقافه' };

        if (data.machine_id && data.machine_id !== hwid) {
            return { success: false, error: 'هذا الرمز مسجل على جهاز آخر' };
        }

        if (!data.machine_id) {
            const { error: updateError } = await supabase
                .from('licenses')
                .update({ 
                    machine_id: hwid, 
                    activated_at: new Date().toISOString() 
                })
                .eq('id', data.id);
            
            if (updateError) return { success: false, error: 'فشل في ربط الجهاز بالرمز' };
        }

        fs.writeFileSync(activationPath, JSON.stringify({
            activated: true,
            machine_id: hwid,
            key: key,
            customer_name: data.customer_name || 'مستخدم غير معروف'
        }));

        return { success: true };
    } catch (err) {
        console.error('Activation error:', err);
        return { success: false, error: 'حدث خطأ في الاتصال بالخادم' };
    }
};

const getActivationInfo = () => {
    if (!fs.existsSync(activationPath)) return null;
    try {
        return JSON.parse(fs.readFileSync(activationPath, 'utf8'));
    } catch (e) {
        return null;
    }
};

module.exports = {
    getHWID,
    verifyLicenseStatus,
    activateLicense,
    getActivationInfo
};
