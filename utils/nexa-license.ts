'use client';

export const NEXA_LICENSE_KEY_STORAGE = 'healthos_nexa_license_key';
export const NEXA_DEVICE_ID_STORAGE = 'healthos_nexa_device_id';
export const NEXA_LAST_VERIFIED_STORAGE = 'healthos_nexa_last_verified_at';

const DEFAULT_NEXA_API_URL =
  'https://nexa-subscriptions.vercel.app';
const REQUEST_TIMEOUT_MS = 12_000;

export type NexaLicenseResult = {
  valid: boolean;
  code: string;
  message?: string;
  subscription?: {
    status: 'active' | 'trial';
    product: string;
    plan: string;
    renewsAt: string | null;
  };
  entitlements?: {
    deviceTypes: string[];
    deviceLimit: number;
  };
  device?: {
    id: string;
    name: string;
    type: string;
  };
};

type LicenseAction = 'activate' | 'verify' | 'deactivate';

function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_NEXA_API_URL || DEFAULT_NEXA_API_URL).replace(
    /\/+$/,
    ''
  );
}

function randomDeviceId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `healthos-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateDeviceId() {
  const existing = window.localStorage.getItem(NEXA_DEVICE_ID_STORAGE);
  if (existing) return existing;

  const deviceId = randomDeviceId();
  window.localStorage.setItem(NEXA_DEVICE_ID_STORAGE, deviceId);
  return deviceId;
}

export function getDeviceDetails() {
  const userAgent = window.navigator.userAgent;
  const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(userAgent);
  const isMobile =
    !isTablet && /Android|iPhone|iPod|IEMobile|Mobile/i.test(userAgent);
  const type = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
  const platform =
    window.navigator.platform ||
    (/Windows/i.test(userAgent)
      ? 'Windows'
      : /Mac/i.test(userAgent)
        ? 'macOS'
        : /Linux/i.test(userAgent)
          ? 'Linux'
          : 'Browser');

  return {
    id: getOrCreateDeviceId(),
    name: `HealthOS · ${platform}`,
    type,
    platform
  };
}

async function licenseRequest(
  action: LicenseAction,
  body: Record<string, unknown>
): Promise<NexaLicenseResult> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(`${apiBaseUrl()}/api/v1/licenses/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal
    });
    const result = (await response.json()) as NexaLicenseResult;

    if (!response.ok && !result.code) {
      throw new Error('Nexa licensing service rejected the request.');
    }

    return result;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function activateNexaLicense(licenseKey: string) {
  return licenseRequest('activate', {
    licenseKey: licenseKey.trim(),
    product: 'HealthOS',
    device: getDeviceDetails()
  });
}

export async function verifyNexaLicense(licenseKey: string) {
  return licenseRequest('verify', {
    licenseKey: licenseKey.trim(),
    product: 'HealthOS',
    deviceId: getOrCreateDeviceId()
  });
}

export async function deactivateNexaLicense(licenseKey: string) {
  return licenseRequest('deactivate', {
    licenseKey: licenseKey.trim(),
    deviceId: getOrCreateDeviceId()
  });
}

export function loadStoredLicenseKey() {
  return window.localStorage.getItem(NEXA_LICENSE_KEY_STORAGE)?.trim() || '';
}

export function storeVerifiedLicense(licenseKey: string) {
  window.localStorage.setItem(NEXA_LICENSE_KEY_STORAGE, licenseKey.trim());
  window.localStorage.setItem(NEXA_LAST_VERIFIED_STORAGE, String(Date.now()));
}

export function markLicenseVerified() {
  window.localStorage.setItem(NEXA_LAST_VERIFIED_STORAGE, String(Date.now()));
}

export function clearStoredLicense() {
  window.localStorage.removeItem(NEXA_LICENSE_KEY_STORAGE);
  window.localStorage.removeItem(NEXA_LAST_VERIFIED_STORAGE);
}
