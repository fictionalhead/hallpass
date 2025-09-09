// Netlify Function to log hall passes
// Uses server-side file storage

const fs = require('fs').promises;
const path = require('path');

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

        // Create safe filename from teacher email
        const safeTeacherEmail = pass.teacherEmail.replace(/[^a-zA-Z0-9]/g, '_');
        const dataDir = path.join(process.cwd(), 'data');
        const teacherFile = path.join(dataDir, `teacher_${safeTeacherEmail}.json`);

        // Ensure data directory exists
        try {
            await fs.mkdir(dataDir, { recursive: true });
        } catch (err) {
            // Directory might already exist
        }

        // Load existing logs for this teacher
        let logs = [];
        try {
            const existingData = await fs.readFile(teacherFile, 'utf8');
            logs = JSON.parse(existingData);
        } catch (err) {
            // File doesn't exist yet, start with empty array
            console.log(`Creating new log file for teacher: ${pass.teacherEmail}`);
        }

        // Add new pass to the beginning
        logs.unshift(pass);
        
        // Keep only last 1000 passes per teacher to prevent unlimited growth
        if (logs.length > 1000) {
            logs = logs.slice(0, 1000);
        }

        // Save updated logs
        await fs.writeFile(teacherFile, JSON.stringify(logs, null, 2));

        console.log(`Pass saved for ${pass.teacherEmail}: ${pass.name} to ${pass.location}`);

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