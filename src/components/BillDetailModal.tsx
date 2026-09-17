import React from 'react';
import { BillRecord, ClubProfile } from '../types';
import { BillInvoicePrintModal } from './BillInvoicePrintModal';

interface BillDetailModalProps {
  bill: BillRecord | null;
  clubProfile: ClubProfile;
  isDarkMode: boolean;
  onClose: () => void;
}

export const BillDetailModal: React.FC<BillDetailModalProps> = ({
  bill,
  clubProfile,
  isDarkMode,
  onClose,
}) => {
  return (
    <BillInvoicePrintModal
      bill={bill}
      clubProfile={clubProfile}
      isDarkMode={isDarkMode}
      onClose={onClose}
    />
  );
};
