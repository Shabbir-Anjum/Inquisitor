import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  FolderIcon,
  CheckSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BarChartIcon,
  SettingsIcon,
  HelpCircleIcon,
  GitMerge,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('');

  const sidebarItems = [
    { icon: HomeIcon, text: 'Setup Assistant', href: '/setup-assistant' },
    { icon: FolderIcon, text: 'Assistant Collection', href: '/assistants' },
    { icon: GitMerge, text: 'Performance Review', href: '/report' },
    { icon: CheckSquareIcon, text: 'Tasks', href: '/tasks' },
    { icon: BarChartIcon, text: 'Analytics', href: '/analytics' },
    { icon: SettingsIcon, text: 'Settings', href: '/settings' },
  ];

  useEffect(() => {
    const currentItem = sidebarItems.find(item => item.href === pathname);
    if (currentItem) {
      setActiveItem(currentItem.text);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col h-full dark:bg-gray-900">
      {/* Header */}
      <div className="p-2 flex items-center justify-between border-b border-gray-700">
        {!isCollapsed && (
           <Link href="/" className="flex items-center">
           <div 
             className="w-11 h-11 bg-blue-500 rounded-lg flex items-center justify-center text-xl font-bold mr-3 bg-cover bg-center"
             style={{ backgroundImage: 'url("/icon.jpg")' }}
           ></div>
           {!isCollapsed && <h1 className="app-name text-white">Inquisitor
             </h1>}
         </Link>
        )}

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon size={20} />
          ) : (
            <ChevronLeftIcon size={20} />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.text;

          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-2 p-2 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.text}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed && (
          <div className="mb-2">
            <Link
              href="/help"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <HelpCircleIcon size={20} />
              <span>Help & Support</span>
            </Link>
          </div>
        )}

        {/* User Profile */}
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-white text-sm">S</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">shabbir</p>
              <p className="text-xs text-gray-400">shabbir@example.com</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;