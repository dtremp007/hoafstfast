import { useEditor, EditorContent, type EditorEvents } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type MarkdownEditorProps = {
    value: string;
    onChange: (value: string) => void;
}

const MarkdownEditor = (props: MarkdownEditorProps ) => {
    function handleChange({ editor }: EditorEvents["update"]) {
        props.onChange(editor.getHTML());
    }

    const editor = useEditor({
        extensions: [StarterKit],
        content: props.value,
        onUpdate: handleChange,
        editorProps: {
            attributes: {
                class:
                    "p-3 rounded-md border border-input bg-background prose dark:prose-invert prose-sm sm:prose-base max-w-none",
            },
        },
    });

    return <EditorContent editor={editor} />;
};

export default MarkdownEditor;
