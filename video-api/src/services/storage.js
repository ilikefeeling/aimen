const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

/**
 * Upload file to Supabase Storage
 * @param {string} path - Storage path (e.g., 'videos/user123/video.mp4')
 * @param {Buffer} buffer - File buffer
 * @param {string} contentType - MIME type
 * @returns {Promise<{url: string, error: any}>}
 */
async function uploadToStorage(path, buffer, contentType) {
    try {
        const { data, error } = await supabase.storage
            .from('videos') // Bucket name
            .upload(path, buffer, {
                contentType,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return { url: null, error };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(path);

        return {
            url: urlData.publicUrl,
            error: null,
        };

    } catch (error) {
        console.error('Storage service error:', error);
        return { url: null, error };
    }
}

/**
 * Delete file from Supabase Storage
 * @param {string} path - Storage path
 */
async function deleteFromStorage(path) {
    try {
        const { data, error } = await supabase.storage
            .from('videos')
            .remove([path]);

        if (error) {
            console.error('Supabase delete error:', error);
            return { success: false, error };
        }

        return { success: true, error: null };

    } catch (error) {
        console.error('Storage delete error:', error);
        return { success: false, error };
    }
}

module.exports = {
    uploadToStorage,
    deleteFromStorage,
    supabase,
};
