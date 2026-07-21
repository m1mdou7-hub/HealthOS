import React, { InputHTMLAttributes, ChangeEvent } from 'react';
import cn from 'classnames';

import s from './Input.module.css';

interface Props extends Omit<InputHTMLAttributes<any>, 'onChange'> {
  className?: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
}
const Input = (props: Props) => {
  const { className, children, onChange, label, id, 'aria-invalid': ariaInvalid, disabled, ...rest } = props;

  const rootClassName = cn(s.root, {}, className);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
    return null;
  };

  return (
    <label htmlFor={id} className="flex flex-col gap-2 w-full">
      {label && <span className="text-sm font-medium text-zinc-200">{label}</span>}
      <input
        id={id}
        className={rootClassName}
        onChange={handleOnChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        aria-invalid={ariaInvalid}
        disabled={disabled}
        aria-disabled={disabled}
        {...rest}
      />
    </label>
  );
};

export default Input;
