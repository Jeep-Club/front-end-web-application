import { getSchema } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { EditorState, TextSelection } from '@tiptap/pm/state';
import { wrapInList } from '@tiptap/pm/schema-list';
import { isolateListSelection } from '@/utils/publications/listSelection';

const schema = getSchema([StarterKit]);
const text = (value: string) => schema.text(value);
const paragraph = (...content: ReturnType<typeof text>[]) => schema.nodes.paragraph.create(null, content);

function applyList(doc: ReturnType<typeof schema.nodeFromJSON>, from: number, to: number, type = 'bulletList') {
    let state = EditorState.create({ schema, doc, selection: TextSelection.create(doc, from, to) });
    const tr = state.tr;
    isolateListSelection(tr);
    state = state.apply(tr);
    expect(wrapInList(schema.nodes[type])(state, transaction => { state = state.apply(transaction); })).toBe(true);
    return state.doc.toJSON();
}

it.each(['bulletList', 'orderedList'])('formats only selected text inside a paragraph as %s', type => {
    const doc = schema.nodes.doc.create(null, [paragraph(text('antes meio depois'))]);
    const result = applyList(doc, 7, 11, type);
    expect(result.content.map((node: { type: string }) => node.type)).toEqual(['paragraph', type, 'paragraph']);
    expect(result.content[0].content[0].text).toBe('antes ');
    expect(result.content[1].content[0].content[0].content[0].text).toBe('meio');
    expect(result.content[2].content[0].text).toBe(' depois');
});

it('keeps paragraphs outside the selection unchanged', () => {
    const doc = schema.nodes.doc.create(null, [paragraph(text('antes')), paragraph(text('meio')), paragraph(text('depois'))]);
    const result = applyList(doc, 8, 12);
    expect(result.content.map((node: { type: string }) => node.type)).toEqual(['paragraph', 'bulletList', 'paragraph']);
});

it('turns selected Shift+Enter lines into separate list items', () => {
    const doc = schema.nodes.doc.create(null, [paragraph(text('antes '), schema.nodes.hardBreak.create(), text('um'), schema.nodes.hardBreak.create(), text('dois'), schema.nodes.hardBreak.create(), text(' depois'))]);
    const result = applyList(doc, 8, 15);
    const list = result.content.find((node: { type: string }) => node.type === 'bulletList');
    expect(list.content).toHaveLength(2);
    expect(list.content.map((item: { content: { content: { text: string }[] }[] }) => item.content[0].content[0].text)).toEqual(['um', 'dois']);
    expect(result.content[0].type).toBe('paragraph');
    expect(result.content.at(-1).type).toBe('paragraph');
});

it('keeps inline formatting on the selected text', () => {
    const strong = schema.text('meio', [schema.marks.bold.create()]);
    const doc = schema.nodes.doc.create(null, [paragraph(text('antes '), strong, text(' depois'))]);
    const result = applyList(doc, 7, 11);
    expect(result.content[1].content[0].content[0].content[0].marks).toEqual([{ type: 'bold' }]);
});

it('leaves the document and cursor unchanged when no text is selected', () => {
    const doc = schema.nodes.doc.create(null, [paragraph(text('texto'))]);
    const tr = EditorState.create({ schema, doc, selection: TextSelection.create(doc, 3) }).tr;
    isolateListSelection(tr);
    expect(tr.doc.eq(doc)).toBe(true);
    expect(tr.selection.from).toBe(3);
});
