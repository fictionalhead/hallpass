// Netlify Function to retrieve all hall pass logs (admin only)
// Uses Supabase database for persistent storage

const database = require('./lib/database');

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
        
        console.log('Admin loading all logs from database');
        
        // Get all logs from Supabase database
        const { passes, teachers } = await database.getAllPasses();

        console.log(`Admin returning ${passes.length} total logs from ${teachers.length} teachers`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ 
                success: true,
                logs: passes,
                count: passes.length,
                teachers: teachers
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