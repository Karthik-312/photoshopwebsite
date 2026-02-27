/**
 * Database module for Spandana Photo House
 * Supports: 1) Java backend (Spring Boot) 2) Supabase
 * Tries Java API first when served from same origin, then falls back to Supabase
 */

let supabaseClient = null;
let useJavaBackend = null; // null = unknown, true/false = determined

async function detectBackend() {
    if (useJavaBackend !== null) return useJavaBackend;
    try {
        const res = await fetch('/api/ratings');
        useJavaBackend = res.ok;
    } catch (e) {
        useJavaBackend = false;
    }
    return useJavaBackend;
}

function getSupabase() {
    if (supabaseClient) return supabaseClient;
    if (typeof supabase === 'undefined') return null;
    const stored = typeof getStoredConfig === 'function' ? getStoredConfig() : null;
    const config = stored || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
    if (!config || !config.url || !config.anonKey || config.url.length < 10) return null;
    supabaseClient = supabase.createClient(config.url, config.anonKey);
    return supabaseClient;
}

/**
 * Fetch ratings - tries Java API first, then Supabase
 */
async function fetchRatings() {
    if (await detectBackend()) {
        try {
            const res = await fetch('/api/ratings');
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            return {
                average: data.average || 0,
                total: data.total || 0,
                distribution: data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                recentRatings: (data.recentRatings || []).map(r => ({
                    stars: r.stars,
                    client_name: r.client_name,
                    review_text: r.review_text,
                    created_at: r.created_at
                }))
            };
        } catch (e) {
            console.warn('Java API unavailable, trying Supabase');
        }
    }

    const client = getSupabase();
    if (!client) return null;

    try {
        const { data, error } = await client.from('ratings')
            .select('stars, client_name, review_text, created_at')
            .order('created_at', { ascending: false });

        if (error) return null;
        if (!data || data.length === 0) {
            return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, recentRatings: [] };
        }

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        data.forEach(r => { distribution[r.stars]++; sum += r.stars; });
        const total = data.length;
        const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
        return { average, total, distribution, recentRatings: data.slice(0, 10) };
    } catch (err) {
        return null;
    }
}

/**
 * Submit rating - tries Java API first, then Supabase
 */
async function submitRating(stars, clientName = '', reviewText = '') {
    if (!stars || stars < 1 || stars > 5) {
        return { success: false, error: 'Please select a rating from 1 to 5 stars.' };
    }

    if (await detectBackend()) {
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stars: parseInt(stars), clientName: clientName.trim(), reviewText: reviewText.trim() })
            });
            const data = await res.json();
            if (data.success) return { success: true };
            return { success: false, error: data.error || 'Failed' };
        } catch (e) {
            console.warn('Java API unavailable');
        }
    }

    const client = getSupabase();
    if (!client) {
        return { success: false, error: 'Database not configured. Run the Java app or add Supabase credentials.' };
    }
    try {
        const { error } = await client.from('ratings').insert([{
            stars: parseInt(stars), client_name: clientName.trim() || null, review_text: reviewText.trim() || null
        }]);
        return error ? { success: false, error: error.message } : { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Submit contact - tries Java API first, then Supabase
 */
async function submitContact(name, email, phone, message) {
    if (await detectBackend()) {
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone: phone || '', message })
            });
            const data = await res.json();
            if (data.success) return { success: true };
            return { success: false, error: data.error || 'Failed' };
        } catch (e) {}
    }

    const client = getSupabase();
    if (!client) return { success: false, error: 'Database not configured.' };
    try {
        const { error } = await client.from('contact_submissions').insert([{ name, email, phone: phone || null, message }]);
        return error ? { success: false, error: error.message } : { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Submit booking - tries Java API first
 */
async function submitBooking(data) {
    if (await detectBackend()) {
        try {
            const res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) return { success: true };
            return { success: false, error: result.error || 'Failed' };
        } catch (e) {
            console.warn('Booking API unavailable');
        }
    }
    return { success: false, error: 'Backend not available. Run the Java app.' };
}
