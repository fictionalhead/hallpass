// Netlify Function to log hall passes
// Uses Netlify Blobs for persistent storage

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const pass = JSON.parse(event.body);
        
        // Validate pass data
        if (!pass.id || !pass.name || !pass.location || !pass.timestamp) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid pass data' })
            };
        }

        // Get existing logs from Netlify Blobs
        const { getStore } = await import('@netlify/blobs');
        const store = getStore('hallpass-logs');
        
        // Get current logs
        let logs = [];
        try {
            const existingLogs = await store.get('passes', { type: 'json' });
            if (existingLogs) {
                logs = existingLogs;
            }
        } catch (e) {
            // No existing logs, start with empty array
            console.log('No existing logs found, starting fresh');
        }

        // Add new pass to the beginning
        logs.unshift(pass);
        
        // Keep only last 1000 passes to prevent unlimited growth
        if (logs.length > 1000) {
            logs = logs.slice(0, 1000);
        }

        // Save updated logs
        await store.setJSON('passes', logs);

        // Also save individual pass for archival (with date-based key)
        const date = new Date(pass.timestamp);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const passKey = `archive/${dateKey}/${pass.id}`;
        await store.setJSON(passKey, pass);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: true, 
                message: 'Pass logged successfully',
                passId: pass.id 
            })
        };
    } catch (error) {
        console.error('Error logging pass:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to log pass',
                details: error.message 
            })
        };
    }
};