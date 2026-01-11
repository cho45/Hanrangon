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

  // Calculate RGB for a given bit index (0-63)
  // Index: [R(2bit) | G(2bit) | B(2bit)]
  function getRGB(index: number) {
    const r = (index >> 4) & 0x3;
    const g = (index >> 2) & 0x3;
    const b = index & 0x3;
    // 2-bit (0-3) to 8-bit (0-255)
    return `rgb(${r * 85}, ${g * 85}, ${b * 85})`;
  }
</script>

<div class="color-bitmask" style="--size: {size}px">
  {#if !sig}
    <div class="empty">No Signature</div>
  {:else}
    {#each [3, 2, 1, 0] as r}
      <div class="slice" title="Red level {r}">
        {#each [3, 2, 1, 0] as g}
          <div class="row">
            {#each [0, 1, 2, 3] as b}
              {@const index = (r << 4) | (g << 2) | b}
              <div 
                class="bit" 
                class:active={bits[index]}
                style="background-color: {getRGB(index)}"
                title="R={r} G={g} B={b} (index={index})"
              ></div>
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  {/if}
</div>

<style>
  .color-bitmask {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #f0f0f0;
    border-radius: 4px;
    width: 140px;
    min-height: 34px;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .empty {
    font-size: 10px;
    color: #999;
    padding: 0 8px;
    font-style: italic;
  }

  .slice {
    display: flex;
    flex-direction: column;
    gap: 1px;
    border: 1px solid #ccc;
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
</style>
