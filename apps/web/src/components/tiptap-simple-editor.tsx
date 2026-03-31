import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";

interface TiptapSimpleEditorProps {
  content?: object;
  onChange?: (content: object) => void;
}

export default function TiptapSimpleEditor({ content, onChange }: TiptapSimpleEditorProps) {
  return <SimpleEditor content={content as object} onChange={onChange} />;
}
