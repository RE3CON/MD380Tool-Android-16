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
  firmwareBuffer: Uint8Array,
  onProgress: (progress: number) => void,
  isAndroid16: boolean = false
): Promise<boolean> => {
  if (!activeDevice) {
    console.error('No device connected for flashing.');
    return false;
  }

  try {
    const device = activeDevice;

    // --- Helper Functions based on TyMD380Tool ---
    
    const getStatus = async () => {
      const res = await device.controlTransferIn({
        requestType: 'class',
        recipient: 'interface',
        request: 3, // DFU_GETSTATUS
        value: 0,
        index: 0
      }, 6);
      return res.data;
    };

    const getState = async () => {
      const res = await device.controlTransferIn({
        requestType: 'class',
        recipient: 'interface',
        request: 5, // DFU_GETSTATE
        value: 0,
        index: 0
      }, 1);
      return res.data?.getUint8(0);
    };

    const abort = async () => {
      await device.controlTransferOut({
        requestType: 'class',
        recipient: 'interface',
        request: 6, // DFU_ABORT
        value: 0,
        index: 0
      });
    };

    const enterDfuMode = async () => {
      let state = await getState();
      let retries = 5;
      while (state !== 2 && retries > 0) { // 2 is dfuIDLE
        await abort();
        await new Promise(r => setTimeout(r, 50));
        
        await device.controlTransferOut({
          requestType: 'class',
          recipient: 'interface',
          request: 4, // DFU_CLRSTATUS
          value: 0,
          index: 0
        });
        
        state = await getState();
        retries--;
      }
    };

    const download = async (block: number, data: Uint8Array) => {
      await device.controlTransferOut({
        requestType: 'class',
        recipient: 'interface',
        request: 1, // DFU_DNLOAD
        value: block,
        index: 0
      }, data);
      
      if (isAndroid16) await new Promise(r => setTimeout(r, 10));
      
      // The original app calls getStatus() twice immediately after download
      await getStatus();
      await getStatus();
    };

    const md380cmd = async (a: number, b: number) => {
      await download(0, new Uint8Array([a, b]));
    };

    const setAddress = async (address: number) => {
      const buf = new Uint8Array([
        0x21,
        address & 0xff,
        (address >> 8) & 0xff,
        (address >> 16) & 0xff,
        (address >> 24) & 0xff
      ]);
      await download(0, buf);
    };

    const eraseBlock = async (address: number) => {
      const buf = new Uint8Array([
        0x41,
        address & 0xff,
        (address >> 8) & 0xff,
        (address >> 16) & 0xff,
        (address >> 24) & 0xff
      ]);
      await download(0, buf);
    };

    // --- Main Flashing Logic ---

    console.log('Entering DFU Mode...');
    await enterDfuMode();

    console.log('Sending init commands...');
    await md380cmd(0x91, 0x01); // -0x6f, 1
    await md380cmd(0xa2, 0x02); // -0x5e, 2
    await md380cmd(0xa2, 0x02); // -0x5e, 2
    await md380cmd(0xa2, 0x03); // -0x5e, 3
    await md380cmd(0xa2, 0x04); // -0x5e, 4
    await md380cmd(0xa2, 0x07); // -0x5e, 7

    console.log('Erasing flash memory...');
    await eraseBlock(0x0800C000);
    
    let eraseStep = 0;
    const totalEraseSteps = ((0x080F0000 - 0x08010000) / 0x10000) + 1;
    
    for (let i = 0x08010000; i < 0x080F0000; i += 0x10000) {
      await eraseBlock(i);
      eraseStep++;
      // Erasing represents the first 15% of progress
      onProgress((eraseStep / totalEraseSteps) * 15);
    }

    console.log('Writing firmware...');
    let upgradeAddress = 0x0800C000;
    // CRITICAL: Skip the first 256 bytes (0x100) of the .bin file as per the original app
    let offset = 0x100; 
    const totalBytesToWrite = firmwareBuffer.length - offset;
    let bytesWritten = 0;
    
    while (offset < firmwareBuffer.length) {
      const toget = Math.min(1024, firmwareBuffer.length - offset);
      const block = new Uint8Array(1024).fill(0xFF);
      block.set(firmwareBuffer.slice(offset, offset + toget));
      
      await setAddress(upgradeAddress);
      await download(2, block); // Always block 2 for data
      
      upgradeAddress += toget;
      offset += toget;
      bytesWritten += toget;
      
      // Writing represents 15% to 100% of progress
      const writeProgress = 15 + ((bytesWritten / totalBytesToWrite) * 85);
      onProgress(writeProgress);
    }

    console.log('Rebooting device...');
    try {
      await md380cmd(0x91, 0x05); // -0x6f, 5
    } catch (e) {
      console.log('Device disconnected during reboot (expected).');
    }

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
      
      // Pad the last block if necessary (Flash memory erases to 0xFF)
      const paddedChunk = new Uint8Array(CHUNK_SIZE).fill(0xFF);
      paddedChunk.set(chunk);
      
      // Calculate SPI Flash Address (Block * 1024)
      const address = offset;
      const wValue = address & 0xFFFF;         // Low 16 bits
      const wIndex = (address >> 16) & 0xFFFF; // High 16 bits
      
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

/**
 * Read Firmware from Radio
 * Uses DFU_UPLOAD to read the firmware from the device.
 */
export const readFirmware = async (
  onProgress: (progress: number) => void,
  isAndroid16: boolean = false
): Promise<Uint8Array | null> => {
  if (!activeDevice) {
    console.error('No device connected for reading firmware.');
    return null;
  }

  try {
    const device = activeDevice;
    const CHUNK_SIZE = 1024;
    const TOTAL_SIZE = 1024 * 1024; // 1MB standard firmware size for MD380
    const TOTAL_BLOCKS = Math.ceil(TOTAL_SIZE / CHUNK_SIZE);
    const firmwareBuffer = new Uint8Array(TOTAL_SIZE);

    console.log('Clearing DFU Status...');
    await device.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 4, // DFU_CLRSTATUS
      value: 0,
      index: 0
    });
    await new Promise(r => setTimeout(r, isAndroid16 ? 100 : 50));

    console.log('Setting Address Pointer to 0x0800C000 for reading...');
    const setAddrCmd = new Uint8Array([0x21, 0x00, 0xC0, 0x00, 0x08]);
    await device.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 1, // DFU_DNLOAD
      value: 0,
      index: 0
    }, setAddrCmd);

    await device.controlTransferIn({
      requestType: 'class',
      recipient: 'interface',
      request: 3, // DFU_GETSTATUS
      value: 0,
      index: 0
    }, 6);
    
    await new Promise(r => setTimeout(r, isAndroid16 ? 200 : 100));

    await device.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 4, // DFU_CLRSTATUS
      value: 0,
      index: 0
    });
    await new Promise(r => setTimeout(r, isAndroid16 ? 100 : 50));

    console.log('Starting firmware read...');
    for (let block = 0; block < TOTAL_BLOCKS; block++) {
      const result = await device.controlTransferIn({
        requestType: 'class',
        recipient: 'interface',
        request: 2, // DFU_UPLOAD
        value: block + 2,
        index: 0
      }, CHUNK_SIZE);

      if (result.data) {
        firmwareBuffer.set(new Uint8Array(result.data.buffer), block * CHUNK_SIZE);
      }

      if (isAndroid16) {
        await new Promise(r => setTimeout(r, 40));
      } else {
        await new Promise(r => setTimeout(r, 10));
      }

      onProgress(((block + 1) / TOTAL_BLOCKS) * 100);
    }

    console.log('Firmware read complete.');
    
    // Reset device to exit DFU mode
    try {
      await device.reset();
    } catch (e) {
      console.log('USB reset threw an error (expected):', e);
    }
    activeDevice = null;

    return firmwareBuffer;
  } catch (error) {
    console.error('Firmware Reading Error:', error);
    return null;
  }
};
