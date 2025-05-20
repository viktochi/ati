import {
  SimpleForm,
  Create,
  required,
  TextInput,
  ReferenceInput,
  BooleanInput,
} from "react-admin";

export const ChallengeOptionCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="text" validate={[required()]} label="Text" />
        <BooleanInput
          source="correct"
          validate={[required()]}
          label="Correct Option"
        />

        <ReferenceInput source="challengeId" reference="challenges" />
        <TextInput source="imageSrc" label="Image Source" />
        <TextInput source="audioSrc" label="Audio Source" />
      </SimpleForm>
    </Create>
  );
};
