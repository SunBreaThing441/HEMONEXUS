import type { 
  BloodRequest, 
  DonorProfile, 
  EventProfile, 
  LegacyApiResponse 
} from '../types';

export class HemoNexusApi {
  /**
   * Introspects server-side session directly via auth_status.php
   */
  static async verifySession(): Promise<{
    authenticated: boolean;
    role: 'donor' | 'organizer' | null;
    sessionId: string | null;
    user: any | null;
  }> {
    try {
      const response = await fetch('/api/auth_status.php', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (response.ok) {
        const data = await response.json();
        return {
          authenticated: !!data.authenticated,
          role: data.role || null,
          sessionId: data.session_id || null,
          user: data.user || null,
        };
      }
    } catch (err) {
      console.warn('[Security Bridge] Error verifying session:', err);
    }
    return { authenticated: false, role: null, sessionId: null, user: null };
  }

  /**
   * Dispatches form data to legacy Core PHP endpoint using application/x-www-form-urlencoded
   * ensuring 100% native compatibility with PHP procedural $_POST superglobals.
   */
  static async postLegacy(endpoint: string, data: Record<string, any>): Promise<LegacyApiResponse> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: searchParams.toString(),
        credentials: 'include',
      });

      const html = await response.text();
      return this.parseLegacyScriptResponse(html);
    } catch (err: any) {
      console.warn(`[HemoNexus Bridge] Network error calling ${endpoint}:`, err);
      return {
        success: false,
        message: err.message || 'Network communication error',
        redirectTarget: null,
      };
    }
  }

  /**
   * Fetches raw HTML page from PHP server with session cookies attached
   */
  static async getHtml(endpoint: string): Promise<string> {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        credentials: 'include',
      });
      return await response.text();
    } catch (err) {
      console.warn(`[HemoNexus Bridge] Error fetching ${endpoint}:`, err);
      return '';
    }
  }

  /**
   * Parses legacy PHP responses that output:
   * <script> alert('...'); window.location = '...'; </script>
   */
  private static parseLegacyScriptResponse(html: string): LegacyApiResponse {
    const alertMatch = html.match(/alert\(['"]([^'"]+)['"]\)/i);
    const locationMatch = html.match(/window\.location\s*=\s*['"]([^'"]+)['"]/i);

    const message = alertMatch ? alertMatch[1] : '';
    const redirectTarget = locationMatch ? locationMatch[1].trim() : null;

    const lower = message.toLowerCase();
    const isError =
      lower.includes('error') ||
      lower.includes('does not match') ||
      lower.includes('invalid') ||
      lower.includes('already registered');

    const success = !isError && (message.length > 0 || (redirectTarget !== null && !redirectTarget.includes('login')));

    return {
      success,
      message: message || (success ? 'Command executed successfully.' : 'Unexpected server response.'),
      redirectTarget,
      rawHtml: html,
    };
  }

  // --- Authenticated Donor Operations ---

  static async loginDonor(userName: string, password: string): Promise<LegacyApiResponse> {
    return this.postLegacy('login_donor.php', {
      user_name: userName,
      password: password,
      submit: 'Login',
    });
  }

  static async submitDonorRegistration(data: Record<string, any>): Promise<LegacyApiResponse> {
    return this.postLegacy('process.php', {
      ...data,
      submit: 'Submit',
    });
  }

  static async verifyDonorOTP(otp: string): Promise<LegacyApiResponse> {
    return this.postLegacy('process.php', {
      otpno: otp,
      submit: 'Sucess', // Legacy PHP spelling invariant
    });
  }

  static async resendDonorOTP(): Promise<LegacyApiResponse> {
    return this.postLegacy('process.php', {
      submit: 'Resend',
    });
  }

  static async claimBloodRequest(requestId: string): Promise<LegacyApiResponse> {
    return this.postLegacy('pending_request_donor.php', {
      id: requestId,
      submit: 'Submit',
    });
  }

  static async logoutDonor(): Promise<void> {
    await this.getHtml('signout_donor.php');
    sessionStorage.clear();
    localStorage.removeItem('hemonexus_user_cache');
  }

  // --- Authenticated Event Organizer Operations ---

  static async loginEvent(userEmail: string, password: string): Promise<LegacyApiResponse> {
    return this.postLegacy('login_event.php', {
      user_email: userEmail,
      password: password,
      submit: 'Login',
    });
  }

  static async registerEvent(data: Record<string, any>): Promise<LegacyApiResponse> {
    return this.postLegacy('registar_event.php', {
      ...data,
      submit: 'Submit',
    });
  }

  static async checkinDonorAtCamp(campPayload: {
    donorId: string;
    weight: string;
    bloodPressure: string;
    pulse: string;
    hemoglobin: string;
    need: string;
  }): Promise<LegacyApiResponse> {
    return this.postLegacy('eventdata_entry.php', {
      donor_id: campPayload.donorId,
      weight: campPayload.weight,
      bloodpressure: campPayload.bloodPressure,
      pulse: campPayload.pulse,
      hemoglobin: campPayload.hemoglobin,
      need: campPayload.need,
      submit: 'Add',
    });
  }

  static async logoutEvent(): Promise<void> {
    await this.getHtml('signout_event.php');
    sessionStorage.clear();
    localStorage.removeItem('hemonexus_user_cache');
  }

  // --- Public Operations ---

  static async submitEmergencyBloodRequest(data: Record<string, any>): Promise<LegacyApiResponse> {
    return this.postLegacy('request_blood.php', {
      ...data,
      submit: 'Submit',
    });
  }

  static async submitContribution(data: Record<string, any>): Promise<LegacyApiResponse> {
    return this.postLegacy('contribute.php', {
      ...data,
      submit: 'Submit',
    });
  }

  static async submitContactFeedback(data: Record<string, any>): Promise<LegacyApiResponse> {
    return this.postLegacy('get_in_touch.php', {
      ...data,
      submit: 'Submit',
    });
  }

  // --- Dynamic Database Query Endpoints (data_api.php) ---

  /**
   * Universal Dynamic Data Bridge querying MariaDB via data_api.php
   */
  static async fetchDynamicData(action: string, params: Record<string, any> = {}): Promise<any> {
    const qs = new URLSearchParams({ action, ...params }).toString();
    try {
      const response = await fetch(`/api/data_api.php?${qs}`, {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn(`[Data API Bridge] Error querying data_api.php?action=${action}:`, err);
    }
    return { success: false };
  }

  /**
   * Fetches pending blood requests from b24u.requestblood
   */
  static async fetchPendingRequests(bloodGroup?: string): Promise<any[]> {
    const res = await this.fetchDynamicData('requests', bloodGroup ? { blood_group: bloodGroup } : {});
    return res && res.success && Array.isArray(res.requests) ? res.requests : [];
  }

  /**
   * Fetches donation records from donor's table {$user_name}
   */
  static async fetchDonorHistory(): Promise<any[]> {
    const res = await this.fetchDynamicData('donor_history');
    return res && res.success && Array.isArray(res.history) ? res.history : [];
  }

  /**
   * Fetches camp roster from organizer's table {$user_email}
   */
  static async fetchCampRoster(): Promise<any[]> {
    const res = await this.fetchDynamicData('camp_roster');
    return res && res.success && Array.isArray(res.attendees) ? res.attendees : [];
  }

  /**
   * Fetches latest verified donor vitals from donorlogin table
   */
  static async fetchDonorVitals(): Promise<any | null> {
    const res = await this.fetchDynamicData('donor_vitals');
    return res && res.success && res.vitals ? res.vitals : null;
  }

  /**
   * Looks up a registered donor by ID for Camp Kiosk check-in
   */
  static async lookupDonor(donorId: string): Promise<any | null> {
    const res = await this.fetchDynamicData('donor_lookup', { donor_id: donorId });
    return res && res.success && res.donor ? res.donor : null;
  }

  // --- HTML Scraping / Parsing Helpers ---

  static parsePendingBloodRequestsFromHtml(html: string): BloodRequest[] {
    const list: BloodRequest[] = [];
    if (!html) return list;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('table tr');

      rows.forEach((row, index) => {
        if (index === 0) return; // Skip th
        const cols = row.querySelectorAll('td');
        if (cols.length >= 7) {
          list.push({
            id: cols[0]?.textContent?.trim() || `#REQ-${index}`,
            patientName: cols[1]?.textContent?.trim() || 'Confidential Patient',
            bloodGroup: cols[2]?.textContent?.trim() || 'O+',
            requiredDate: cols[3]?.textContent?.trim() || 'Immediate',
            hospitalName: cols[4]?.textContent?.trim() || 'Regional Medical Ward',
            hospitalAddress: cols[5]?.textContent?.trim() || 'Emergency Wing',
            contactName: cols[6]?.textContent?.trim() || 'Charge Nurse',
            contactNumber: cols[7]?.textContent?.trim() || '',
            city: cols[8]?.textContent?.trim() || 'Metro',
            doctorName: 'Attending Physician',
            contactMailId: '',
            otherMessage: 'High-priority clinical transfusion request',
            status: '0',
          });
        }
      });
    } catch (e) {
      console.error('Error parsing blood requests table:', e);
    }

    return list;
  }
}
