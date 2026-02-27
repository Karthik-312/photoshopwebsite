/**
 * Supabase Configuration
 * 
 * OPTION 1 (Recommended for deployment): Edit the values below and deploy.
 * OPTION 2 (Quick test): Click "Setup Database" on the website - saves to browser.
 */

const STORAGE_KEY = 'spandana_supabase_config';

// Edit these for production - when you deploy, all visitors will use this config
const FILE_CONFIG = {
    url: 'https://iwvekkdmhishctrcscwl.supabase.co',      // e.g. https://abcdefgh.supabase.co
    anonKey: 'sb_publishable_vvHN38qmwBCDrrUBfjyZdQ_piKhvQFU'   // Your Supabase anon/public key
};

function getStoredConfig() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.url && parsed?.anonKey) return parsed;
        }
    } catch (e) {}
    return null;
}

function saveConfig(url, anonKey) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
}

function clearConfig() {
    localStorage.removeItem(STORAGE_KEY);
}

// Use: localStorage first (for testing), then file config (for deployment)
const stored = getStoredConfig();
const fileValid = FILE_CONFIG.url && FILE_CONFIG.url.length > 10 && FILE_CONFIG.anonKey && FILE_CONFIG.anonKey.length > 20;
const SUPABASE_CONFIG = stored || (fileValid ? FILE_CONFIG : { url: '', anonKey: '' });

const isConfigValid = () => {
    return SUPABASE_CONFIG.url && 
           SUPABASE_CONFIG.url.length > 10 &&
           SUPABASE_CONFIG.anonKey && 
           SUPABASE_CONFIG.anonKey.length > 20;
};

// Social & Contact Links - Edit these for your business
const SITE_CONFIG = {
    whatsapp: '919876543210',           // Country code + number, no + or spaces
    facebook: 'https://facebook.com/spandana-photo-house',
    instagram: 'https://instagram.com/spandana_photo_house',
    twitter: 'https://twitter.com/spandana_photo',
    pinterest: 'https://pinterest.com/spandana_photo',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5249999999997!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v1',  // Replace with your location
    adminPassword: 'admin123'           // Change for production!
};
