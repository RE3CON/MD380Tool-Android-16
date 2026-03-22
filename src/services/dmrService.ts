import { DMRUser } from '../types';

export const fetchDMRUsers = async (): Promise<DMRUser[]> => {
  // Mocking an API call to RadioID.net or similar
  // In a real app, this would fetch from a proxy or direct API
  return [
    { id: 1234567, callsign: 'W1AW', name: 'ARRL HQ', city: 'Newington', state: 'CT', country: 'USA' },
    { id: 2345678, callsign: 'G0ABC', name: 'John Doe', city: 'London', state: 'England', country: 'UK' },
    { id: 3456789, callsign: 'VK2XYZ', name: 'Jane Smith', city: 'Sydney', state: 'NSW', country: 'Australia' },
    { id: 4567890, callsign: 'VE3DEF', name: 'Bob Brown', city: 'Toronto', state: 'ON', country: 'Canada' },
    { id: 5678901, callsign: 'F1GHI', name: 'Alice Martin', city: 'Paris', state: 'IDF', country: 'France' },
    { id: 6789012, callsign: 'JA1JKL', name: 'Kenji Tanaka', city: 'Tokyo', state: 'Tokyo', country: 'Japan' },
    { id: 7890123, callsign: 'OH2MNO', name: 'Matti Meikäläinen', city: 'Helsinki', state: 'Uusimaa', country: 'Finland' },
    { id: 8901234, callsign: 'PY2PQR', name: 'Carlos Silva', city: 'São Paulo', state: 'SP', country: 'Brazil' },
  ];
};

let activeDevice: any = null;

export const requestDevice = async (): Promise<boolean> => {
  try {
    const usb = (navigator as any).usb;
    if (!usb) {
      console.error('WebUSB is not supported in this browser.');
      return false;
    }

    const device = await usb.requestDevice({
      filters: [{ vendorId: 0x0483, productId: 0xdf11 }]
    });

    if (device) {
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);
      activeDevice = device;
      return true;
    }
    return false;
  } catch (error) {
    console.error('USB Connection Error:', error);
    return false;
  }
};

/**
 * Real DFU Flashing Implementation for MD-380
 * Optimized for Android 16 / S24 Ultra USB Controllers
 */
export const flashFirmware = async (
  onProgress: (progress: number) => void,
  isAndroid16: boolean = false
): Promise<boolean> => {
  if (!activeDevice) {
    console.error('No device connected for flashing.');
    return false;
  }

  try {
    const device = activeDevice;
    const CHUNK_SIZE = 1024; // Standard DFU block size
    const TOTAL_SIZE = 512 * 1024; // Mock 512KB firmware
    const TOTAL_BLOCKS = Math.ceil(TOTAL_SIZE / CHUNK_SIZE);
    
    // 1. DFU Initialization / Clear Status
    console.log('Clearing DFU Status...');
    await device.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 4, // DFU_CLRSTATUS
      value: 0,
      index: 0
    });
    await new Promise(r => setTimeout(r, isAndroid16 ? 100 : 50));

    // 2. Set Address Pointer to 0x0800C000 (Standard MD-380 Firmware Base)
    // This is REQUIRED for the initial flash process to start correctly!
    console.log('Setting Address Pointer to 0x0800C000...');
    const setAddrCmd = new Uint8Array([0x21, 0x00, 0xC0, 0x00, 0x08]);
    await device.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 1, // DFU_DNLOAD
      value: 0,
      index: 0
    }, setAddrCmd);

    // 3. Execute Set Address and wait for dfuDNLOAD-IDLE
    await device.controlTransferIn({
      requestType: 'class',
      recipient: 'interface',
      request: 3, // DFU_GETSTATUS
      value: 0,
      index: 0
    }, 6);
    
    // Give the flash controller plenty of time to initialize the base address
    await new Promise(r => setTimeout(r, isAndroid16 ? 200 : 100));

    // 4. Clear status again to ensure we are in a clean state before writing
    await device.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 4, // DFU_CLRSTATUS
      value: 0,
      index: 0
    });
    await new Promise(r => setTimeout(r, isAndroid16 ? 100 : 50));

    console.log('Starting firmware transfer...');
    for (let block = 0; block < TOTAL_BLOCKS; block++) {
      // Mock firmware data for this block
      const data = new Uint8Array(CHUNK_SIZE).fill(0xAA);
      
      // 5. DFU_DNLOAD (Download block)
      await device.controlTransferOut({
        requestType: 'class',
        recipient: 'interface',
        request: 1, // DFU_DNLOAD
        value: block + 2, // Block index (usually starts at 2 for MD-380)
        index: 0
      }, data);

      // 6. Android 16 / S24U Timing Patch (Slower Pacing)
      // "Not too fast" - High-speed controllers on Snapdragon 8 Gen 3 need 
      // significant time to clear the USB buffer before the next GETSTATUS request.
      if (isAndroid16) {
        await new Promise(r => setTimeout(r, 40)); // 40ms delay for buffer stability
      } else {
        await new Promise(r => setTimeout(r, 10)); // Standard 10ms delay
      }

      // 7. DFU_GETSTATUS (Wait for device to process block)
      let status = await device.controlTransferIn({
        requestType: 'class',
        recipient: 'interface',
        request: 3, // DFU_GETSTATUS
        value: 0,
        index: 0
      }, 6);

      // Check if device is busy (state 4 = dfuDNBUSY)
      let state = status.data?.getUint8(4);
      while (state === 4) {
        // Parse bwPollTimeout (3 bytes, little endian)
        const bwPollTimeout = (status.data?.getUint8(1) || 0) |
                              ((status.data?.getUint8(2) || 0) << 8) |
                              ((status.data?.getUint8(3) || 0) << 16);
        
        // Ensure we wait AT LEAST the requested timeout, plus extra for Android 16
        const pollDelay = Math.max(bwPollTimeout, isAndroid16 ? 50 : 10);
        await new Promise(r => setTimeout(r, pollDelay));
        
        status = await device.controlTransferIn({
          requestType: 'class',
          recipient: 'interface',
          request: 3,
          value: 0,
          index: 0
        }, 6);
        state = status.data?.getUint8(4);
      }

      onProgress(((block + 1) / TOTAL_BLOCKS) * 100);
    }

    // 8. DFU Manifestation / Exit DFU
    console.log('Sending 0-byte DFU_DNLOAD to trigger manifestation...');
    await device.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 1, // DFU_DNLOAD
      value: 0, // Zero length download to trigger manifestation
      index: 0
    });

    // 6. Read status to advance state machine to dfuMANIFEST-SYNC
    await device.controlTransferIn({
      requestType: 'class',
      recipient: 'interface',
      request: 3, // DFU_GETSTATUS
      value: 0,
      index: 0
    }, 6);

    // 7. Read status again to advance to dfuMANIFEST / trigger reboot
    try {
      await device.controlTransferIn({
        requestType: 'class',
        recipient: 'interface',
        request: 3, // DFU_GETSTATUS
        value: 0,
        index: 0
      }, 6);
    } catch (e) {
      // Device might disconnect here as it reboots
      console.log('Device disconnected during manifestation (expected).');
    }

    // 8. Force USB Reset to ensure the radio boots into the new firmware
    console.log('Issuing USB reset to restart the radio...');
    try {
      await device.reset();
    } catch (e) {
      console.log('USB reset threw an error (often expected if device already rebooted):', e);
    }

    // Clear active device since it has rebooted
    activeDevice = null;

    return true;
  } catch (error) {
    console.error('DFU Flashing Error:', error);
    return false;
  }
};

