import { clsx } from "clsx";
import type { CSSProperties, ReactNode } from "react";
import { spot, useReveal } from "../lib/useReveal";

type Props = {
  title?: string;
  note?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  /** Removes body padding — for full-bleed SVG pictures. */
  flush?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Rendered under the body, outside the padded area. */
  footer?: ReactNode;
  labelledBy?: string;
};

/**
 * The Kairo card, sized for dashboard use: spotlight border on pointer, reveal
 * on scroll into view, and an optional header lockup.
 */
export function Panel({
  title,
  note,
  aside,
  children,
  flush,
  className,
  style,
  footer,
  labelledBy,
}: Props) {
  const { ref, shown } = useReveal<HTMLElement>();
  const headingId = labelledBy ?? (title ? `p-${title.replace(/\W+/g, "-").toLowerCase()}` : undefined);

  return (
    <section
      ref={ref}
      className={clsx("kr-card", "gs-panel", shown && "kr-in", className)}
      style={style}
      onPointerMove={spot}
      aria-labelledby={headingId}
    >
      {(title || aside) && (
        <div className="gs-panel-head">
          <div>
            {title && (
              <h2 className="gs-h2" id={headingId}>
                {title}
              </h2>
            )}
            {note && <p className="gs-sub">{note}</p>}
          </div>
          {aside}
        </div>
      )}
      <div className={flush ? "gs-panel-body gs-body--flush" : "gs-panel-body"}>
        {children}
      </div>
      {footer}
    </section>
  );
}
