// Brother QL-820NWB Direct Printing Module
// Simplified approach for reliable label printing

class BrotherLabelPrinter {
    constructor() {
        // Brother label configurations with EXACT specifications
        // These must match Brother's internal label database exactly
        this.labelConfig = {
            // DK-2205: Continuous paper tape, 62mm wide (2.4 inches)
            // Match exactly what's in Brother's Continuous Tape Format Settings
            'DK-2205': {
                width: '2.4in',  // Exactly 2.4 inches as shown in Brother settings
                height: '3.9in', // 3.9 inches for ~100mm length
                name: 'DK-2205 Continuous Paper 62mm',
                continuous: true
            },
            // DK-2251: Continuous paper tape, 62mm wide, black/red on white
            'DK-2251': {
                width: '2.4in',
                height: '5.9in', // 150mm for longer labels
                name: 'DK-2251 Continuous 62mm B/R'
            },
            // DK-1201: Standard address labels 29x90mm
            'DK-1201': {
                width: '1.1in',  // 29mm
                height: '3.5in', // 90mm
                name: 'DK-1201 Address Labels'
            },
            // DK-1202: Shipping labels 62x100mm (same size as DK-2205 but die-cut)
            'DK-1202': {
                width: '2.4in',
                height: '3.9in',
                name: 'DK-1202 Shipping Labels'
            }
        };
        this.currentLabel = 'DK-2205';
    }

    // Print with Brother label settings
    printLabel(labelType = 'DK-2205') {
        const config = this.labelConfig[labelType] || this.labelConfig['DK-2205'];

        const passElement = document.getElementById('printable-pass');
        console.log('Brother Label Print:', {
            labelType: labelType,
            dimensions: config,
            passElement: passElement,
            passHTML: passElement ? passElement.innerHTML.substring(0, 200) : 'NOT FOUND',
            passVisible: passElement ? window.getComputedStyle(passElement).visibility : 'N/A'
        });

        // Create a dedicated print stylesheet
        this.injectPrintStyles(config);

        // Add beforeprint listener for debugging
        const beforePrintDebug = () => {
            const pass = document.getElementById('printable-pass');
            console.log('BEFORE PRINT - Pass check:', {
                exists: !!pass,
                visibility: pass ? window.getComputedStyle(pass).visibility : 'N/A',
                display: pass ? window.getComputedStyle(pass).display : 'N/A',
                innerHTML: pass ? pass.innerHTML.substring(0, 100) : 'N/A'
            });
            window.removeEventListener('beforeprint', beforePrintDebug);
        };
        window.addEventListener('beforeprint', beforePrintDebug);

        // Small delay to ensure styles are applied
        setTimeout(() => {
            window.print();
        }, 100);
    }

    injectPrintStyles(config) {
        // Remove any existing Brother print styles
        const existingStyle = document.getElementById('brother-print-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create new style element
        const style = document.createElement('style');
        style.id = 'brother-print-styles';
        style.textContent = `
            @media print {
                /* Page setup for Brother label */
                @page {
                    /* Brother QL-820NWB - Use standard Letter size and let printer handle cutting */
                    size: 2.4in 11in;  /* Width matches tape, height is max for continuous */
                    margin: 0 !important;
                }

                @page :first {
                    margin: 0 !important;
                }

                /* Reset all elements */
                * {
                    margin: 0;
                    padding: 0;
                    border: 0;
                    font-size: 100%;
                    font: inherit;
                    vertical-align: baseline;
                }

                /* Hide everything */
                html, body {
                    margin: 0;
                    padding: 0;
                    width: ${config.width};
                    height: ${config.height};
                    overflow: hidden;
                }

                /* First hide all elements */
                body * {
                    visibility: hidden !important;
                }

                /* Then show only the pass container and ALL its descendants */
                #printable-pass-container,
                #printable-pass-container *,
                #printable-pass,
                #printable-pass * {
                    visibility: visible !important;
                }

                /* Position the container */
                #printable-pass-container {
                    display: block !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: ${config.width} !important;
                    height: ${config.height} !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                    z-index: 999999 !important;
                }

                #printable-pass {
                    display: block !important;
                    visibility: visible !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: ${config.width} !important;
                    height: ${config.height} !important;
                    margin: 0 !important;
                    padding: 4mm !important;
                    box-sizing: border-box !important;
                    background: white !important;
                    border: 2px solid black !important;
                    font-family: Arial, sans-serif !important;
                    font-size: 11pt !important;
                    color: black !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* Ensure all child elements are visible */
                #printable-pass * {
                    display: revert !important;
                    visibility: visible !important;
                    color: black !important;
                    background: transparent !important;
                }

                /* Pass structure styles */
                #printable-pass .pass-header {
                    display: block !important;
                    text-align: center !important;
                    padding-bottom: 3mm !important;
                    margin-bottom: 3mm !important;
                    border-bottom: 2px solid black !important;
                }

                #printable-pass .pass-school-name {
                    font-size: 14pt !important;
                    font-weight: bold !important;
                    margin-bottom: 2mm !important;
                }

                #printable-pass .pass-title {
                    font-size: 12pt !important;
                    font-weight: bold !important;
                }

                #printable-pass .pass-body {
                    display: block !important;
                    margin: 4mm 0 !important;
                }

                #printable-pass .pass-field {
                    display: block !important;
                    margin-bottom: 3mm !important;
                    font-size: 11pt !important;
                }

                #printable-pass .pass-field strong {
                    font-weight: bold !important;
                    display: inline-block !important;
                    min-width: 20mm !important;
                }

                #printable-pass .pass-footer {
                    display: flex !important;
                    justify-content: space-between !important;
                    padding-top: 3mm !important;
                    margin-top: 3mm !important;
                    border-top: 1px solid black !important;
                    font-size: 10pt !important;
                }

                #printable-pass .pass-footer-item {
                    display: block !important;
                }

                #printable-pass .pass-footer-item strong {
                    font-weight: bold !important;
                }
            }
        `;

        // Add to head
        document.head.appendChild(style);
    }
}

// Create global instance
window.BrotherLabelPrinter = new BrotherLabelPrinter();

// Note: The print button is handled by app.js which calls this module
// We don't override the button here to avoid double printing