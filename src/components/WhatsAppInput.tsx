import React from 'react';
import { sanitize10DigitMobile } from '../utils/phone';

interface WhatsAppInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  isDarkMode?: boolean;
  className?: string;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showHelpText?: boolean;
  helpText?: string;
}

export const WhatsAppInput: React.FC<WhatsAppInputProps> = ({
  value,
  onChange,
  label,
  placeholder = '98765 43210',
  disabled = false,
  required = false,
  isDarkMode = true,
  className = '',
  id,
  name,
  autoFocus = false,
  size = 'md',
  showHelpText = false,
  helpText,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = sanitize10DigitMobile(e.target.value);
    onChange(cleaned);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleaned = sanitize10DigitMobile(pastedText);
    onChange(cleaned);
  };

  const pyClass = size === 'sm' ? 'py-1.5' : size === 'lg' ? 'py-3' : 'py-2';
  const textClass = size === 'sm' ? 'text-xs' : 'text-xs';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`block text-xs font-bold mb-1.5 transition-colors ${
          isDarkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Fixed +91 Country Code Badge */}
        <div
          className={`absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg select-none pointer-events-none font-bold text-xs ${
            isDarkMode
              ? 'bg-slate-800/90 text-slate-300 border border-slate-700/80'
              : 'bg-slate-200/90 text-slate-700 border border-slate-300'
          }`}
        >
          <span className="text-[11px] leading-none">🇮🇳</span>
          <span className="font-mono tracking-tight font-extrabold">+91</span>
        </div>

        {/* 10-Digit Mobile Number Input */}
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          autoFocus={autoFocus}
          disabled={disabled}
          required={required}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={`w-full pl-[62px] pr-8 ${pyClass} ${textClass} rounded-xl font-mono tracking-wide transition border focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
            disabled
              ? isDarkMode
                ? 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : isDarkMode
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:bg-slate-900'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
          }`}
        />

        {/* 10 Digits Indicator Check / Counter */}
        {value.length > 0 && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono select-none">
            {value.length === 10 ? (
              <span className="text-emerald-500 font-bold">✓ 10d</span>
            ) : (
              <span className="text-amber-500 font-semibold">{value.length}/10</span>
            )}
          </div>
        )}
      </div>

      {showHelpText && (
        <p className={`text-[10px] mt-1 font-medium ${
          value && value.length !== 10
            ? 'text-amber-400'
            : isDarkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {helpText || (value && value.length !== 10 ? 'Enter valid 10-digit WhatsApp number' : 'Only 10 digits needed')}
        </p>
      )}
    </div>
  );
};
