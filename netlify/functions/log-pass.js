// Netlify Function to log hall passes
// Uses Supabase database for persistent storage

const database = require('./lib/database');

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

        // Save to Supabase database
        console.log(`Saving pass to database: ${pass.teacherEmail} - ${pass.name} to ${pass.location}`);
        await database.savePass(pass);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: true, 
                message: 'Pass logged successfully in database',
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