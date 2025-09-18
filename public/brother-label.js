// Brother QL-820NWB Label Generator Module
// Generates .lbx format files for Brother label printers

class BrotherLabelGenerator {
    constructor() {
        // Brother QL-820NWB printer configuration
        this.printerConfig = {
            printerID: "16692",
            printerName: "Brother QL-820NWB",
            // 62mm x 100mm label (common Brother DK label size)
            labelWidth: "175.7pt",
            labelHeight: "283.2pt",
            marginLeft: "4.3pt",
            marginTop: "8.4pt",
            marginRight: "4.4pt",
            marginBottom: "8.4pt",
            orientation: "landscape",
            format: "259", // Brother format code for 62mm continuous tape
            printColorsID: "129"
        };
    }

    // Generate label XML with pass data
    generateLabelXML(passData) {
        const { name, location, timeOut, timeIn, date, teacherEmail } = passData;

        // Convert pass data to QR code content
        const qrContent = JSON.stringify({
            name,
            location,
            timeOut,
            timeIn: timeIn || '',
            date,
            teacher: teacherEmail
        });

        return `<?xml version="1.0" encoding="UTF-8"?>
<pt:document xmlns:pt="http://schemas.brother.info/ptouch/2007/lbx/main"
    xmlns:style="http://schemas.brother.info/ptouch/2007/lbx/style"
    xmlns:text="http://schemas.brother.info/ptouch/2007/lbx/text"
    xmlns:barcode="http://schemas.brother.info/ptouch/2007/lbx/barcode"
    version="1.7" generator="HallPass App">
    <pt:body currentSheet="Sheet 1" direction="LTR">
        <style:sheet name="Sheet 1">
            <style:paper
                media="0"
                width="${this.printerConfig.labelWidth}"
                height="${this.printerConfig.labelHeight}"
                marginLeft="${this.printerConfig.marginLeft}"
                marginTop="${this.printerConfig.marginTop}"
                marginRight="${this.printerConfig.marginRight}"
                marginBottom="${this.printerConfig.marginBottom}"
                orientation="${this.printerConfig.orientation}"
                autoLength="false"
                monochromeDisplay="true"
                printColorDisplay="true"
                printColorsID="${this.printerConfig.printColorsID}"
                paperColor="#FFFFFF"
                paperInk="#000000"
                split="1"
                format="${this.printerConfig.format}"
                backgroundTheme="0"
                printerID="${this.printerConfig.printerID}"
                printerName="${this.printerConfig.printerName}">
            </style:paper>
            <style:cutLine regularCut="0pt" freeCut=""></style:cutLine>
            <style:backGround x="8.4pt" y="4.3pt" width="266.4pt" height="167.1pt"
                brushStyle="NULL" brushId="0" userPattern="NONE" userPatternId="0"
                color="#000000" printColorNumber="1" backColor="#FFFFFF" backPrintColorNumber="0">
            </style:backGround>
            <pt:objects>
                <!-- Main Title -->
                <text:text>
                    <pt:objectStyle x="10pt" y="10pt" width="250pt" height="30pt"
                        backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN"
                        angle="0" anchor="TOPLEFT" flip="NONE">
                        <pt:pen style="NULL" widthX="0.5pt" widthY="0.5pt" color="#666666" printColorNumber="1"></pt:pen>
                        <pt:brush style="NULL" color="#FFFFFF" printColorNumber="1" id="0"></pt:brush>
                    </pt:objectStyle>
                    <text:ptFontInfo>
                        <text:logFont name="Arial" width="0" italic="false" weight="700" charSet="0" pitchAndFamily="2"></text:logFont>
                        <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="20pt" orgSize="20pt" textColor="#000000" textPrintColorNumber="2"></text:fontExt>
                    </text:ptFontInfo>
                    <text:textControl control="LONGTEXTFIXED" clipFrame="false" aspectNormal="true" shrink="true" autoLF="false" avoidImage="false"></text:textControl>
                    <text:textAlign horizontalAlignment="CENTER" verticalAlignment="CENTER" inLineAlignment="BASELINE"></text:textAlign>
                    <text:textStyle vertical="false" nullBlock="false" charSpace="0" lineSpace="0" orgPoint="19pt" combinedChars="false"></text:textStyle>
                    <pt:data>HALL PASS</pt:data>
                </text:text>

                <!-- Student Name -->
                <text:text>
                    <pt:objectStyle x="10pt" y="45pt" width="150pt" height="25pt"
                        backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN"
                        angle="0" anchor="TOPLEFT" flip="NONE">
                        <pt:pen style="NULL" widthX="0.5pt" widthY="0.5pt" color="#666666" printColorNumber="1"></pt:pen>
                        <pt:brush style="NULL" color="#FFFFFF" printColorNumber="1" id="0"></pt:brush>
                    </pt:objectStyle>
                    <text:ptFontInfo>
                        <text:logFont name="Arial" width="0" italic="false" weight="400" charSet="0" pitchAndFamily="2"></text:logFont>
                        <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="14pt" orgSize="14pt" textColor="#000000" textPrintColorNumber="2"></text:fontExt>
                    </text:ptFontInfo>
                    <text:textControl control="LONGTEXTFIXED" clipFrame="false" aspectNormal="true" shrink="true" autoLF="false" avoidImage="false"></text:textControl>
                    <text:textAlign horizontalAlignment="LEFT" verticalAlignment="CENTER" inLineAlignment="BASELINE"></text:textAlign>
                    <text:textStyle vertical="false" nullBlock="false" charSpace="0" lineSpace="0" orgPoint="14pt" combinedChars="false"></text:textStyle>
                    <pt:data>Name: ${this.escapeXML(name)}</pt:data>
                </text:text>

                <!-- Location -->
                <text:text>
                    <pt:objectStyle x="10pt" y="75pt" width="150pt" height="25pt"
                        backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN"
                        angle="0" anchor="TOPLEFT" flip="NONE">
                        <pt:pen style="NULL" widthX="0.5pt" widthY="0.5pt" color="#666666" printColorNumber="1"></pt:pen>
                        <pt:brush style="NULL" color="#FFFFFF" printColorNumber="1" id="0"></pt:brush>
                    </pt:objectStyle>
                    <text:ptFontInfo>
                        <text:logFont name="Arial" width="0" italic="false" weight="400" charSet="0" pitchAndFamily="2"></text:logFont>
                        <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="14pt" orgSize="14pt" textColor="#000000" textPrintColorNumber="2"></text:fontExt>
                    </text:ptFontInfo>
                    <text:textControl control="LONGTEXTFIXED" clipFrame="false" aspectNormal="true" shrink="true" autoLF="false" avoidImage="false"></text:textControl>
                    <text:textAlign horizontalAlignment="LEFT" verticalAlignment="CENTER" inLineAlignment="BASELINE"></text:textAlign>
                    <text:textStyle vertical="false" nullBlock="false" charSpace="0" lineSpace="0" orgPoint="14pt" combinedChars="false"></text:textStyle>
                    <pt:data>Location: ${this.escapeXML(location)}</pt:data>
                </text:text>

                <!-- Time Out -->
                <text:text>
                    <pt:objectStyle x="10pt" y="105pt" width="150pt" height="25pt"
                        backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN"
                        angle="0" anchor="TOPLEFT" flip="NONE">
                        <pt:pen style="NULL" widthX="0.5pt" widthY="0.5pt" color="#666666" printColorNumber="1"></pt:pen>
                        <pt:brush style="NULL" color="#FFFFFF" printColorNumber="1" id="0"></pt:brush>
                    </pt:objectStyle>
                    <text:ptFontInfo>
                        <text:logFont name="Arial" width="0" italic="false" weight="400" charSet="0" pitchAndFamily="2"></text:logFont>
                        <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="14pt" orgSize="14pt" textColor="#000000" textPrintColorNumber="2"></text:fontExt>
                    </text:ptFontInfo>
                    <text:textControl control="LONGTEXTFIXED" clipFrame="false" aspectNormal="true" shrink="true" autoLF="false" avoidImage="false"></text:textControl>
                    <text:textAlign horizontalAlignment="LEFT" verticalAlignment="CENTER" inLineAlignment="BASELINE"></text:textAlign>
                    <text:textStyle vertical="false" nullBlock="false" charSpace="0" lineSpace="0" orgPoint="14pt" combinedChars="false"></text:textStyle>
                    <pt:data>Time Out: ${timeOut}</pt:data>
                </text:text>

                <!-- Date -->
                <text:text>
                    <pt:objectStyle x="10pt" y="135pt" width="150pt" height="25pt"
                        backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN"
                        angle="0" anchor="TOPLEFT" flip="NONE">
                        <pt:pen style="NULL" widthX="0.5pt" widthY="0.5pt" color="#666666" printColorNumber="1"></pt:pen>
                        <pt:brush style="NULL" color="#FFFFFF" printColorNumber="1" id="0"></pt:brush>
                    </pt:objectStyle>
                    <text:ptFontInfo>
                        <text:logFont name="Arial" width="0" italic="false" weight="400" charSet="0" pitchAndFamily="2"></text:logFont>
                        <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="14pt" orgSize="14pt" textColor="#000000" textPrintColorNumber="2"></text:fontExt>
                    </text:ptFontInfo>
                    <text:textControl control="LONGTEXTFIXED" clipFrame="false" aspectNormal="true" shrink="true" autoLF="false" avoidImage="false"></text:textControl>
                    <text:textAlign horizontalAlignment="LEFT" verticalAlignment="CENTER" inLineAlignment="BASELINE"></text:textAlign>
                    <text:textStyle vertical="false" nullBlock="false" charSpace="0" lineSpace="0" orgPoint="14pt" combinedChars="false"></text:textStyle>
                    <pt:data>Date: ${date}</pt:data>
                </text:text>

                <!-- QR Code -->
                <barcode:barcode>
                    <pt:objectStyle x="170pt" y="50pt" width="80pt" height="80pt"
                        backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN"
                        angle="0" anchor="TOPLEFT" flip="NONE">
                        <pt:pen style="INSIDEFRAME" widthX="0.5pt" widthY="0.5pt" color="#666666" printColorNumber="1"></pt:pen>
                        <pt:brush style="NULL" color="#FFFFFF" printColorNumber="1" id="0"></pt:brush>
                    </pt:objectStyle>
                    <barcode:barcodeStyle protocol="QRCODE" lengths="12" zeroFill="false"
                        barWidth="1.2pt" barRatio="1:3" humanReadable="false"
                        humanReadableAlignment="LEFT" checkDigit="true" autoLengths="false"
                        margin="true" sameLengthBar="false" bearerBar="false">
                    </barcode:barcodeStyle>
                    <barcode:qrcodeStyle model="2" eccLevel="15%" cellSize="2.4pt" mbcs="65001" joint="1" version="auto"></barcode:qrcodeStyle>
                    <pt:data>${this.escapeXML(qrContent)}</pt:data>
                </barcode:barcode>
            </pt:objects>
        </style:sheet>
    </pt:body>
</pt:document>`;
    }

