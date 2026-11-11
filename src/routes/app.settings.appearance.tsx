import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { SettingsHeader, Section, Toggle, OptionCards } from "@/components/clinik/SettingsUI";
import { useAppearance } from "@/hooks/use-appearance";
import type { Density, FontSize, SidebarMode, Theme } from "@/lib/appearance";

export const Route = createFileRoute("/app/settings/appearance")({
  component: AppearanceSettings,
});

function AppearanceSettings() {
  const { appearance, update, reset } = useAppearance();

  return (
    <div className="max-w-4xl mx-auto px-12 py-14">
      <SettingsHeader
        title="Appearance"
        description="Adjust how the Rhea workspace looks and feels. Every change applies to the interface immediately."
      />

      <Section title="Theme" description="Choose a colour scheme, or follow your operating system.">
        <OptionCards<Theme>
          value={appearance.theme}
          onChange={(v) => update({ theme: v })}
          options={[
            {
              value: "light",
              label: "Light",
              description: "Bright surfaces, best in clinic lighting.",
            },
            {
              value: "dark",
              label: "Dark",
              description: "Low-light friendly for evening sessions.",
            },
            {
              value: "system",
              label: "System default",
              description: "Match your device setting automatically.",
            },
          ]}
        />
      </Section>

      <Section
        title="Density"
        description="Controls vertical spacing across lists, tables, and cards."
      >
        <OptionCards<Density>
          value={appearance.density}
          onChange={(v) => update({ density: v })}
          columns={2}
          options={[
            {
              value: "comfortable",
              label: "Comfortable",
              description: "Generous spacing, easier scanning.",
            },
            { value: "compact", label: "Compact", description: "More rows on screen at once." },
          ]}
        />
      </Section>

      <Section title="Navigation" description="Set the default state of the workspace sidebar.">
        <OptionCards<SidebarMode>
          value={appearance.sidebar}
          onChange={(v) => update({ sidebar: v })}
          columns={2}
          options={[
            { value: "expanded", label: "Expanded sidebar", description: "Show icons and labels." },
            {
              value: "collapsed",
              label: "Collapsed sidebar",
              description: "Icons only, more room for content.",
            },
          ]}
        />
      </Section>

      <Section
        title="Animations"
        description="Transitions and motion effects across the workspace."
      >
        <Toggle
          label="Reduce motion"
          description="Minimise animations and transitions throughout Rhea."
          checked={appearance.reduceMotion}
          onChange={(v) => update({ reduceMotion: v })}
        />
      </Section>

      <Section title="Accessibility" description="Text sizing and contrast preferences.">
        <div className="mb-4">
          <div className="text-[14px] text-muted-foreground mb-2">Font size</div>
          <OptionCards<FontSize>
            value={appearance.fontSize}
            onChange={(v) => update({ fontSize: v })}
            options={[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
          />
        </div>
        <Toggle
          label="High contrast mode"
          description="Stronger borders and text contrast for improved readability."
          checked={appearance.highContrast}
          onChange={(v) => update({ highContrast: v })}
        />
      </Section>

      <Section
        title="Live preview"
        description="A sample of workspace content rendered with your current settings."
      >
        <div className="rounded-xl hairline bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-medium">Today's schedule</div>
            <span className="text-[14px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              4 visits
            </span>
          </div>
          <div className="divide-y divide-border">
            {[
              ["09:00", "Maya Patel", "Follow-up"],
              ["09:30", "Daniel Reyes", "New patient"],
              ["10:15", "Aisha Khan", "Post-op review"],
            ].map(([t, n, r]) => (
              <div
                key={n}
                className={`flex items-center gap-3 ${appearance.density === "compact" ? "py-1.5" : "py-3"}`}
              >
                <span className="text-[14px] text-muted-foreground w-12">{t}</span>
                <span className="text-[14px] flex-1">{n}</span>
                <span className="text-[14px] text-muted-foreground">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            reset();
            toast.success("Appearance restored to defaults");
          }}
          className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restore defaults
        </button>
      </div>
    </div>
  );
}
