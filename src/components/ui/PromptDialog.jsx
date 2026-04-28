import React, { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

/**
 * PromptDialog — mobile-friendly replacement for window.prompt / window.confirm.
 *
 * Usage:
 *   <PromptDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Change email"
 *     description="Enter your new email address."
 *     inputLabel="Email"
 *     inputPlaceholder="name@example.com"
 *     defaultValue={currentEmail}
 *     confirmLabel="Update"
 *     cancelLabel="Cancel"
 *     onConfirm={(value) => handleChange(value)}
 *     destructive={false}
 *   />
 *
 * For confirm-only (no input):
 *   <PromptDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Delete account?"
 *     description="This cannot be undone."
 *     confirmLabel="Delete"
 *     cancelLabel="Cancel"
 *     onConfirm={() => handleDelete()}
 *     destructive
 *   />
 */
export default function PromptDialog({
  open,
  onOpenChange,
  title,
  description,
  inputLabel,
  inputPlaceholder = '',
  inputType = 'text',
  defaultValue = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  destructive = false,
}) {
  const [value, setValue] = useState(defaultValue);
  const needsInput = Boolean(inputLabel);

  function handleConfirm() {
    if (needsInput) {
      onConfirm?.(value);
    } else {
      onConfirm?.();
    }
    onOpenChange(false);
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 9998, animation: 'pdFadeIn 150ms ease-out',
        }} />
        <AlertDialog.Content style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff', borderRadius: 16, padding: '28px 24px 20px',
          width: 'min(380px, calc(100vw - 40px))',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          zIndex: 9999, animation: 'pdSlideIn 200ms ease-out',
        }}>
          <AlertDialog.Title style={{
            fontSize: 18, fontWeight: 700, letterSpacing: -0.3,
            margin: 0, color: '#0a0a0a',
          }}>
            {title}
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Description style={{
              fontSize: 14, lineHeight: 1.6, color: '#666',
              margin: '8px 0 0',
            }}>
              {description}
            </AlertDialog.Description>
          )}
          {needsInput && (
            <div style={{ marginTop: 16 }}>
              {inputLabel && (
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#999', letterSpacing: 0.3, marginBottom: 6,
                  textTransform: 'uppercase',
                }}>
                  {inputLabel}
                </label>
              )}
              <input
                type={inputType}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={inputPlaceholder}
                autoFocus
                style={{
                  width: '100%', padding: '12px 14px', fontSize: 15,
                  border: '1.5px solid #ddd', borderRadius: 10,
                  outline: 'none', background: '#fafaf8',
                  color: '#0a0a0a', transition: 'border-color 150ms',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#e8b500'; }}
                onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
              />
            </div>
          )}
          <div style={{
            display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end',
          }}>
            <AlertDialog.Cancel asChild>
              <button type="button" style={{
                padding: '10px 20px', fontSize: 14, fontWeight: 600,
                border: '1.5px solid #ddd', borderRadius: 10,
                background: 'transparent', color: '#666', cursor: 'pointer',
              }}>
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button type="button" onClick={handleConfirm} style={{
                padding: '10px 20px', fontSize: 14, fontWeight: 600,
                border: 'none', borderRadius: 10, cursor: 'pointer',
                background: destructive ? '#d93025' : '#e8b500',
                color: destructive ? '#fff' : '#0a0a0a',
              }}>
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
          <style>{`
            @keyframes pdFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes pdSlideIn { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }
          `}</style>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
