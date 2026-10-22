/**
 * Skupna pravila za obrazca »Novo zavarovanje« in »Pregled obstoječe police«.
 * Uporabljata jih brskalnik (scripts/upload.ts) in strežnik (pages/api/povprasevanje.ts),
 * da se preverjanje na obeh straneh ne razhaja.
 */
export const ENDPOINT = '/api/povprasevanje';
export const MAX_FILES = 5;
export const MAX_BYTES = 10 * 1024 * 1024;
export const ALLOWED_EXT = ['pdf', 'jpg', 'jpeg', 'png'];
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^\+?[\d\s/().-]{6,30}$/;
export const LIMITS = { name: 120, email: 200, phone: 40, message: 4000 };

export type InquiryKind = 'nova' | 'pregled';

export const ext = (name: string) => (name.includes('.') ? name.split('.').pop()!.toLowerCase() : '');
