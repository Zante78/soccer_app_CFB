import React from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div className="tabs" data-active={activeTab}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, activeTab, setActiveTab }: TabsListProps & { activeTab: string; setActiveTab: (value: string) => void }) {
  return (
    <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-4">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, activeTab, setActiveTab }: TabsTriggerProps & { activeTab: string; setActiveTab: (value: string) => void }) {
  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium transition-all rounded-lg ${
        activeTab === value
          ? 'bg-white text-gray-900 shadow'
          : 'text-gray-600 hover:text-gray-900'
      }`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, activeTab }: TabsContentProps & { activeTab: string }) {
  if (activeTab !== value) return null;
  return <div>{children}</div>;
}