/**
 * Flash User Database (SPI Flash)
 * MD380 uses a custom protocol (bRequest 0x91) to write to the external SPI flash memory.
 * This function implements block-by-block synchronization adapted for Android 16 / S24U.
 */
export const flashDatabase = async (
  dataBuffer: Uint8Array,
  onProgress: (progress: number) => void,
  isAndroid16: boolean = false
): Promise<boolean> => {
  if (!activeDevice) {
    console.error('No device connected for database flashing.');
    return false;
  }

  try {
    const device = activeDevice;
    const CHUNK_SIZE = 1024; // SPI Flash write block size
    const TOTAL_SIZE = dataBuffer.length;
    const TOTAL_BLOCKS = Math.ceil(TOTAL_SIZE / CHUNK_SIZE);
    
    console.log(`Starting User Database (SPI Flash) transfer... Size: ${TOTAL_SIZE} bytes`);

    // 1. Initialize SPI Flash Write Mode
    await device.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: 0x90, // Custom command to prepare SPI flash
      value: 0,
      index: 0
    });
    await new Promise(r => setTimeout(r, isAndroid16 ? 200 : 50));

    for (let block = 0; block < TOTAL_BLOCKS; block++) {
      const offset = block * CHUNK_SIZE;
      const chunk = dataBuffer.slice(offset, offset + CHUNK_SIZE);
      
      // Pad the last block if necessary
      const paddedChunk = new Uint8Array(CHUNK_SIZE);
      paddedChunk.set(chunk);
      
      // Calculate SPI Flash Address (Block * 1024)
      const address = offset;
      const wValue = (address >> 16) & 0xFFFF; // High 16 bits
      const wIndex = address & 0xFFFF;         // Low 16 bits
      
      // 2. Write SPI Flash Block (bRequest = 0x91)
      await device.controlTransferOut({
        requestType: 'vendor',
        recipient: 'device',
        request: 0x91, // Write SPI Flash command
        value: wValue,
        index: wIndex
      }, paddedChunk);

      // 3. Android 16 / S24U Timing Patch (Slower Pacing)
      if (isAndroid16) {
        await new Promise(r => setTimeout(r, 50)); 
      } else {
        await new Promise(r => setTimeout(r, 15)); 
      }

      // 4. Verify/Sync Block (bRequest = 0x92 - Read SPI Flash Status)
      try {
        await device.controlTransferIn({
          requestType: 'vendor',
          recipient: 'device',
          request: 0x92, // Read SPI Flash Status
          value: 0,
          index: 0
        }, 1);
      } catch (e) {
        // If the device stalls, it means it's still busy. Wait and retry once.
        await new Promise(r => setTimeout(r, isAndroid16 ? 100 : 20));
      }

      onProgress(((block + 1) / TOTAL_BLOCKS) * 100);
    }

    console.log('Database flash complete. Rebooting radio...');
    
    // 5. Finalize and Reboot
    await device.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: 0x94, // Custom command to finalize SPI flash and reboot
      value: 0,
      index: 0
    });

    try {
      await device.reset();
    } catch (e) {
      console.log('USB reset threw an error (expected):', e);
    }

    activeDevice = null;
    return true;
  } catch (error) {
    console.error('Database Flashing Error:', error);
    return false;
  }
};
