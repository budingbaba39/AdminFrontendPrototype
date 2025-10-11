import ProfileManagement from './ProfileManagement';
import { User } from './UserData';
import { Transaction } from './transactionData';

interface ProfileContentProps {
  user: User;
  transactions?: Transaction[];
  onUserUpdate?: (updatedUser: User) => void;
}

export default function ProfileContent({ user, transactions, onUserUpdate }: ProfileContentProps) {
  return <ProfileManagement user={user} transactions={transactions} onUserUpdate={onUserUpdate} />;
}