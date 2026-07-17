"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AtlasErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <p className="text-sm font-medium text-destructive">
            The atlas graph crashed while rendering
          </p>
          <pre className="max-w-2xl overflow-auto rounded-lg border border-border bg-card p-4 text-left font-mono text-xs text-muted-foreground whitespace-pre-wrap">
            {this.state.error.stack ?? this.state.error.message}
          </pre>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
