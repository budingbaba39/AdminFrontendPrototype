import { sampleUsers } from './UserData';

// KYC Settings Interface
export interface KYCSettings {
  requirement: 'Before Deposit' | 'Before Withdraw';
  passportRequired: boolean;
  icRequired: boolean;
  icFrontRequired: boolean;
  icBackRequired: boolean;
  icSelfieRequired: boolean;
}

// KYC Submission Interface
export interface KYCSubmission {
  id: string;
  userId: string;
  username: string;
  documentType: 'Passport' | 'IC';
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  documents: {
    front: string;
    back: string;
    selfie: string;
  };
  remark?: string;
  processedDate?: string;
  handler?: string;
}

// Sample KYC submissions
export const initialKYCSubmissions: KYCSubmission[] = [
  {
    id: 'KYC001',
    userId: 'USR001',
    username: sampleUsers.find(u => u.id === 'USR001')?.name || 'User 1',
    documentType: 'Passport',
    submissionDate: '2024-01-15 10:30',
    status: 'Pending',
    documents: { front: '', back: '', selfie: '' },
    remark: ''
  },
  {
    id: 'KYC002',
    userId: 'USR002',
    username: sampleUsers.find(u => u.id === 'USR002')?.name || 'User 2',
    documentType: 'IC',
    submissionDate: '2024-01-14 14:20',
    status: 'Approved',
    documents: { front: '', back: '', selfie: '' },
    remark: 'Approved by admin',
    processedDate: '2024-01-14 15:30',
    handler: 'admin'
  },
  {
    id: 'KYC003',
    userId: 'USR003',
    username: sampleUsers.find(u => u.id === 'USR003')?.name || 'User 3',
    documentType: 'Passport',
    submissionDate: '2024-01-13 09:15',
    status: 'Rejected',
    documents: { front: '', back: '', selfie: '' },
    remark: 'Document unclear',
    processedDate: '2024-01-13 10:45',
    handler: 'admin'
  },
  {
    id: 'KYC004',
    userId: 'USR004',
    username: sampleUsers.find(u => u.id === 'USR004')?.name || 'User 4',
    documentType: 'IC',
    submissionDate: '2024-01-12 16:45',
    status: 'Pending',
    documents: { front: '', back: '', selfie: '' },
    remark: ''
  },
  {
    id: 'KYC005',
    userId: 'USR005',
    username: sampleUsers.find(u => u.id === 'USR005')?.name || 'User 5',
    documentType: 'Passport',
    submissionDate: '2024-01-11 11:00',
    status: 'Approved',
    documents: { front: '', back: '', selfie: '' },
    remark: 'Verified',
    processedDate: '2024-01-11 12:15',
    handler: 'admin'
  },
  {
    id: 'KYC006',
    userId: 'USR006',
    username: sampleUsers.find(u => u.id === 'USR006')?.name || 'User 6',
    documentType: 'IC',
    submissionDate: '2024-01-10 13:30',
    status: 'Pending',
    documents: { front: '', back: '', selfie: '' },
    remark: ''
  },
  {
    id: 'KYC007',
    userId: 'USR007',
    username: sampleUsers.find(u => u.id === 'USR007')?.name || 'User 7',
    documentType: 'Passport',
    submissionDate: '2024-01-09 15:20',
    status: 'Approved',
    documents: { front: '', back: '', selfie: '' },
    remark: 'All documents verified',
    processedDate: '2024-01-09 16:30',
    handler: 'admin'
  },
  {
    id: 'KYC008',
    userId: 'USR008',
    username: sampleUsers.find(u => u.id === 'USR008')?.name || 'User 8',
    documentType: 'IC',
    submissionDate: '2024-01-08 10:10',
    status: 'Rejected',
    documents: { front: '', back: '', selfie: '' },
    remark: 'Expired document',
    processedDate: '2024-01-08 11:25',
    handler: 'admin'
  },
  {
    id: 'KYC009',
    userId: 'USR009',
    username: sampleUsers.find(u => u.id === 'USR009')?.name || 'User 9',
    documentType: 'Passport',
    submissionDate: '2024-01-07 14:35',
    status: 'Pending',
    documents: { front: '', back: '', selfie: '' },
    remark: ''
  },
  {
    id: 'KYC010',
    userId: 'USR010',
    username: sampleUsers.find(u => u.id === 'USR010')?.name || 'User 10',
    documentType: 'IC',
    submissionDate: '2024-01-06 09:50',
    status: 'Approved',
    documents: { front: '', back: '', selfie: '' },
    remark: 'Approved',
    processedDate: '2024-01-06 10:20',
    handler: 'admin'
  }
];

// Default KYC Settings
export const defaultKYCSettings: KYCSettings = {
  requirement: 'Before Withdraw',
  passportRequired: true,
  icRequired: true,
  icFrontRequired: true,
  icBackRequired: true,
  icSelfieRequired: true
};
