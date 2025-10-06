export default function DashboardContent() {
  return (
    <div className="p-4 md:p-8 h-full">
      {/* Hero Section */}
      <div className="bg-[#a36e6e] rounded-lg h-48 md:h-64 lg:h-80 mb-8 flex items-center justify-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
          DashBoard
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Transactions</h3>
          <p className="text-3xl font-bold text-green-600">5,678</p>
          <p className="text-sm text-gray-500 mt-1">+8% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">$89,123</p>
          <p className="text-sm text-gray-500 mt-1">+15% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Games</h3>
          <p className="text-3xl font-bold text-orange-600">42</p>
          <p className="text-sm text-gray-500 mt-1">+3 new games</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {[
              { id: 'TXN001', user: 'user123', amount: '+$150', status: 'Completed', time: '2 min ago' },
              { id: 'TXN002', user: 'player456', amount: '-$75', status: 'Pending', time: '5 min ago' },
              { id: 'TXN003', user: 'gamer789', amount: '+$300', status: 'Completed', time: '8 min ago' },
              { id: 'TXN004', user: 'user321', amount: '+$90', status: 'Completed', time: '12 min ago' },
            ].map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{txn.id}</span>
                  <span className="text-xs text-gray-500">{txn.user}</span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.amount}
                  </div>
                  <div className="text-xs text-gray-500">{txn.time}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  txn.status === 'Completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {txn.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Gateway</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Game Servers</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-600">Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}