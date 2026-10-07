"use client";

import { useState } from "react";
import Dock, { type DockItemData } from "@/components/bits/Dock";
import { GAME_MODES } from "@/components/lobby/nav-config";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * The lobby's mode selector.
 *
 * Every mode is rendered as unavailable. This app reads a public stats API and
 * has no matchmaking backend, so a clickable "Play" would be a lie. Clicking a
 * mode explains why instead of silently doing nothing.
 */
export function ModeDock() {
  const [message, setMessage] = useState<string | null>(null);

  const items: DockItemData[] = GAME_MODES.map((mode) => ({
    icon: <mode.icon className="size-6" style={{ color: mode.accent }} />,
    label: <span className="text-[11px] font-semibold uppercase tracking-wider">{mode.label}</span>,
    onClick: () =>
      setMessage(
        `${mode.label} (${mode.blurb}) needs the official Mobile Legends client. This site reads stats only.`,
      ),
  }));

  return (
    <div className="relative">
      <div className="flex justify-center overflow-x-auto pb-1">
        <Dock
          items={items}
          className="pt-3"
          magnification={1.5}
          distance={110}
          panelHeight={64}
          baseItemSize={44}
          dockHeight={60}
        />
      </div>

      {message ? (
        <div className="mt-3 flex justify-center px-4">
          <EmptyState
            tone="quiet"
            title="Matchmaking lives in the game"
            description={message}
            action={
              <button
                type="button"
                onClick={() => setMessage(null)}
                className="text-[11px] font-semibold uppercase tracking-widest text-gold-400 underline-offset-4 hover:underline"
              >
                Dismiss
              </button>
            }
            className="max-w-lg"
          />
        </div>
      ) : null}
    </div>
  );
}
