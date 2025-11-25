'use client';

export default function Header() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <iconify-icon icon="mdi:magnify" className="text-xl"></iconify-icon>
            </span>
            <input
              type="text"
              placeholder="Search companies, orders, products..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <iconify-icon icon="mdi:bell-outline" className="text-2xl"></iconify-icon>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Menu */}
          <button className="flex items-center space-x-3 rounded-lg hover:bg-gray-50 p-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              AD
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <iconify-icon icon="mdi:chevron-down" className="text-gray-400"></iconify-icon>
          </button>
        </div>
      </div>
    </header>
  );
}

