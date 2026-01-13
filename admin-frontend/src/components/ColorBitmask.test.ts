import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ColorBitmask from './ColorBitmask.svelte';

describe('ColorBitmask.svelte', () => {
  it('renders "No Signature" when sig is empty', () => {
    render(ColorBitmask, { sig: '' });
    expect(screen.getByText('No Signature')).toBeTruthy();
  });

  it('renders bits when sig is provided', () => {
    // 8 bytes of 0x00
    const sig = btoa(String.fromCharCode(...new Array(8).fill(0)));
    const { container } = render(ColorBitmask, { sig });
    
    const bits = container.querySelectorAll('.bit');
    expect(bits.length).toBe(64);
    
    // All bits should not have 'active' class
    bits.forEach(bit => {
      expect(bit.classList.contains('active')).toBe(false);
    });
  });

  it('sets active class for bits that are set in sig', () => {
    // Set bit 0 (LSB)
    // In the implementation:
    // bytes[7] LSB is bit 0? 
    // Wait, the code says:
    // for (let i = 0; i < 8; i++) {
    //   const byte = bytes[i];
    //   for (let j = 7; j >= 0; j--) {
    //     result.push(((byte >> j) & 1) === 1);
    //   }
    // }
    // return result.reverse();
    // This means:
    // result[0] = (bytes[0] >> 7) & 1  (MSB of first byte)
    // ...
    // result[63] = (bytes[7] >> 0) & 1 (LSB of last byte)
    // After reverse():
    // result[0] = (bytes[7] >> 0) & 1 (LSB of last byte) -> Bit 0
    // result[63] = (bytes[0] >> 7) & 1 (MSB of first byte) -> Bit 63
    
    const bytes = new Uint8Array(8);
    bytes[7] = 0x01; // Bit 0 is set
    const sig = btoa(String.fromCharCode(...bytes));
    
    const { container } = render(ColorBitmask, { sig });
    
    // We need to find which DOM element corresponds to bit 0
    // getBitIndex(l, h, c) returns the index
    // For bit 0: (h2 << 5) | (l1 << 4) | (h1 << 3) | (l0 << 2) | (h0 << 1) | c0 = 0
    // This means h2=0, l1=0, h1=0, l0=0, h0=0, c0=0
    // So h=0, l=0, c=0
    
    // In the template:
    // {#each [1, 0] as c}
    //   {#each [3, 2, 1, 0] as l}
    //     {#each [0, 1, 2, 3, 4, 5, 6, 7] as h}
    //       index = getBitIndex(l, h, c)
    
    // The bit with title "L=0 H=0 C=0" should be active
    const activeBit = container.querySelector('.bit[title="L=0 H=0 C=0"]');
    expect(activeBit?.classList.contains('active')).toBe(true);
    
    const otherBit = container.querySelector('.bit[title="L=0 H=45 C=0"]');
    expect(otherBit?.classList.contains('active')).toBe(false);
  });

  it('applies correct OKLCH colors', () => {
    const sig = btoa(String.fromCharCode(...new Array(8).fill(0)));
    const { container } = render(ColorBitmask, { sig });
    
    // Test L=0, H=0, C=0
    // getOKLCH(0) -> l_idx=0, h_idx=0, c_idx=0
    // L=25, C=0.01, H=0
    // oklch(25% 0.01 0)
    const bit0 = container.querySelector('.bit[title="L=0 H=0 C=0"]') as HTMLElement;
    expect(bit0.style.backgroundColor).toContain('oklch(0.25 0.01 0)');

    // Test L=3, H=315 (h=7), C=1
    // index = getBitIndex(3, 7, 1)
    // l=3 (l1=1, l0=1), h=7 (h2=1, h1=1, h0=1), c=1 (c0=1)
    // index = (1<<5) | (1<<4) | (1<<3) | (1<<2) | (1<<1) | 1 = 32+16+8+4+2+1 = 63
    // getOKLCH(63) -> l_idx=3, h_idx=7, c_idx=1
    // L=85, C=0.15, H=315
    // oklch(85% 0.15 315)
    const bit63 = container.querySelector('.bit[title="L=3 H=315 C=1"]') as HTMLElement;
    expect(bit63.style.backgroundColor).toContain('oklch(0.85 0.15 315)');
  });
});