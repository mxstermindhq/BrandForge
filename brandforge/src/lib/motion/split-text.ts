const ORIGINAL_HTML = "data-bf-original-html";

export type SplitResult = {
  chars: HTMLSpanElement[];
  words: HTMLSpanElement[];
  lines: HTMLSpanElement[];
  revert: () => void;
};

function storeOriginal(element: HTMLElement): string {
  const existing = element.getAttribute(ORIGINAL_HTML);
  if (existing) return existing;
  const html = element.innerHTML;
  element.setAttribute(ORIGINAL_HTML, html);
  return html;
}

function revertElement(element: HTMLElement): void {
  const html = element.getAttribute(ORIGINAL_HTML);
  if (html == null) return;
  element.innerHTML = html;
  element.removeAttribute(ORIGINAL_HTML);
}

/** Wrap each character in an inline-block span — GPU-friendly transform target. */
export function splitIntoChars(container: HTMLElement): HTMLSpanElement[] {
  storeOriginal(container);

  const chars: HTMLSpanElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue && node.nodeValue.length > 0) {
      textNodes.push(node as Text);
    }
    node = walker.nextNode();
  }

  for (const textNode of textNodes) {
    const parent = textNode.parentElement;
    const value = textNode.nodeValue ?? "";
    if (!parent || value.length === 0) continue;

    const fragment = document.createDocumentFragment();
    for (const char of value) {
      const span = document.createElement("span");
      span.className = "bf-char";
      span.setAttribute("data-bf-char", "");
      span.style.display = "inline-block";
      span.style.willChange = "transform, opacity";
      span.textContent = char === " " ? "\u00A0" : char;
      fragment.appendChild(span);
      chars.push(span);
    }

    parent.replaceChild(fragment, textNode);
  }

  return chars;
}

/** Wrap each word in clip-mask + inner span for vertical reveal. */
export function splitIntoWords(container: HTMLElement): HTMLSpanElement[] {
  storeOriginal(container);

  const text = container.textContent ?? "";
  container.textContent = "";

  const inners: HTMLSpanElement[] = [];
  const parts = text.split(/(\s+)/);

  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      container.appendChild(document.createTextNode(" "));
      continue;
    }

    const mask = document.createElement("span");
    mask.className = "bf-word-mask";
    mask.setAttribute("data-bf-word-mask", "");
    mask.style.display = "inline-block";
    mask.style.overflow = "hidden";
    mask.style.verticalAlign = "top";

    const inner = document.createElement("span");
    inner.className = "bf-word-inner";
    inner.setAttribute("data-bf-word-inner", "");
    inner.style.display = "inline-block";
    inner.style.willChange = "transform, opacity";
    inner.textContent = part;

    mask.appendChild(inner);
    container.appendChild(mask);
    inners.push(inner);
  }

  return inners;
}

/** Wrap each [data-bf-line] block in a clip mask for line wipe. */
export function splitIntoLines(container: HTMLElement): HTMLSpanElement[] {
  storeOriginal(container);

  const lineNodes = Array.from(container.querySelectorAll<HTMLElement>("[data-bf-line]"));
  const inners: HTMLSpanElement[] = [];

  if (lineNodes.length === 0) {
    const mask = document.createElement("span");
    mask.className = "bf-line-mask";
    mask.setAttribute("data-bf-line-mask", "");
    mask.style.display = "block";
    mask.style.overflow = "hidden";

    const inner = document.createElement("span");
    inner.className = "bf-line-inner";
    inner.setAttribute("data-bf-line-inner", "");
    inner.style.display = "block";
    inner.style.willChange = "transform, opacity";

    while (container.firstChild) {
      inner.appendChild(container.firstChild);
    }

    mask.appendChild(inner);
    container.appendChild(mask);
    inners.push(inner);
    return inners;
  }

  for (const line of lineNodes) {
    const mask = document.createElement("span");
    mask.className = "bf-line-mask";
    mask.setAttribute("data-bf-line-mask", "");
    mask.style.display = "block";
    mask.style.overflow = "hidden";

    const inner = document.createElement("span");
    inner.className = "bf-line-inner";
    inner.setAttribute("data-bf-line-inner", "");
    inner.style.display = "block";
    inner.style.willChange = "transform, opacity";

    while (line.firstChild) {
      inner.appendChild(line.firstChild);
    }

    mask.appendChild(inner);
    line.replaceWith(mask);
    inners.push(inner);
  }

  return inners;
}

export function revertSplit(container: HTMLElement): void {
  revertElement(container);
}
