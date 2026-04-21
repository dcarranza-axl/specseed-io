'use client'

import type { SeedInput } from '@/lib/seedSchema'
import type { FormFieldSpec } from '@/lib/formFields'
import { SegmentedControl } from './SegmentedControl'

interface FormFieldProps {
  spec: FormFieldSpec
  value: string
  onChange: (next: string) => void
}

export function FormField({ spec, value, onChange }: FormFieldProps) {
  const id = `field-${spec.id as keyof SeedInput}`

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {spec.label}
      </label>

      {spec.kind === 'text' && (
        <input
          id={id}
          type="text"
          className="form-input focus-brick"
          value={value}
          placeholder={spec.placeholder}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
      )}

      {spec.kind === 'textarea' && (
        <textarea
          id={id}
          className="form-textarea focus-brick"
          value={value}
          rows={spec.rows}
          placeholder={spec.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {spec.kind === 'select' && (
        <select
          id={id}
          className="form-select focus-brick"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {spec.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {spec.kind === 'segmented' && (
        <SegmentedControl
          name={spec.label}
          value={value}
          options={spec.options}
          onChange={onChange}
        />
      )}

      {spec.hint && <div className="form-hint">{spec.hint}</div>}
    </div>
  )
}
