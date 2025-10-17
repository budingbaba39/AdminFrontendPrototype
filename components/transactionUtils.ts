// transactionUtils.ts - Shared utility functions for transaction management

import { Transaction } from './transactionData';

// Copy to clipboard utility
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

// Get status color class
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-700';
    case 'PENDING': return 'bg-yellow-100 text-yellow-700';
    case 'PROCESSING': return 'bg-blue-100 text-blue-700';
    case 'REJECTED': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// Get transaction type color class
export const getTypeColor = (type: string) => {
  switch (type) {
    case 'DEPOSIT': return 'bg-green-500 text-white';
    case 'WITHDRAW': return 'bg-amber-500 text-white';
    case 'STAFF DEPOSIT': return 'bg-blue-500 text-white';
    case 'STAFF WITHDRAW': return 'bg-orange-500 text-white';
    case 'BONUS': return 'bg-purple-500 text-white';
    case 'REBATE': return 'bg-indigo-500 text-white';
    case 'PROMOTION': return 'bg-pink-500 text-white';
    case 'MANUAL': return 'bg-gray-500 text-white';
    case 'ANGPAO': return 'bg-yellow-500 text-white';
    case 'FORFEITED': return 'bg-red-600 text-white';
    case 'COMMISSION': return 'bg-teal-500 text-white';
    case 'LOSSCREDIT': return 'bg-red-700 text-white';
    case 'DEPOSIT FEE': return 'bg-gray-600 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

// Search filter interface
export interface SearchFilters {
  transactionId: string;
  customerId: string;
  transactionType: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  agentUsername: string;
  memberBank: string;
  otherInfo: string;
}

// Filter transactions based on search criteria
export const filterTransactions = (
  transactions: Transaction[],
  searchFilters: SearchFilters,
  hasSearched: boolean
): Transaction[] => {
  let filtered = transactions;
  
  if (hasSearched) {
    filtered = filtered.filter(transaction => {
      // Transaction ID filter
      if (searchFilters.transactionId && 
          !transaction.id.toLowerCase().includes(searchFilters.transactionId.toLowerCase())) {
        return false;
      }
      
      // Customer ID filter (search in both username and mobile)
      if (searchFilters.customerId) {
        const customerSearch = searchFilters.customerId.toLowerCase();
        if (!transaction.userID.toLowerCase().includes(customerSearch) && 
            !transaction.mobile.toLowerCase().includes(customerSearch)) {
          return false;
        }
      }
      
      // Transaction type filter
      if (searchFilters.transactionType !== 'ALL' && 
          transaction.type !== searchFilters.transactionType) {
        return false;
      }
      
      // Date range filter (using submitTime)
      if (searchFilters.startDate) {
        const submitDate = new Date(transaction.submitTime).toISOString().split('T')[0];
        if (submitDate < searchFilters.startDate) {
          return false;
        }
      }
      
      if (searchFilters.endDate) {
        const submitDate = new Date(transaction.submitTime).toISOString().split('T')[0];
        if (submitDate > searchFilters.endDate) {
          return false;
        }
      }
      
      // Amount range filter
      if (searchFilters.minAmount && transaction.amount < parseFloat(searchFilters.minAmount)) {
        return false;
      }
      
      if (searchFilters.maxAmount && transaction.amount > parseFloat(searchFilters.maxAmount)) {
        return false;
      }
      
      // Advanced filters
      // Agent username filter (search in processBy)
      if (searchFilters.agentUsername && 
          (!transaction.processBy || !transaction.processBy.toLowerCase().includes(searchFilters.agentUsername.toLowerCase()))) {
        return false;
      }
      
      // Member bank filter (search in 'from' field)
      if (searchFilters.memberBank && searchFilters.memberBank !== 'all' &&
          !transaction.from.toLowerCase().includes(searchFilters.memberBank.toLowerCase())) {
        return false;
      }
      
      // Other info filter (search in bankAccountNumber OR remark)
      if (searchFilters.otherInfo) {
        const otherSearch = searchFilters.otherInfo.toLowerCase();
        if (!transaction.bankAccountNumber.toLowerCase().includes(otherSearch) && 
            !transaction.remark.toLowerCase().includes(otherSearch)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  return filtered;
};

// Calculate status counts for specific transaction types and statuses
export const calculateStatusCounts = (
  transactions: Transaction[],
  allowedStatuses: string[],
  filteredTransactions: Transaction[]
) => {
  const counts: Record<string, number> = { ALL: 0 };
  
  // Initialize counts for allowed statuses
  allowedStatuses.forEach(status => {
    counts[status] = 0;
  });
  
  // Count transactions
  transactions.forEach(transaction => {
    if (allowedStatuses.includes(transaction.status)) {
      counts.ALL++;
      counts[transaction.status]++;
    }
  });
  
  return counts;
};

// Handle transaction status update
export const updateTransactionStatus = (
  transactions: Transaction[],
  transactionId: string,
  newStatus: 'PROCESSING' | 'COMPLETED' | 'REJECTED',
  remark: string = '',
  currentUser: string = 'CS001'
): Transaction[] => {
  const currentTime = new Date().toISOString().slice(0, 16).replace('T', ' ');
  
  return transactions.map(transaction => {
    if (transaction.id === transactionId) {
      const updatedTransaction = { ...transaction };
      
      if (newStatus === 'PROCESSING') {
        updatedTransaction.status = 'PROCESSING';
        updatedTransaction.processTime = currentTime;
        updatedTransaction.processBy = currentUser;
      } else if (newStatus === 'COMPLETED') {
        updatedTransaction.status = 'COMPLETED';
        updatedTransaction.completeTime = currentTime;
        updatedTransaction.completeBy = currentUser;
      } else if (newStatus === 'REJECTED') {
        updatedTransaction.status = 'REJECTED';
        updatedTransaction.rejectTime = currentTime;
        updatedTransaction.rejectBy = currentUser;
      }
      
      if (remark) {
        updatedTransaction.remark = remark;
      }
      
      return updatedTransaction;
    }
    return transaction;
  });
};

// Default search filters
export const defaultSearchFilters: SearchFilters = {
  transactionId: '',
  customerId: '',
  transactionType: 'ALL',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  agentUsername: '',
  memberBank: '',
  otherInfo: ''
};