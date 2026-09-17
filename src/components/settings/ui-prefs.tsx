import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "../ui/field";

export function UiPrefsForm() {
  return (
    <FieldSet>
      <FieldLegend>UI preferences</FieldLegend>
      <FieldDescription>
        <p>Lorem ipsum.</p>
      </FieldDescription>
      <FieldGroup />
    </FieldSet>
  );
}
