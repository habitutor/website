import type { Editor } from "@tiptap/react";
import { useCallback, useState } from "react";
import { CornerDownLeftIcon } from "@/components/tiptap-icons/actions/corner-down-left-icon";
import { ImagePlusIcon } from "@/components/tiptap-icons/actions/image-plus-icon";
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button/button";
import { Button } from "@/components/tiptap-ui-primitive/button/button";
import { Card, CardBody, CardItemGroup } from "@/components/tiptap-ui-primitive/card/card";
import { Input, InputGroup } from "@/components/tiptap-ui-primitive/input/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tiptap-ui-primitive/popover/popover";
import { useTiptapEditor } from "@/hooks/editor/use-tiptap-editor";

export interface ImageLinkPopoverProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  onOpenChange?: (isOpen: boolean) => void;
}

export const ImageLinkButton = ({ ref, className, children, ...props }: ButtonProps) => {
  return (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label="Add image"
      tooltip="Add image"
      ref={ref}
      {...props}
    >
      {children || <ImagePlusIcon className="tiptap-button-icon" />}
    </Button>
  );
};

ImageLinkButton.displayName = "ImageLinkButton";

export const ImageLinkPopover = ({
  ref,
  editor: providedEditor,
  onClick,
  children,
  ...buttonProps
}: ImageLinkPopoverProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");

  const handleSetImage = useCallback(() => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url }).run();
      setUrl("");
      setIsOpen(false);
    }
  }, [editor, url]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSetImage();
    }
  };

  const handleToggleImagePopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      setIsOpen(!isOpen);
    },
    [onClick, isOpen],
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ImageLinkButton onClick={handleToggleImagePopover} {...buttonProps} ref={ref}>
          {children ?? <ImagePlusIcon className="tiptap-button-icon" />}
        </ImageLinkButton>
      </PopoverTrigger>

      <PopoverContent>
        <Card>
          <CardBody>
            <CardItemGroup orientation="horizontal">
              <InputGroup>
                <Input
                  type="url"
                  placeholder="Paste image URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </InputGroup>

              <Button type="button" onClick={handleSetImage} title="Add image" disabled={!url} data-style="ghost">
                <CornerDownLeftIcon className="tiptap-button-icon" />
              </Button>
            </CardItemGroup>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

ImageLinkPopover.displayName = "ImageLinkPopover";

export default ImageLinkPopover;
