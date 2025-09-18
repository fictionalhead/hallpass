// Brother Label Print Workaround - Convert to Image
// This bypasses paper size issues by rendering as a bitmap

class BrotherImagePrint {
    constructor() {
        this.labelWidth = 696;  // 62mm at 288 DPI
        this.labelHeight = 1120; // 100mm at 288 DPI
    }

    // Convert the hall pass to a canvas image
    async passToCanvas(passElement) {
        // Create canvas with Brother label dimensions
        const canvas = document.createElement('canvas');
        canvas.width = this.labelWidth;
        canvas.height = this.labelHeight;
        const ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

        // Get pass data from DOM
        const passHeader = passElement.querySelector('.pass-header');
        const passFields = passElement.querySelectorAll('.pass-field');
        const passFooter = passElement.querySelector('.pass-footer');

        // Draw header
        ctx.fillStyle = 'black';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';

        if (passHeader) {
            const schoolName = passHeader.querySelector('.pass-school-name')?.textContent || '';
            const passTitle = passHeader.querySelector('.pass-title')?.textContent || '';

            ctx.fillText(schoolName, canvas.width / 2, 80);
            ctx.font = 'bold 36px Arial';
            ctx.fillText(passTitle, canvas.width / 2, 130);
        }

        // Draw line under header
        ctx.beginPath();
        ctx.moveTo(40, 160);
        ctx.lineTo(canvas.width - 40, 160);
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw fields
        ctx.font = '32px Arial';
        ctx.textAlign = 'left';
        let yPos = 240;

        passFields.forEach(field => {
            const text = field.textContent.trim();
            ctx.fillText(text, 60, yPos);
            yPos += 80;
        });

        // Draw footer line
        ctx.beginPath();
        ctx.moveTo(40, canvas.height - 300);
        ctx.lineTo(canvas.width - 40, canvas.height - 300);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw footer
        if (passFooter) {
            ctx.font = '28px Arial';
            const footerItems = passFooter.querySelectorAll('.pass-footer-item');
            let footerY = canvas.height - 200;

            footerItems.forEach(item => {
                const text = item.textContent.trim();
                ctx.fillText(text, 60, footerY);
                footerY += 60;
            });
        }

        return canvas;
    }

    // Print the canvas as an image
    async printAsImage(passElement) {
        try {
            // Convert pass to canvas
            const canvas = await this.passToCanvas(passElement);

            // Create a new window with just the image
            const printWindow = window.open('', '_blank');

            // Create HTML with the canvas as an image
            const dataUrl = canvas.toDataURL('image/png');

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Hall Pass Label</title>
                    <style>
                        @media print {
                            @page {
                                size: 62mm 100mm;
                                margin: 0;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            img {
                                width: 62mm;
                                height: 100mm;
                                max-width: 100%;
                                display: block;
                            }
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background: #f0f0f0;
                        }
                        img {
                            width: 62mm;
                            height: 100mm;
                            border: 1px solid #ccc;
                            background: white;
                        }
                        .print-btn {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            padding: 10px 20px;
                            font-size: 16px;
                            background: #007bff;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                        }
                        @media screen {
                            .info {
                                position: fixed;
                                bottom: 20px;
                                left: 20px;
                                background: white;
                                padding: 15px;
                                border-radius: 5px;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                font-family: Arial, sans-serif;
                            }
                        }
                        @media print {
                            .print-btn, .info {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" alt="Hall Pass">
                    <button class="print-btn" onclick="window.print()">Print Label</button>
                    <div class="info">
                        <strong>Brother QL-820NWB Settings:</strong><br>
                        Paper: DK-2205 (62mm continuous)<br>
                        Size: 62mm x 100mm<br>
                        Type: Continuous Length
                    </div>
                </body>
                </html>
            `);

            // Auto-focus the window
            printWindow.focus();

            // Auto-print after a short delay
            setTimeout(() => {
                printWindow.print();
            }, 500);

        } catch (error) {
            console.error('Error creating image for print:', error);
            alert('Error preparing label for print. Please try again.');
        }
    }
}

// Create global instance
window.BrotherImagePrint = new BrotherImagePrint();

// Add button to use image printing
document.addEventListener('DOMContentLoaded', () => {
    // Add alternative print button
    const printBtn = document.getElementById('print-pass');
    if (printBtn) {
        // Create image print button
        const imagePrintBtn = document.createElement('button');
        imagePrintBtn.textContent = 'Print as Image';
        imagePrintBtn.className = 'print-btn';
        imagePrintBtn.style.marginLeft = '10px';
        imagePrintBtn.style.background = '#28a745';

        imagePrintBtn.onclick = (e) => {
            e.preventDefault();
            const passElement = document.getElementById('printable-pass');
            if (passElement) {
                window.BrotherImagePrint.printAsImage(passElement);
            }
        };

        // Add after the regular print button
        printBtn.parentNode.insertBefore(imagePrintBtn, printBtn.nextSibling);
    }
});