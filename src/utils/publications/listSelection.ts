import { TextSelection, type Transaction } from '@tiptap/pm/state';

/** Lists are block formatting: isolate selected text before wrapping its blocks. */
export function isolateListSelection(tr: Transaction): void {
    const { from, to, empty, $from, $to } = tr.selection;
    if (empty) return;
    const mapStart = tr.mapping.maps.length;
    const map = (position: number, bias = 1) => tr.mapping.slice(mapStart).map(position, bias);
    const canSplit = (parent: typeof $from.parent) => parent.type.name === 'paragraph' || parent.type.name === 'heading';
    const breaks: number[] = [];
    tr.doc.nodesBetween(from, to, (node, position, parent) => {
        if (node.type.name === 'hardBreak' && position >= from && position < to && parent && canSplit(parent)) breaks.push(position);
    });

    // Work from the end so surrounding content keeps its original order and marks.
    if (canSplit($to.parent) && $to.parentOffset > 0 && $to.parentOffset < $to.parent.content.size) tr.split(to);
    if (canSplit($from.parent) && $from.parentOffset > 0 && $from.parentOffset < $from.parent.content.size) tr.split(map(from));
    for (const position of breaks.reverse()) {
        const mapped = map(position);
        tr.delete(mapped, mapped + 1);
        tr.split(mapped);
    }
    tr.setSelection(TextSelection.create(tr.doc, map(from), map(to, -1)));
}
