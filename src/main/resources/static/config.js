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

// Social & Contact Links - Spandana Photo House (Ongole, A.P.)
const SITE_CONFIG = {
    studioName: 'Spandana Photo House',
    phone1: '9849146903',               // D. VenkataRao - Artist & Photographer
    phone2: '8008510110',               // D.S. Jyothi Kumar
    whatsapp: '919849146903',           // Country code + number, no + or spaces
    email: 'dvr.spandana@gmail.com',
    address: 'Near Mastan Durga Center, Trunk Road, Ongole - 523 001, A.P.',
    facebook: 'https://facebook.com/spandana-photo-house',
    instagram: 'https://instagram.com/spandana_photo_house',
    twitter: 'https://twitter.com/spandana_photo',
    pinterest: 'https://pinterest.com/spandana_photo',
    googleMapsEmbed: 'https://maps.google.com/maps?q=Ongole,+Andhra+Pradesh&t=&z=14&ie=UTF8&iwloc=&output=embed',  // Ongole, A.P. - update with exact Mastan Durga Center location when available
    adminPassword: 'admin123'           // Change for production!
};
