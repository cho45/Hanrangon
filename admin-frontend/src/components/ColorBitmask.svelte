<script lang="ts">
  interface Props {
    sig: string; // Base64 encoded 8-byte signature
    size?: number;
  }

  let { sig, size = 64 }: Props = $props();

  // Decode base64 to 64 bits
  let bits = $derived.by(() => {
    if (!sig) return new Array(64).fill(false);
    try {
      const binary = atob(sig);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const result = [];
      // BigEndian: bytes[0] is MSB (bits 63-56)
      for (let i = 0; i < 8; i++) {
        const byte = bytes[i];
        for (let j = 7; j >= 0; j--) {
          result.push(((byte >> j) & 1) === 1);
        }
      }
      return result.reverse(); // Now index 0 corresponds to LSB (bit 0)
    } catch (e) {
      console.error('Failed to decode sig:', e);
      return new Array(64).fill(false);
    }
  });

  // Calculate OKLCH CSS color for a given bit index (0-63)
  // Index: [ L(2bit) | H(3bit) | C(1bit) ]
  function getOKLCH(index: number) {
    const l_idx = (index >> 4) & 0x3;
    const h_idx = (index >> 1) & 0x7;
    const c_idx = index & 0x1;

    // Map quantized indices to OKLCH values
    // L: 20% to 90%, C: 0.01 or 0.15, H: 0 to 315
    const L = [25, 45, 65, 85][l_idx];
    const C = c_idx === 0 ? 0.01 : 0.15;
    const H = h_idx * 45;

    return `oklch(${L}% ${C} ${H})`;
  }
</script>

<div class="color-bitmask" style="--size: {size}px">
  {#if !sig}
    <div class="empty">No Signature</div>
  {:else}
    <div class="chroma-sections">
      {#each [1, 0] as c}
        <div class="chroma-section" title={c === 1 ? 'Vivid Colors' : 'Muted Colors'}>
          {#each [3, 2, 1, 0] as l}
            <div class="row">
              {#each [0, 1, 2, 3, 4, 5, 6, 7] as h}
                {@const index = (l << 4) | (h << 1) | c}
                <div 
                  class="bit" 
                  class:active={bits[index]}
                  style="background-color: {getOKLCH(index)}"
                  title="L={l} H={h*45} C={c}"
                ></div>
              {/each}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .color-bitmask {
    padding: 4px;
    background: #f0f0f0;
    border-radius: 4px;
    width: 140px;
    min-height: 34px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chroma-sections {
    display: flex;
    flex-direction: row;
    gap: 4px;
    width: 100%;
    justify-content: center;
  }

  .chroma-section {
    display: flex;
    flex-direction: column;
    gap: 1px;
    border: 1px solid #ddd;
    padding: 1px;
    background: #fff;
  }

  .row {
    display: flex;
    gap: 1px;
  }

  .bit {
    width: 6px;
    height: 6px;
    opacity: 0.1;
    border-radius: 1px;
  }

  .bit.active {
    opacity: 1;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  }

  .empty {
    font-size: 10px;
    color: #999;
    padding: 0 8px;
    font-style: italic;
  }
</style>
