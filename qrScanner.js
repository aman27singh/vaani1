// qrScanner.js
// This module uses html5-qrcode to scan QR codes using the camera

// Load html5-qrcode library dynamically if not present
function loadHtml5QrcodeScript(callback) {
    if (document.getElementById('html5-qrcode-script')) {
        callback();
        return;
    }
    const script = document.createElement('script');
    script.id = 'html5-qrcode-script';
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js';
    script.onload = callback;
    document.body.appendChild(script);
}

// Show QR scanner UI and start scanning
function startQrScanner(onScanSuccess, onScanError) {
    loadHtml5QrcodeScript(() => {
        const scannerDivId = 'qr-scanner';
        let scannerDiv = document.getElementById(scannerDivId);
        if (!scannerDiv) {
            scannerDiv = document.createElement('div');
            scannerDiv.id = scannerDivId;
            scannerDiv.style.position = 'fixed';
            scannerDiv.style.top = '0';
            scannerDiv.style.left = '0';
            scannerDiv.style.width = '100vw';
            scannerDiv.style.height = '100vh';
            scannerDiv.style.background = 'rgba(0,0,0,0.8)';
            scannerDiv.style.zIndex = '9999';
            document.body.appendChild(scannerDiv);
        }
        scannerDiv.innerHTML = '<div id="qr-reader" style="width:300px;margin:100px auto;"></div><button id="close-qr" style="display:block;margin:20px auto;">Close</button>';
        document.getElementById('close-qr').onclick = () => {
            html5QrcodeScanner.clear();
            scannerDiv.remove();
        };
        const html5QrcodeScanner = new Html5Qrcode('qr-reader');
        html5QrcodeScanner.start(
            { facingMode: 'environment' },
            {
                fps: 10,
                qrbox: 250
            },
            (decodedText, decodedResult) => {
                onScanSuccess(decodedText);
                html5QrcodeScanner.clear();
                scannerDiv.remove();
            },
            (errorMessage) => {
                if (onScanError) onScanError(errorMessage);
            }
        );
    });
}

// Export for usage in other scripts
window.startQrScanner = startQrScanner;
