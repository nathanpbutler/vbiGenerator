# Teletext VBI Waveform Generator

A web-based tool for generating and visualizing Teletext VBI (Vertical Blanking Interval) waveforms.

## Demo

<!-- Add GIF showcase here -->

## Features

- Generate proper teletext VBI data packets
- Real-time waveform visualization
- Support for magazines 1-8 and rows 0-24
- 40-character text input with automatic padding
- Hamming 8/4 error correction for address bytes
- Odd parity calculation for data bytes

## Usage

1. Open `index.html` in a web browser
2. Enter magazine number (1-8)
3. Enter row number (0-24) 
4. Type your teletext content (up to 40 characters)
5. View the generated waveform and byte data

## Technical Details

The generator implements the complete teletext protocol:

- Clock run-in pattern (0x55, 0x55)
- Framing code (0x27)
- MRAG (Magazine and Row Address Group) with Hamming encoding
- Character data with odd parity bits
- LSB-first bit transmission

## Files

- `index.html` - Main interface
- `main.js` - Teletext encoding and visualization logic  
- `main.css` - Styling

## Credits

### Font

This project uses the [Bedstead font](https://bjh21.me.uk/bedstead/) by Ben Harris, which provides an authentic teletext appearance.

### Development

- Project created with assistance from [Claude Code](https://claude.ai/code)
- Documentation and project setup assistance provided by Claude Code
