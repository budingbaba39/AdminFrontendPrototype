import ProfileManagement from './ProfileManagement';
import { User } from './UserData';

interface ProfileContentProps {
  user: User;
  onUserUpdate?: (updatedUser: User) => void;
}

export default function ProfileContent({ user, onUserUpdate }: ProfileContentProps) {
  return <ProfileManagement user={user} onUserUpdate={onUserUpdate} />;
}