import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/stores/settings-store";
import { THEMES } from "@/types/theme-mode";
import { SCALES } from "@/types/ui-scale";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";

interface UiPrefsFormProps {
  className?: string;
}

export function UiPrefsForm({ className }: UiPrefsFormProps) {
  const theme = useSettingsStore((s) => s.theme);
  const uiScale = useSettingsStore((s) => s.uiScale);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setUiScale = useSettingsStore((s) => s.setUiScale);
  return (
    <FieldSet className={className}>
      <FieldLegend>UI preferences</FieldLegend>
      <FieldDescription>
        <p>Lorem ipsum.</p>
      </FieldDescription>
      <FieldGroup />
      <FieldGroup>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel htmlFor="form-tanstack-select-language">
              Theme
            </FieldLabel>
          </FieldContent>
          <Select onValueChange={setTheme} value={theme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {THEMES.map((t) => (
                  <SelectItem key={t.code} value={t.code}>
                    <t.icon />
                    {t.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel htmlFor="select-uiscale">UI scale</FieldLabel>
            <FieldDescription>
              Controls the interface font size.
            </FieldDescription>
          </FieldContent>
          <Select
            name="select-uiscale"
            onValueChange={setUiScale}
            value={uiScale}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Interface scale" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SCALES.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
