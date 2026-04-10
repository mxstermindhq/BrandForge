"use client";

import { forwardRef, useRef } from "react";

type Props = {
  text: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  placeholder: string;
  sendError?: string | null;
  autoFocus?: boolean;
  onComposerFocus?: () => void;
  uploadBusy?: boolean;
  attachDisabled?: boolean;
  onPickFiles?: (files: FileList | null) => void;
};

export const ChatComposer = forwardRef<HTMLTextAreaElement, Props>(function ChatComposer(
  {
    text,
    onChange,
    onSubmit,
    sending,
    placeholder,
    sendError,
    autoFocus,
    onComposerFocus,
    uploadBusy,
    attachDisabled,
    onPickFiles,
  },
  ref,
) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canAttach = Boolean(onPickFiles) && !attachDisabled;

  return (
    <form
      onSubmit={onSubmit}
      className="border-outline-variant/40 bg-surface-container-low shrink-0 border-t px-4 py-3 md:px-6"
    >
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.zip,.txt"
        multiple
        onChange={(e) => {
          onPickFiles?.(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-2 sm:flex-row sm:items-end">
        <label htmlFor="chat-composer" className="sr-only">
          Message
        </label>
        <textarea
          ref={ref}
          id="chat-composer"
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => onComposerFocus?.()}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const form = (e.target as HTMLTextAreaElement).closest("form");
              if (form && text.trim() && !sending) form.requestSubmit();
            }
          }}
          placeholder={placeholder}
          rows={2}
          className="bg-surface-container-high text-on-surface ring-outline-variant/50 placeholder:text-on-surface-variant min-h-[44px] max-h-[160px] flex-1 resize-y rounded-lg border-0 px-3 py-2.5 text-[15px] leading-relaxed outline-none ring-1 focus:ring-2 focus:ring-secondary/45"
          autoComplete="off"
        />
        {canAttach ? (
          <button
            type="button"
            disabled={Boolean(uploadBusy || sending)}
            className="border-outline-variant/40 text-on-surface-variant hover:text-on-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-transparent transition-colors disabled:opacity-40"
            aria-label="Attach file"
            onClick={() => fileRef.current?.click()}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden>
              attach_file
            </span>
          </button>
        ) : null}
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-secondary text-on-secondary hover:brightness-110 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold transition-[filter,opacity] disabled:opacity-40"
          aria-label="Send"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden>
            arrow_upward
          </span>
        </button>
      </div>
      {uploadBusy ? (
        <p className="text-on-surface-variant mx-auto mt-2 max-w-[720px] text-center text-xs">Uploading attachment…</p>
      ) : null}
      {sendError ? (
        <p className="text-error mx-auto mt-2 max-w-[720px] text-center text-xs" role="alert">
          {sendError}
        </p>
      ) : null}
    </form>
  );
});
