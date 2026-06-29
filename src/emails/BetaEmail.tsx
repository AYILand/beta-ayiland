import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { COPY, type EmailKind } from "./strings";

interface BetaEmailProps {
  kind: EmailKind;
  locale: "fr" | "en";
  recipientHandle?: string;
}

const BRAND_BLUE = "#1E5BA8";
const BRAND_GREEN = "#2A9D6F";
const LOGO_URL = "https://ayiland.app/logo-ayiland.png";

export function BetaEmail({ kind, locale, recipientHandle }: BetaEmailProps) {
  const t = COPY[kind][locale];
  const greeting = recipientHandle
    ? locale === "fr"
      ? `Salut ${recipientHandle},`
      : `Hi ${recipientHandle},`
    : locale === "fr"
    ? "Salut,"
    : "Hi,";

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body
        style={{
          background: "#f0f7ff",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          padding: "32px 16px",
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            background: "#ffffff",
            borderRadius: 16,
            padding: 32,
            border: "1px solid rgba(30,91,168,0.12)",
            margin: "0 auto",
          }}
        >
          <Section style={{ textAlign: "center", marginBottom: 24 }}>
            <Img src={LOGO_URL} alt="Ayiland" width={64} height={64} style={{ display: "inline-block" }} />
          </Section>

          <Heading
            style={{
              fontSize: 26,
              fontWeight: 500,
              textAlign: "center",
              margin: "0 0 16px",
              background: `linear-gradient(120deg, ${BRAND_BLUE}, ${BRAND_GREEN})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: BRAND_BLUE,
            }}
          >
            {t.title}
          </Heading>

          <Text style={{ fontSize: 15, color: "#5A7088", textAlign: "center", margin: "0 0 24px" }}>
            {t.intro}
          </Text>

          <Text style={{ fontSize: 15, color: "#0F1F33", lineHeight: 1.6, margin: "0 0 24px" }}>
            {greeting}
          </Text>

          <Text style={{ fontSize: 15, color: "#0F1F33", lineHeight: 1.7, margin: "0 0 28px" }}>
            {t.body}
          </Text>

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button
              href={t.ctaUrl}
              style={{
                background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_GREEN})`,
                color: "#ffffff",
                padding: "14px 28px",
                borderRadius: 12,
                fontWeight: 500,
                fontSize: 14,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              {t.ctaLabel}
            </Button>
          </Section>

          <Text style={{ fontSize: 13, color: "#5A7088", margin: "24px 0 4px" }}>{t.signoff}</Text>
          <Text style={{ fontSize: 11, color: "#9AAEC4", margin: 0 }}>
            ayiland.app · contact@ayiland.app
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
