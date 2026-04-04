import type { Node as PMNode } from "@tiptap/pm/model";
import { AllSelection, NodeSelection, Selection, TextSelection } from "@tiptap/pm/state";
import type { Transaction } from "@tiptap/pm/state";
import { CellSelection, cellAround } from "@tiptap/pm/tables";
import { type Editor, findParentNodeClosestToPos, type NodeWithPos } from "@tiptap/react";

export function focusNextNode(editor: Editor) {
  const { state, view } = editor;
  const { doc, selection } = state;

  const nextSel = Selection.findFrom(selection.$to, 1, true);
  if (nextSel) {
    view.dispatch(state.tr.setSelection(nextSel).scrollIntoView());
    return true;
  }

  const paragraphType = state.schema.nodes.paragraph;
  if (!paragraphType) {
    console.warn("No paragraph node type found in schema.");
    return false;
  }

  const end = doc.content.size;
  const para = paragraphType.create();
  let tr = state.tr.insert(end, para);
  const $inside = tr.doc.resolve(end + 1);
  tr = tr.setSelection(TextSelection.near($inside)).scrollIntoView();
  view.dispatch(tr);
  return true;
}

export function isValidPosition(pos: number | null | undefined): pos is number {
  return typeof pos === "number" && pos >= 0;
}

export function findNodeAtPosition(editor: Editor, position: number) {
  try {
    const node = editor.state.doc.nodeAt(position);
    if (!node) {
      console.warn(`No node found at position ${position}`);
      return null;
    }
    return node;
  } catch (error) {
    console.error(`Error getting node at position ${position}:`, error);
    return null;
  }
}

export function findNodePosition(props: {
  editor: Editor | null;
  node?: PMNode | null;
  nodePos?: number | null;
}): { pos: number; node: PMNode } | null {
  const { editor, node, nodePos } = props;

  if (!editor || !editor.state?.doc) return null;

  const hasValidNode = node !== undefined && node !== null;
  const hasValidPos = isValidPosition(nodePos);

  if (!hasValidNode && !hasValidPos) {
    return null;
  }

  if (hasValidNode) {
    let foundPos = -1;
    let foundNode: PMNode | null = null;

    editor.state.doc.descendants((currentNode, pos) => {
      if (currentNode === node) {
        foundPos = pos;
        foundNode = currentNode;
        return false;
      }
      return true;
    });

    if (foundPos !== -1 && foundNode !== null) {
      return { pos: foundPos, node: foundNode };
    }
  }

  if (hasValidPos) {
    const nodeAtPos = findNodeAtPosition(editor, nodePos);
    if (nodeAtPos) {
      return { pos: nodePos, node: nodeAtPos };
    }
  }

  return null;
}

export function isNodeTypeSelected(
  editor: Editor | null,
  nodeTypeNames: string[] = [],
  checkAncestorNodes = false,
): boolean {
  if (!editor || !editor.state.selection) return false;

  const { selection } = editor.state;
  if (selection.empty) return false;

  if (selection instanceof NodeSelection) {
    const selectedNode = selection.node;
    return selectedNode ? nodeTypeNames.includes(selectedNode.type.name) : false;
  }

  if (checkAncestorNodes) {
    const { $from } = selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const ancestorNode = $from.node(depth);
      if (nodeTypeNames.includes(ancestorNode.type.name)) {
        return true;
      }
    }
  }

  return false;
}

export function selectionWithinConvertibleTypes(editor: Editor, types: string[] = []): boolean {
  if (!editor || types.length === 0) return false;

  const { state } = editor;
  const { selection } = state;
  const allowed = new Set(types);

  if (selection instanceof NodeSelection) {
    const nodeType = selection.node?.type?.name;
    return !!nodeType && allowed.has(nodeType);
  }

  if (selection instanceof TextSelection || selection instanceof AllSelection) {
    let valid = true;
    state.doc.nodesBetween(selection.from, selection.to, (node) => {
      if (node.isTextblock && !allowed.has(node.type.name)) {
        valid = false;
        return false;
      }
      return valid;
    });
    return valid;
  }

  return false;
}

export function updateNodesAttr<A extends string = string, V = unknown>(
  tr: Transaction,
  targets: readonly NodeWithPos[],
  attrName: A,
  next: V | ((prev: V | undefined) => V | undefined),
): boolean {
  if (!targets.length) return false;

  let changed = false;

  for (const { pos } of targets) {
    const currentNode = tr.doc.nodeAt(pos);
    if (!currentNode) continue;

    const prevValue = (currentNode.attrs as Record<string, unknown>)[attrName] as V | undefined;
    const resolvedNext = typeof next === "function" ? (next as (p: V | undefined) => V | undefined)(prevValue) : next;

    if (prevValue === resolvedNext) continue;

    const nextAttrs: Record<string, unknown> = { ...currentNode.attrs };
    if (resolvedNext === undefined) {
      delete nextAttrs[attrName];
    } else {
      nextAttrs[attrName] = resolvedNext;
    }

    tr.setNodeMarkup(pos, undefined, nextAttrs);
    changed = true;
  }

  return changed;
}

export function selectCurrentBlockContent(editor: Editor) {
  const { selection, doc } = editor.state;

  if (!selection.empty) return;

  const $pos = selection.$from;
  let blockNode = null;
  let blockPos = -1;

  for (let depth = $pos.depth; depth >= 0; depth--) {
    const node = $pos.node(depth);
    const pos = $pos.start(depth);

    if (node.isBlock && node.textContent.trim()) {
      blockNode = node;
      blockPos = pos;
      break;
    }
  }

  if (blockNode && blockPos >= 0) {
    const from = blockPos;
    const to = blockPos + blockNode.nodeSize - 2;

    if (from < to) {
      const $from = doc.resolve(from);
      const $to = doc.resolve(to);
      const newSelection = TextSelection.between($from, $to, 1);

      if (newSelection && !selection.eq(newSelection)) {
        editor.view.dispatch(editor.state.tr.setSelection(newSelection));
      }
    }
  }
}

export function getSelectedNodesOfType(selection: Selection, allowedNodeTypes: string[]): NodeWithPos[] {
  const results: NodeWithPos[] = [];
  const allowed = new Set(allowedNodeTypes);

  if (selection instanceof CellSelection) {
    selection.forEachCell((node: PMNode, pos: number) => {
      if (allowed.has(node.type.name)) {
        results.push({ node, pos });
      }
    });
    return results;
  }

  if (selection instanceof NodeSelection) {
    const { node, from: pos } = selection;
    if (node && allowed.has(node.type.name)) {
      results.push({ node, pos });
    }
    return results;
  }

  const { $anchor } = selection;
  const cell = cellAround($anchor);

  if (cell) {
    const cellNode = selection.$anchor.doc.nodeAt(cell.pos);
    if (cellNode && allowed.has(cellNode.type.name)) {
      results.push({ node: cellNode, pos: cell.pos });
      return results;
    }
  }

  const parentNode = findParentNodeClosestToPos($anchor, (node) => allowed.has(node.type.name));

  if (parentNode) {
    results.push({ node: parentNode.node, pos: parentNode.pos });
  }

  return results;
}
