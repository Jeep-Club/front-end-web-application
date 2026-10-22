/** Route Enter to the open vehicle modal even when no input has focus. */
export function handleVehicleModalEnter(event: KeyboardEvent, root: HTMLElement, proceed: () => void) {
    if (event.key !== 'Enter' || event.defaultPrevented || event.isComposing) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target as HTMLElement | null;
    const document = root.ownerDocument;
    if (!target || document.querySelector('dialog[open]')) return;
    const modal = root.closest('[data-modal-content]') ?? root;
    const noFocusedControl = target === document.body || target === document.documentElement;
    if (!noFocusedControl && !modal.contains(target)) return;
    // Keep the native action for buttons/links, except the current step tab.
    if (target.closest('a, textarea, [contenteditable="true"], input[type="file"]')) return;
    const button = target.closest('button');
    if (button && button.getAttribute('aria-current') !== 'step') return;
    event.preventDefault();
    if (!event.repeat) proceed();
}
