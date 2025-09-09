// Netlify Function to retrieve all hall pass logs (admin only)

exports.handler = async (event, context) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse query parameters - requires adminEmail
        const queryParams = event.queryStringParameters || {};
        const { adminEmail } = queryParams;
        
        // Check if admin email is provided and is the authorized admin
        if (!adminEmail || adminEmail !== 'meyere@wyomingps.org') {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Unauthorized - Admin access only' })
            };
        }
        
        // Get logs from Netlify Blobs
        const { getStore } = await import('@netlify/blobs');
        const store = getStore('hallpass-logs');
        
        // Get all teacher folders
        const allLogs = [];
        const teachers = new Set();
        
        // List all keys to find teacher folders
        const { blobs } = await store.list();
        
        for (const blob of blobs) {
            // Check if this is a teacher passes file
            if (blob.key.startsWith('teacher_') && blob.key.endsWith('/passes')) {
                try {
                    const teacherLogs = await store.get(blob.key, { type: 'json' });
                    if (teacherLogs && Array.isArray(teacherLogs)) {
                        // Extract teacher identifier from the key
                        const teacherMatch = blob.key.match(/teacher_([^/]+)\/passes/);
                        if (teacherMatch) {
                            // Add teacher info to each log entry
                            teacherLogs.forEach(log => {
                                if (log.teacherEmail) {
                                    teachers.add(log.teacherEmail);
                                }
                            });
                            allLogs.push(...teacherLogs);
                        }
                    }
                } catch (e) {
                    console.log(`Error reading logs from ${blob.key}:`, e);
                }
            }
        }
        
        // Sort all logs by timestamp (newest first)
        allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ 
                success: true,
                logs: allLogs,
                count: allLogs.length,
                teachers: Array.from(teachers).sort()
            })
        };
    } catch (error) {
        console.error('Error retrieving all logs:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to retrieve logs',
                details: error.message 
            })
        };
    }
};