// Teletext character set mapping (partial - covers standard ASCII)
const TELETEXT_CHARSET = {
    0x20: 0x20, // Space
    0x21: 0x21, // !
    0x22: 0x22, // "
    0x23: 0x23, // #
    0x24: 0x24, // $
    0x25: 0x25, // %
    0x26: 0x26, // &
    0x27: 0x27, // '
    0x28: 0x28, // (
    0x29: 0x29, // )
    0x2A: 0x2A, // *
    0x2B: 0x2B, // +
    0x2C: 0x2C, // ,
    0x2D: 0x2D, // -
    0x2E: 0x2E, // .
    0x2F: 0x2F, // /
    0x30: 0x30, // 0
    0x31: 0x31, // 1
    0x32: 0x32, // 2
    0x33: 0x33, // 3
    0x34: 0x34, // 4
    0x35: 0x35, // 5
    0x36: 0x36, // 6
    0x37: 0x37, // 7
    0x38: 0x38, // 8
    0x39: 0x39, // 9
    0x3A: 0x3A, // :
    0x3B: 0x3B, // ;
    0x3C: 0x3C, // <
    0x3D: 0x3D, // =
    0x3E: 0x3E, // >
    0x3F: 0x3F, // ?
    0x40: 0x40, // @
    0x41: 0x41, // A
    0x42: 0x42, // B
    0x43: 0x43, // C
    0x44: 0x44, // D
    0x45: 0x45, // E
    0x46: 0x46, // F
    0x47: 0x47, // G
    0x48: 0x48, // H
    0x49: 0x49, // I
    0x4A: 0x4A, // J
    0x4B: 0x4B, // K
    0x4C: 0x4C, // L
    0x4D: 0x4D, // M
    0x4E: 0x4E, // N
    0x4F: 0x4F, // O
    0x50: 0x50, // P
    0x51: 0x51, // Q
    0x52: 0x52, // R
    0x53: 0x53, // S
    0x54: 0x54, // T
    0x55: 0x55, // U
    0x56: 0x56, // V
    0x57: 0x57, // W
    0x58: 0x58, // X
    0x59: 0x59, // Y
    0x5A: 0x5A, // Z
    0x5B: 0x5B, // [
    0x5C: 0x5C, // \
    0x5D: 0x5D, // ]
    0x5E: 0x5E, // ^
    0x5F: 0x5F, // _
    0x60: 0x60, // `
    0x61: 0x61, // a
    0x62: 0x62, // b
    0x63: 0x63, // c
    0x64: 0x64, // d
    0x65: 0x65, // e
    0x66: 0x66, // f
    0x67: 0x67, // g
    0x68: 0x68, // h
    0x69: 0x69, // i
    0x6A: 0x6A, // j
    0x6B: 0x6B, // k
    0x6C: 0x6C, // l
    0x6D: 0x6D, // m
    0x6E: 0x6E, // n
    0x6F: 0x6F, // o
    0x70: 0x70, // p
    0x71: 0x71, // q
    0x72: 0x72, // r
    0x73: 0x73, // s
    0x74: 0x74, // t
    0x75: 0x75, // u
    0x76: 0x76, // v
    0x77: 0x77, // w
    0x78: 0x78, // x
    0x79: 0x79, // y
    0x7A: 0x7A, // z
    0x7B: 0x7B, // {
    0x7C: 0x7C, // |
    0x7D: 0x7D, // }
    0x7E: 0x7E, // ~
};

// Add odd parity to a byte
function addOddParity(byte) {
    let parity = 0;
    let temp = byte;
    
    for (let i = 0; i < 7; i++) {
        parity ^= (temp & 1);
        temp >>= 1;
    }
    
    // If even number of 1s, set bit 7 to make it odd
    if (parity === 0) {
        byte |= 0x80;
    } else {
        byte &= 0x7F;
    }
    
    return byte;
}

