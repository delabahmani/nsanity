interface EmailTemplateProps {
  firstName: string;
}

export default function EmailTemplate({ firstName }: EmailTemplateProps) {
  return (
    <div>
      <h1>welcome to nsanity, {firstName}</h1>
    </div>
  );
}
