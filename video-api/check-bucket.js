const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkBucket() {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('Error listing buckets:', error);
        return;
    }
    const videosBucket = data.find(b => b.name === 'videos');
    if (videosBucket) {
        console.log('✅ "videos" bucket exists');
    } else {
        console.log('❌ "videos" bucket DOES NOT exist');
        console.log('Available buckets:', data.map(b => b.name).join(', '));
    }
}

checkBucket();
