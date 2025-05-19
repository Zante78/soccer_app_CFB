import React from 'react';
import { ModuleRegistry } from './ModuleRegistry';
import { Module } from './types';

interface ModuleContainerProps {
  moduleId: string;
  children: React.ReactNode;
}

export function ModuleContainer({ moduleId, children }: ModuleContainerProps) {
  const registry = ModuleRegistry.getInstance();
  const module = registry.getModule(moduleId);

  if (!module) {
    console.error(`Module ${moduleId} not found`);
    return null;
  }

  return (
    <div className="module-container" data-module-id={moduleId}>
      <div className="module-header">
        <h2 className="text-xl font-semibold text-gray-900">{module.name}</h2>
        <p className="text-sm text-gray-500">{module.description}</p>
      </div>
      <div className="module-content mt-4">
        {children}
      </div>
    </div>
  );
}