import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

export default function SystemSettingsOnly() {
  const [systemSettings, setSystemSettings] = useState({
    language: 'English',
    currency: 'MYR',
    timezone: 'Asia/Kuala_Lumpur',
    hideMobileNumber: 'No',
    displayLiveTransactions: false,
  });

  const handleSave = () => {
    console.log('✅ Saving System Settings:', systemSettings);
    alert('Settings saved (demo only)');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          System Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language */}
          <div>
            <Label htmlFor="language">Language</Label>
          <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
                <SelectItem value="Malay">Malay</SelectItem>
                <SelectItem value="Thai">Thai</SelectItem>
                <SelectItem value="Nepali">Nepali</SelectItem>
                <SelectItem value="Burmese">Burmese</SelectItem>
                <SelectItem value="Indonesian">Indonesian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div>
            <Label htmlFor="currency">Currency</Label>
          <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MYR">MYR</SelectItem>
                <SelectItem value="SGD">SGD</SelectItem>
                <SelectItem value="THB">THB</SelectItem>
                <SelectItem value="IDR">IDR</SelectItem>
                <SelectItem value="NPR">NPR</SelectItem>
                <SelectItem value="MMK">MMK</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={systemSettings.timezone}
              onValueChange={(value) =>
                setSystemSettings((prev) => ({ ...prev, timezone: value }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</SelectItem>
                <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                <SelectItem value="Asia/Jakarta">Asia/Jakarta</SelectItem>
                <SelectItem value="Asia/Kathmandu">Asia/Kathmandu</SelectItem>
                <SelectItem value="Asia/Yangon">Asia/Yangon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hide Mobile Number */}
          <div>
            <Label htmlFor="hideMobileNumber">Hide Mobile Number</Label>
          <Select value={systemSettings.hideMobileNumber} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, hideMobileNumber: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              <SelectItem value="Yes (except admin)">Yes (except admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Display Live Transactions */}
          <div>
          <Label htmlFor="displayLiveTransactions">Display Live Transactions (Dummy transactions)</Label>
            <div className="flex items-center mt-2">
              <Switch
                id="displayLiveTransactions"
                checked={systemSettings.displayLiveTransactions}
              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, displayLiveTransactions: checked }))}
              className={`scale-125 transition-colors duration-200 ${
                systemSettings.displayLiveTransactions
                  ? 'bg-green-500 data-[state=checked]:bg-blue-500'
                  : 'bg-gray-300 data-[state=unchecked]:bg-gray-300'
              }`}
              />
              <span className="ml-2 text-sm text-gray-600">{systemSettings.displayLiveTransactions ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>

      <div className="pt-4">
          <Button
          onClick={() => handleSave}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white">Save System Settings</Button>
        </div>
      </div>
    </div>
  );
}