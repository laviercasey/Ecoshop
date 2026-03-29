import { cn } from '@shared/lib';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleSwitchProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BC34A] focus-visible:ring-offset-2',
          checked ? 'bg-[#8BC34A]' : 'bg-[#D1D5DB]',
          disabled && 'pointer-events-none',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]',
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-[13px] font-medium text-[#1A1A1A]">{label}</span>}
          {description && <span className="text-[12px] text-[#7A7A7A]">{description}</span>}
        </div>
      )}
    </label>
  );
}
