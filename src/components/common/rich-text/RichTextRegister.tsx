"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Code, Minus, Undo2, Redo2, RemoveFormatting, Link2, Unlink, Check, X } from "lucide-react";
import { publicationEditorHtml } from "@/utils/publications/content";
import { isolateListSelection } from "@/utils/publications/listSelection";
import styles from "./rich-text.module.css";

function Tool({ label, children, active = false, disabled = false, onClick }: {
    label: string; children: ReactNode; active?: boolean; disabled?: boolean; onClick: () => void;
}) {
    return <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={onClick}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-j-blue-800 disabled:cursor-not-allowed disabled:opacity-40 ${active ? "bg-j-blue-800 text-j-white" : "text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800"}`}>
        {children}
    </button>;
}

function Toolbar({ editor, disabled }: { editor: Editor; disabled: boolean }) {
    const [linkOpen, setLinkOpen] = useState(false);
    const [url, setUrl] = useState("");
    const [linkError, setLinkError] = useState("");
    const id = useId();
    const state = useEditorState({ editor, selector: ({ editor }) => ({
        bold: editor.isActive("bold"), italic: editor.isActive("italic"), underline: editor.isActive("underline"),
        strike: editor.isActive("strike"), bulletList: editor.isActive("bulletList"), orderedList: editor.isActive("orderedList"),
        blockquote: editor.isActive("blockquote"), codeBlock: editor.isActive("codeBlock"), link: editor.isActive("link"),
        heading: [1,2,3,4,5].find((level) => editor.isActive("heading", { level })) ?? 0,
        undo: editor.can().undo(), redo: editor.can().redo(),
    }) });

    function applyLink() {
        const value = url.trim();
        try {
            const parsed = new URL(value);
            if (!["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) throw new Error();
            editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
            setLinkOpen(false);
            setLinkError("");
        } catch { setLinkError("Informe um link válido, começando com https://, http://, mailto: ou tel:."); }
    }

    function toggleList(type: 'bulletList' | 'orderedList') {
        const chain = editor.chain().focus().command(({ tr }) => {
            if (!editor.isActive('bulletList') && !editor.isActive('orderedList')) isolateListSelection(tr);
            return true;
        });
        if (type === 'bulletList') chain.toggleBulletList().run();
        else chain.toggleOrderedList().run();
    }

    return <div className="border-b border-j-gray-200 bg-j-gray-100/70 p-2">
        <div role="group" aria-label="Formatação do conteúdo" className="flex flex-wrap items-center gap-1">
            <select aria-label="Estilo do parágrafo" value={state.heading} disabled={disabled}
                className="!w-auto !rounded-lg !border-j-gray-200 !bg-j-white !px-2 !py-2 !pr-6 !text-xs !text-j-gray-700"
                onChange={(event) => {
                    const level = Number(event.target.value);
                    if (level === 0) editor.chain().focus().setParagraph().run();
                    else editor.chain().focus().setHeading({ level: level as 1|2|3|4|5 }).run();
                }}>
                <option value={0}>Parágrafo</option>
                {[1,2,3,4,5].map((level) => <option key={level} value={level}>Título H{level}</option>)}
            </select>
            <Tool label="Negrito (Ctrl+B)" active={state.bold} disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={17} /></Tool>
            <Tool label="Itálico (Ctrl+I)" active={state.italic} disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={17} /></Tool>
            <Tool label="Sublinhado (Ctrl+U)" active={state.underline} disabled={disabled} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={17} /></Tool>
            <Tool label="Tachado" active={state.strike} disabled={disabled} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={17} /></Tool>
            <span className="mx-1 h-6 w-px bg-j-gray-200" aria-hidden="true" />
            <Tool label="Lista com marcadores" active={state.bulletList} disabled={disabled} onClick={() => toggleList('bulletList')}><List size={17} /></Tool>
            <Tool label="Lista numerada" active={state.orderedList} disabled={disabled} onClick={() => toggleList('orderedList')}><ListOrdered size={17} /></Tool>
            <Tool label="Citação" active={state.blockquote} disabled={disabled} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={17} /></Tool>
            <Tool label="Bloco de código" active={state.codeBlock} disabled={disabled} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code size={17} /></Tool>
            <Tool label="Linha divisória" disabled={disabled} onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={17} /></Tool>
            <Tool label="Inserir ou editar link" active={state.link} disabled={disabled} onClick={() => { setUrl(editor.getAttributes("link").href ?? ""); setLinkError(""); setLinkOpen(!linkOpen); }}><Link2 size={17} /></Tool>
            <Tool label="Remover link" disabled={disabled || !state.link} onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}><Unlink size={17} /></Tool>
            <span className="mx-1 h-6 w-px bg-j-gray-200" aria-hidden="true" />
            <Tool label="Desfazer (Ctrl+Z)" disabled={disabled || !state.undo} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={17} /></Tool>
            <Tool label="Refazer (Ctrl+Shift+Z)" disabled={disabled || !state.redo} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={17} /></Tool>
            <Tool label="Limpar formatação" disabled={disabled} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}><RemoveFormatting size={17} /></Tool>
        </div>
        {linkOpen && <div className="mt-2 border-t border-j-gray-200 pt-2">
            <label htmlFor={id} className="text-xs font-semibold text-j-gray-700">Endereço do link</label>
            <div className="mt-1 flex items-center gap-1">
                <input id={id} type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://exemplo.com" disabled={disabled} aria-invalid={!!linkError} aria-describedby={linkError ? `${id}-error` : undefined}
                    className="min-w-0 flex-1 rounded-lg border border-j-gray-200 bg-j-white px-3 py-2 text-sm text-j-gray-700" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyLink(); } }} />
                <Tool label="Aplicar link" disabled={disabled} onClick={applyLink}><Check size={17} /></Tool>
                <Tool label="Cancelar link" disabled={disabled} onClick={() => setLinkOpen(false)}><X size={17} /></Tool>
            </div>
            {linkError && <p id={`${id}-error`} className="mt-1 text-xs text-j-red-500">{linkError}</p>}
        </div>}
    </div>;
}

export function RichTextRegister({ name, label, required = false }: { name: string; label: string; required?: boolean }) {
    const id = useId();
    const { control, formState: { isSubmitting } } = useFormContext();
    const { field: { value: fieldValue, onChange, onBlur, ref: registerRef }, fieldState: { error } } = useController({ name, control, defaultValue: "" });
    const value = typeof fieldValue === "string" ? fieldValue : "";
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [StarterKit.configure({ heading: { levels: [1,2,3,4,5] }, link: { openOnClick: false, protocols: ["mailto", "tel"], HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } } })],
        content: publicationEditorHtml(value),
        editorProps: { attributes: { id, role: "textbox", "aria-multiline": "true", "aria-labelledby": `${id}-label`, "aria-required": String(required), class: styles.content } },
        onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
        onBlur: () => onBlur(),
    });

    useEffect(() => {
        if (!editor) return;
        registerRef(editor.view.dom);
        return () => registerRef(null);
    }, [editor, registerRef]);
    useEffect(() => { if (editor) editor.setEditable(!isSubmitting); }, [editor, isSubmitting]);
    useEffect(() => {
        if (!editor) return;
        const current = editor.isEmpty ? "" : editor.getHTML();
        if (current !== publicationEditorHtml(value)) editor.commands.setContent(publicationEditorHtml(value), { emitUpdate: false });
    }, [editor, value]);
    useEffect(() => {
        if (editor) editor.setOptions({ editorProps: { attributes: { id, role: "textbox", "aria-multiline": "true", "aria-labelledby": `${id}-label`, "aria-required": String(required), "aria-invalid": String(!!error), "aria-describedby": error ? `${id}-error` : `${id}-help`, class: styles.content } } });
    }, [editor, error, id, required]);

    return <div className="flex w-full min-w-0 flex-col gap-2">
        <label id={`${id}-label`} htmlFor={id} className="text-sm font-bold text-j-gray-700" onClick={() => editor?.commands.focus()}>{label}{required && <span className="text-j-red-500"> *</span>}</label>
        <div className={`overflow-hidden rounded-xl border-2 bg-j-white transition-colors ${error ? "border-j-red-300 focus-within:border-j-red-500" : "border-j-gray-200 focus-within:border-j-blue-700"}`}>
            {editor && <Toolbar editor={editor} disabled={isSubmitting} />}
            <EditorContent editor={editor} />
            {!editor && <p className="p-4 text-sm text-j-gray-500" role="status">Carregando editor...</p>}
        </div>
        <p id={`${id}-help`} className="text-xs text-j-gray-500">Selecione o texto para formatar. Use o menu Parágrafo para escolher títulos H1 a H5.</p>
        {error && <p id={`${id}-error`} role="alert" className="text-sm text-j-red-500">{error.message}</p>}
    </div>;
}
