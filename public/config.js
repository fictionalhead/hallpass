// Hall Pass Configuration
// Modify this file to customize the hall pass appearance and options

const HALLPASS_CONFIG = {
    // School information
    school: {
        name: "Wyoming Public Schools",
        passTitle: "HALL PASS"
    },
    
    // Available locations
    locations: [
        'Bathroom',
        'Nurse',
        'Main Office',
        'Library',
        'Guidance Counselor',
        'Other'
    ],
    
    // Pass dimensions (in inches)
    passDimensions: {
        width: "3.5in",
        height: "2in"
    },
    
    // Pass styling
    passStyle: {
        borderWidth: "4px",
        borderColor: "#644186",
        backgroundColor: "#ffffff",
        fontFamily: "'Courier New', monospace"
    },
    
    // Date and time format options
    dateFormat: {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    },
    
    timeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    },
    
    // Icons for locations (SVG paths)
    locationIcons: {
        'Bathroom': 'M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14H7v-2h3v2zm0-4H7v-2h3v2zm0-4H7V7h3v2zm7 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2z',
        'Nurse': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
        'Main Office': 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z',
        'Library': 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.95V8c1.35-1.3 3.8-1.95 5.5-1.95 1.2 0 2.4.15 3.5.5v11.95z',
        'Guidance Counselor': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 11 5.5 12 6.5l1-1L15.5 8z',
        'Other': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z'
    }
};