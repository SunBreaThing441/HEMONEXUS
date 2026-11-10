export interface DonorProfile {
  id: string;
  userName: string;
  userFullName: string;
  userEmail: string;
  userNumber: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  bloodGroup: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  weight: string;
  bloodPressure: string;
  pulse: string;
  hemoglobin: string;
  bloodDonation: number;
  pletletsDonation: number;
  plasamaDonation: number;
  totalDonation: number;
  healthReport: string;
  attendEvent: number;
  lastDonation: string;
  lastPlaceDonation: string;
}

export interface EventProfile {
  id: string;
  userFullName: string;
  userEmail: string;
  userNumber: string;
  eventAddress: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  pincode: string;
  city: string;
  state: string;
  need: string;
  otherMessage: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  hospitalName: string;
  hospitalAddress: string;
  doctorName: string;
  bloodGroup: string;
  city: string;
  contactName: string;
  contactNumber: string;
  contactMailId: string;
  otherMessage: string;
  requiredDate: string;
  status: '0' | '1';
  donorId?: string;
}

export interface CampAttendee {
  id: string;
  donorId: string;
  userFullName: string;
  userNumber: string;
  bloodGroup: string;
  weight: string;
  bloodPressure: string;
  pulse: string;
  hemoglobin: string;
  donationType: string;
}

export interface LegacyApiResponse {
  success: boolean;
  message: string;
  redirectTarget: string | null;
  rawHtml?: string;
}

export interface SessionState {
  checking: boolean;
  authenticated: boolean;
  role: 'donor' | 'organizer' | null;
  sessionId: string | null;
  user: DonorProfile | EventProfile | null;
}

export interface SecurityNotice {
  type: 'warning' | 'violation' | 'success';
  title: string;
  message: string;
  intendedRoute: string | null;
}
