// PDF Generator for Hall Passes
// Uses jsPDF to create printable PDFs

class PDFLabelGenerator {
    constructor() {
        this.jsPDF = window.jspdf?.jsPDF;
        if (!this.jsPDF) {
            console.error('jsPDF library not loaded!');
        }
    }

    generatePassPDF(passData, autoprint = false) {
        if (!this.jsPDF) {
            alert('PDF library not loaded. Please refresh the page.');
            return;
        }

        // Create PDF with standard dimensions
        const doc = new this.jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: [3, 4] // Standard pass size
        });

        // Set up fonts and colors
        doc.setTextColor(0, 0, 0);

        // Draw border
        doc.setLineWidth(0.02);
        doc.rect(0.1, 0.1, 2.8, 3.8);

        // Header section
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        const schoolName = passData.schoolName || 'WYOMING PUBLIC SCHOOLS';
        doc.text(schoolName, 1.5, 0.5, { align: 'center' });

        doc.setFontSize(18);
        doc.text('HALL PASS', 1.5, 0.8, { align: 'center' });

        // Header line
        doc.setLineWidth(0.02);
        doc.line(0.2, 1.0, 2.8, 1.0);

        // Pass content
        doc.setFontSize(11);
        let yPos = 1.3;

        // Name field
        doc.setFont(undefined, 'bold');
        doc.text('NAME:', 0.3, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(passData.name || '', 0.9, yPos);
        yPos += 0.4;

        // Location field
        doc.setFont(undefined, 'bold');
        doc.text('LOCATION:', 0.3, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(passData.location || '', 1.2, yPos);
        yPos += 0.4;

        // Time Out field
        doc.setFont(undefined, 'bold');
        doc.text('TIME OUT:', 0.3, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(passData.timeOut || '', 1.2, yPos);
        yPos += 0.4;

        // Date field
        doc.setFont(undefined, 'bold');
        doc.text('DATE:', 0.3, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(passData.date || '', 0.8, yPos);

        // Footer line
        doc.setLineWidth(0.01);
        doc.line(0.2, 3.3, 2.8, 3.3);

        // Teacher info at bottom
        doc.setFontSize(9);
        doc.text(passData.teacherEmail || '', 1.5, 3.5, { align: 'center' });

        // Timestamp
        doc.setFontSize(7);
        const timestamp = new Date().toLocaleString();
        doc.text('Generated: ' + timestamp, 1.5, 3.7, { align: 'center' });

        // Output options
        if (autoprint) {
            // Auto-print in new window
            doc.autoPrint();
            doc.output('dataurlnewwindow');
        } else {
            // Download as file
            const filename = `hallpass_${passData.name}_${Date.now()}.pdf`;
            doc.save(filename);
        }

        return doc;
    }

    // Extract pass data from the DOM
    getPassDataFromDOM() {
        const passElement = document.getElementById('printable-pass');
        if (!passElement) return null;

        const data = {
            schoolName: passElement.querySelector('.pass-school-name')?.textContent || '',
            name: '',
            location: '',
            timeOut: '',
            date: '',
            teacherEmail: localStorage.getItem('teacherEmail') || ''
        };

        // Parse fields
        const fields = passElement.querySelectorAll('.pass-field');
        fields.forEach(field => {
            const text = field.textContent;
            if (text.includes('NAME:')) {
                data.name = text.replace('NAME:', '').trim();
            } else if (text.includes('LOCATION:')) {
                data.location = text.replace('LOCATION:', '').trim();
            }
        });

        // Parse footer
        const footerItems = passElement.querySelectorAll('.pass-footer-item');
        footerItems.forEach(item => {
            const text = item.textContent;
            if (text.includes('TIME OUT:')) {
                data.timeOut = text.replace('TIME OUT:', '').trim();
            } else if (text.includes('DATE:')) {
                data.date = text.replace('DATE:', '').trim();
            }
        });

        return data;
    }

    // Add PDF buttons to the UI
    addPDFButtons() {
        const printBtn = document.getElementById('print-pass');
        if (!printBtn) return;

        // Create PDF download button
        const pdfBtn = document.createElement('button');
        pdfBtn.textContent = '📄 Save as PDF';
        pdfBtn.className = 'print-btn';
        pdfBtn.style.marginLeft = '10px';
        pdfBtn.style.background = '#17a2b8';
        pdfBtn.onclick = (e) => {
            e.preventDefault();
            const passData = this.getPassDataFromDOM();
            if (passData) {
                this.generatePassPDF(passData, false);
            }
        };

        // Create PDF print button
        const pdfPrintBtn = document.createElement('button');
        pdfPrintBtn.textContent = '🖨️ PDF Print';
        pdfPrintBtn.className = 'print-btn';
        pdfPrintBtn.style.marginLeft = '10px';
        pdfPrintBtn.style.background = '#6f42c1';
        pdfPrintBtn.onclick = (e) => {
            e.preventDefault();
            const passData = this.getPassDataFromDOM();
            if (passData) {
                this.generatePassPDF(passData, true);
            }
        };

        // Add buttons
        printBtn.parentNode.insertBefore(pdfBtn, printBtn.nextSibling);
        pdfBtn.parentNode.insertBefore(pdfPrintBtn, pdfBtn.nextSibling);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.PDFGenerator = new PDFLabelGenerator();
    window.PDFGenerator.addPDFButtons();
});