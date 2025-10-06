import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Sample security log data
const sampleSecurityLogs = [
  {
    id: 1,
    date: '2025-09-22',
    time: '12:00AM',
    staff: 'DEMO81',
    ipAddress: '175.137.148.60',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
  },
  {
    id: 2,
    date: '2025-09-22',
    time: '11:45PM',
    staff: 'Liperiog',
    ipAddress: '2001:ee0:541a:a93a:89af:ab3e:4-751:4849',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0'
  },
  {
    id: 3,
    date: '2025-09-22',
    time: '11:30PM',
    staff: 'demo acc',
    ipAddress: '210.186.239.174',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
  }
];

export default function SecurityManagement() {
  const [ipWhitelist, setIpWhitelist] = useState('1.1.1.1\n8.8.8.8');
  const [selectedDate, setSelectedDate] = useState('2025-09-22');
  const [securityLogs] = useState(sampleSecurityLogs);

  const handleSaveWhitelist = () => {
    console.log('Saving IP whitelist:', ipWhitelist);
    // Add save logic here
  };

  const securityTips = [
    'Make sure all IP addresses are belong to your staffs.',
    'Set all unused staffs or agents account to inactive.',
    'Do not share your password to anyone for security.',
    'Please update your PC and browser to latest version.',
    'Recommend to turn on Hide Mobile function.',
    'Recommend to turn on 2FA Passcode.',
    'Recommend to restrict IP that allow to access your backend system.'
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Security Tips */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
        <div className="text-yellow-800">
          <h3 className="text-lg font-semibold mb-4">Security Tips</h3>
          <ul className="space-y-2 text-sm">
            {securityTips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* IP Whitelist Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="ipWhitelist" className="text-red-600 font-medium">
              Whitelist IP address that allowed to access your backend system. (Leave empty if you do not want to restrict any IP address)
            </Label>
            <textarea
              id="ipWhitelist"
              value={ipWhitelist}
              onChange={(e) => setIpWhitelist(e.target.value)}
              placeholder="Enter IP addresses (one per line)"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={8}
            />
          </div>
          
          <div>
            <Button 
              onClick={handleSaveWhitelist}
              className="bg-[#4caf50] hover:bg-[#45a049] text-white font-semibold px-6"
            >
              SAVE
            </Button>
          </div>
        </div>
      </div>

      {/* Access Log Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="logDate" className="text-sm font-medium text-gray-700">
              Date
            </Label>
            <Input
              id="logDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>

          {/* Access Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">TIME</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">STAFF</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">IP Address</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">USER AGENT</th>
                </tr>
              </thead>
              <tbody>
                {securityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm">{log.time}</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">{log.staff}</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm font-mono">{log.ipAddress}</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 truncate max-w-md">
                          {log.userAgent}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}