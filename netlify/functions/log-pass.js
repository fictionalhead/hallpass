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
        
        // Validate pass data - now also requires teacherEmail
        if (!pass.id || !pass.name || !pass.location || !pass.timestamp || !pass.teacherEmail) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid pass data - teacher email required' })
            };
        }

        // Get existing logs from Netlify Blobs
        const { getStore } = await import('@netlify/blobs');
        const store = getStore('hallpass-logs');
        
        // Use teacher email as folder/key prefix
        const teacherKey = `teacher_${pass.teacherEmail.replace(/[^a-zA-Z0-9]/g, '_')}/passes`;
        
        // Get current logs for this teacher
        let logs = [];
        try {
            const existingLogs = await store.get(teacherKey, { type: 'json' });
            if (existingLogs) {
                logs = existingLogs;
            }
        } catch (e) {
            // No existing logs for this teacher, start with empty array
            console.log(`No existing logs found for teacher ${pass.teacherEmail}, starting fresh`);
        }

        // Add new pass to the beginning
        logs.unshift(pass);
        
        // Keep only last 1000 passes per teacher to prevent unlimited growth
        if (logs.length > 1000) {
            logs = logs.slice(0, 1000);
        }

        // Save updated logs for this teacher
        await store.setJSON(teacherKey, logs);

        // Also save individual pass for archival (with date-based key and teacher folder)
        const date = new Date(pass.timestamp);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const teacherFolder = `teacher_${pass.teacherEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const passKey = `${teacherFolder}/archive/${dateKey}/${pass.id}`;
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