export interface DMRUser {
  id: number;
  callsign: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export interface DeviceStatus {
  connected: boolean;
  model: string;
  firmware: string;
  lastSync?: string;
}

export interface AndroidPatchInfo {
  title: string;
  description: string;
  codeSnippet: string;
  status: 'pending' | 'applied' | 'error';
}