// Calculate MRAG (Magazine and Row Address Group)
function calculateMRAG(magazine, row) {
    // Magazine 8 is encoded as 0
    let mag = magazine === 8 ? 0 : magazine;
    
    // Row encoding for header (row 0) and other rows
    let packetNumber = row;
    
    // Combine magazine and row: row in bits 3-7, magazine in bits 0-2
    let combined = (packetNumber << 3) | mag;
    
    // Return as two bytes with Hamming 8/4 encoding
    return [
        hamming84Encode(combined & 0x0F),         // Low nibble
        hamming84Encode((combined >> 4) & 0x0F)   // High nibble
    ];
}

// Hamming 8/4 encoding table
const HAMMING_8_4 = [
    0x15, 0x02, 0x49, 0x5E, 0x64, 0x73, 0x38, 0x2F,
    0xD0, 0xC7, 0x8C, 0x9B, 0xA1, 0xB6, 0xFD, 0xEA
];

function hamming84Encode(nibble) {
    return HAMMING_8_4[nibble & 0x0F];
}

// Convert text to teletext bytes
function textToTeletextBytes(text) {
    const bytes = [];
    for (let i = 0; i < 40; i++) {
        if (i < text.length) {
            const charCode = text.charCodeAt(i);
            const teletextChar = TELETEXT_CHARSET[charCode] || 0x20; // Default to space
            bytes.push(addOddParity(teletextChar));
        } else {
            bytes.push(addOddParity(0x20)); // Fill with spaces
        }
    }
    return bytes;
}

// Generate complete VBI line data
function generateVBIData(magazine, row, text) {
    const data = [];
    
    // Clock run-in: 0x55, 0x55
    data.push(0x55, 0x55);
    
    // Framing code: 0x27
    data.push(0x27);
    
    // MRAG bytes
    const mrag = calculateMRAG(magazine, row);
    data.push(...mrag);
    
    // Text bytes (40 characters)
    const textBytes = textToTeletextBytes(text);
    data.push(...textBytes);
    
    return data;
}

// Draw waveform on canvas
function drawWaveform(canvas, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw waveform
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const bitsPerByte = 8; // 8 data bits (no start/stop bits for VBI)
    const totalBits = data.length * bitsPerByte;
    const bitWidth = width / totalBits;
    
    let x = 0;
    
    for (let byteIndex = 0; byteIndex < data.length; byteIndex++) {
        const byte = data[byteIndex];
        
        // Data bits (LSB first)
        for (let bit = 0; bit < 8; bit++) {
            const bitValue = (byte >> bit) & 1;
            const y = bitValue ? height * 0.2 : height * 0.8;
            ctx.lineTo(x, y);
            ctx.lineTo(x + bitWidth, y);
            x += bitWidth;
        }
    }
    
    ctx.stroke();
    
    // Draw byte separators and labels
    ctx.strokeStyle = '#666';
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    
    x = 0;
    for (let i = 0; i < data.length; i++) {
        if (i < 5) { // Only label first 5 bytes
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            
            const label = `0x${data[i].toString(16).toUpperCase().padStart(2, '0')}`;
            ctx.fillText(label, x + 2, 12);
        }
        x += bitWidth * 8; // 8 bits per byte
    }
}

// Update byte display
function updateByteDisplay(data) {
    const display = document.getElementById('byteDisplay');
    const firstBytes = data.slice(0, 5).map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`).join(' ');
    const remainingCount = data.length - 5;
    
    display.innerHTML = `
        <div class="byte-info">
            <strong>First 5 bytes:</strong> ${firstBytes}
            <br>
            <strong>Remaining:</strong> ${remainingCount} character bytes (with odd parity)
        </div>
    `;
}

// Update waveform based on inputs
function updateWaveform() {
    const magazine = parseInt(document.getElementById('magazine').value);
    const row = parseInt(document.getElementById('row').value);
    const text = document.getElementById('text').value;
    
    const canvas = document.getElementById('waveform');
    const data = generateVBIData(magazine, row, text);
    
    drawWaveform(canvas, data);
    updateByteDisplay(data);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    document.getElementById('magazine').addEventListener('input', updateWaveform);
    document.getElementById('row').addEventListener('input', updateWaveform);
    document.getElementById('text').addEventListener('input', updateWaveform);
    
    // Initial render
    updateWaveform();
});