    // Generate prop.xml metadata
    generatePropXML() {
        const now = new Date().toISOString();
        return `<?xml version="1.0" encoding="UTF-8"?>
<meta:properties xmlns:meta="http://schemas.brother.info/ptouch/2007/lbx/meta"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:dcterms="http://purl.org/dc/terms/">
    <meta:appName>HallPass App</meta:appName>
    <dc:title>Hall Pass Label</dc:title>
    <dc:subject>Student Hall Pass</dc:subject>
    <dc:creator>HallPass System</dc:creator>
    <meta:keyword>hallpass,student,label</meta:keyword>
    <dc:description>Hall pass label for student tracking</dc:description>
    <meta:template></meta:template>
    <dcterms:created>${now}</dcterms:created>
    <dcterms:modified>${now}</dcterms:modified>
    <meta:lastPrinted>${now}</meta:lastPrinted>
    <meta:modifiedBy>HallPass App</meta:modifiedBy>
    <meta:revision>1</meta:revision>
    <meta:editTime>0</meta:editTime>
    <meta:numPages>1</meta:numPages>
    <meta:numWords>0</meta:numWords>
    <meta:numChars>0</meta:numChars>
    <meta:security>0</meta:security>
</meta:properties>`;
    }

    // Escape special XML characters
    escapeXML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    // Generate canvas for pass visual (to be converted to BMP if needed)
    async generatePassCanvas(passData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size (Brother label aspect ratio)
        canvas.width = 696;
        canvas.height = 271;

        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw pass content
        ctx.fillStyle = 'black';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HALL PASS', canvas.width / 2, 50);

        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Name: ${passData.name}`, 30, 110);
        ctx.fillText(`Location: ${passData.location}`, 30, 150);
        ctx.fillText(`Time Out: ${passData.timeOut}`, 30, 190);
        ctx.fillText(`Date: ${passData.date}`, 30, 230);

        return canvas;
    }

    // Create .lbx file as a blob
    async createLBXFile(passData) {
        // We need JSZip to create the .lbx file
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip library is required for creating .lbx files');
        }

        const zip = new JSZip();

        // Add XML files
        zip.file('label.xml', this.generateLabelXML(passData));
        zip.file('prop.xml', this.generatePropXML());

        // Generate and add image files (if needed for visual preview)
        // For now, we'll skip the BMP files as they're optional
        // The printer mainly needs the XML configuration

        // Generate the zip as a blob
        const blob = await zip.generateAsync({type: 'blob'});

        return blob;
    }

    // Download .lbx file
    async downloadLBXFile(passData) {
        try {
            const blob = await this.createLBXFile(passData);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hallpass_${passData.name}_${Date.now()}.lbx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error creating .lbx file:', error);
            return false;
        }
    }

    // Alternative: Send to Brother b-PAC SDK if available
    async printDirectToBrother(passData) {
        // This would require Brother's b-PAC SDK JavaScript library
        // which provides direct printing capabilities

        if (typeof bpac === 'undefined') {
            console.warn('Brother b-PAC SDK not available');
            return false;
        }

        try {
            const doc = bpac.Document();
            const ret = doc.Open('hallpass_template.lbx');

            if (ret) {
                // Set object values
                doc.GetObject('name').Text = passData.name;
                doc.GetObject('location').Text = passData.location;
                doc.GetObject('timeOut').Text = passData.timeOut;
                doc.GetObject('date').Text = passData.date;

                // Print
                doc.StartPrint('', 0);
                doc.PrintOut(1, 0);
                doc.EndPrint();
                doc.Close();

                return true;
            }
        } catch (error) {
            console.error('Brother b-PAC printing error:', error);
            return false;
        }

        return false;
    }
}

// Export for use in main app
window.BrotherLabelGenerator = BrotherLabelGenerator;