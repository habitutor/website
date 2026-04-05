import type { Editor } from "@tiptap/react";

export const isMarkInSchema = (markName: string, editor: Editor | null): boolean => {
  if (!editor?.schema) return false;
  return editor.schema.spec.marks.get(markName) !== undefined;
};

export const isNodeInSchema = (nodeName: string, editor: Editor | null): boolean => {
  if (!editor?.schema) return false;
  return editor.schema.spec.nodes.get(nodeName) !== undefined;
};

export function isExtensionAvailable(editor: Editor | null, extensionNames: string | string[]): boolean {
  if (!editor) return false;

  const names = Array.isArray(extensionNames) ? extensionNames : [extensionNames];
  const found = names.some((name) => editor.extensionManager.extensions.some((ext) => ext.name === name));

  if (!found) {
    console.warn(
      `None of the extensions [${names.join(", ")}] were found in the editor schema. Ensure they are included in the editor configuration.`,
    );
  }

  return found;
}
