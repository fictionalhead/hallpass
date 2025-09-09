// Database configuration and utilities
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with your project credentials
const supabaseUrl = 'https://eusldzvhrmnoshepycuf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1c2xkenZocm1ub3NoZXB5Y3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODQ4NzEsImV4cCI6MjA3Mjk2MDg3MX0.dyI3QZQeaEApqC7JrYF2-6hzDGGJ2KG-ZxJVkhjxePs';

const supabase = createClient(supabaseUrl, supabaseKey);

// Database functions
const database = {
    // Save a new hall pass
    async savePass(pass) {
        const { data, error } = await supabase
            .from('hall_passes')
            .insert([{
                id: pass.id,
                teacher_email: pass.teacherEmail,
                student_name: pass.name,
                location: pass.location,
                timestamp: pass.timestamp,
                created_at: new Date().toISOString()
            }]);
            
        if (error) {
            throw new Error(`Failed to save pass: ${error.message}`);
        }
        
        return data;
    },

    // Get passes for a specific teacher
    async getPassesForTeacher(teacherEmail, limit = 1000) {
        const { data, error } = await supabase
            .from('hall_passes')
            .select('*')
            .eq('teacher_email', teacherEmail)
            .order('timestamp', { ascending: false })
            .limit(limit);
            
        if (error) {
            throw new Error(`Failed to get passes: ${error.message}`);
        }
        
        // Convert back to frontend format
        return data.map(row => ({
            id: row.id,
            name: row.student_name,
            location: row.location,
            timestamp: row.timestamp,
            teacherEmail: row.teacher_email
        }));
    },

    // Get all passes (admin only)
    async getAllPasses(limit = 10000) {
        const { data, error } = await supabase
            .from('hall_passes')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);
            
        if (error) {
            throw new Error(`Failed to get all passes: ${error.message}`);
        }
        
        // Convert back to frontend format and get unique teachers
        const passes = data.map(row => ({
            id: row.id,
            name: row.student_name,
            location: row.location,
            timestamp: row.timestamp,
            teacherEmail: row.teacher_email
        }));
        
        const teachers = [...new Set(data.map(row => row.teacher_email))].sort();
        
        return { passes, teachers };
    },

    // Create the table if it doesn't exist (for initial setup)
    async createTable() {
        const { error } = await supabase.rpc('create_hall_passes_table');
        if (error) {
            console.error('Table creation error:', error);
        }
    }
};

module.exports = database;