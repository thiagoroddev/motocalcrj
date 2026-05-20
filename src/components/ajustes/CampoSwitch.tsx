import type { ReactNode } from 'react';
import { Switch } from '../ui/switch';

interface CampoSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: ReactNode;
}

export function CampoSwitch({ id, label, checked, onCheckedChange, children }: CampoSwitchProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {checked && children && <div className="space-y-2 pl-2 pt-1">{children}</div>}
    </div>
  );
}
