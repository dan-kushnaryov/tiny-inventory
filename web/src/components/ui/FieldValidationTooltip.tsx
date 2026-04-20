import * as Tooltip from '@radix-ui/react-tooltip';
import type { ReactElement } from 'react';

export type FieldValidationTooltipProps = {
  /** When non-empty, tooltip is shown above the trigger (controlled). */
  message: string | null | undefined;
  children: ReactElement;
};

/**
 * Field validation as a floating tooltip above the control.
 * Uses Radix Tooltip (WAI-ARIA tooltip pattern): https://www.radix-ui.com/primitives/docs/components/tooltip
 */
export function FieldValidationTooltip({
  message,
  children,
}: FieldValidationTooltipProps) {
  const text = message?.trim() ? message : null;
  const open = Boolean(text);

  return (
    <Tooltip.Root open={open} onOpenChange={() => {}} delayDuration={0}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="validation-tooltip-content"
          side="top"
          sideOffset={6}
          collisionPadding={8}
        >
          {text}
          <Tooltip.Arrow className="validation-tooltip-arrow" height={5} width={10} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
