"use client";

import { forwardRef, useRef } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";

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
      className="bg-[#0a0a0a] border-t border-zinc-800 shrink-0 px-4 py-3 md:px-6"
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
        <div className="relative flex-1">
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
            rows={1}
            className="w-full bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-500 min-h-[52px] max-h-[200px] resize-none rounded-2xl border border-zinc-800 px-4 py-3.5 pr-24 text-[15px] leading-relaxed outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all"
            autoComplete="off"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {canAttach ? (
              <button
                type="button"
                disabled={Boolean(uploadBusy || sending)}
                className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
                aria-label="Attach file"
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip size={18} />
              </button>
            ) : null}
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="bg-amber-500 text-black hover:bg-amber-400 flex h-9 w-9 items-center justify-center rounded-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
      {uploadBusy ? (
        <p className="text-zinc-500 mx-auto mt-2 max-w-[720px] text-center text-xs">Uploading attachment…</p>
      ) : null}
      {sendError ? (
        <p className="text-rose-400 mx-auto mt-2 max-w-[720px] text-center text-xs" role="alert">
          {sendError}
        </p>
      ) : null}
    </form>
  );
});
