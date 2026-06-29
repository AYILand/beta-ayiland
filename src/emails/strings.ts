type Locale = "fr" | "en";

export type EmailKind = "received" | "selected" | "rejected";

export const COPY: Record<EmailKind, Record<Locale, {
  subject: string;
  preview: string;
  title: string;
  intro: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  signoff: string;
}>> = {
  received: {
    fr: {
      subject: "Ta candidature Ayiland est bien reçue 🚀",
      preview: "On a bien reçu ta candidature au programme beta.",
      title: "Candidature reçue !",
      intro: "Merci d'avoir postulé au programme beta d'Ayiland.",
      body: "Notre équipe va examiner ta candidature dans les 7 prochains jours. Si tu fais partie des 500 sélectionnés, tu recevras un e-mail avec ton accès. En attendant, partage l'aventure autour de toi — ça aide.",
      ctaLabel: "Visiter Ayiland",
      ctaUrl: "https://ayiland.app",
      signoff: "L'équipe Ayiland",
    },
    en: {
      subject: "Your Ayiland application is in 🚀",
      preview: "We received your beta application.",
      title: "Application received!",
      intro: "Thanks for applying to Ayiland's beta program.",
      body: "Our team will review your application within 7 days. If you're among the 500 selected, you'll get an email with your access. In the meantime, share the adventure with your network — it helps.",
      ctaLabel: "Visit Ayiland",
      ctaUrl: "https://ayiland.app",
      signoff: "The Ayiland team",
    },
  },
  selected: {
    fr: {
      subject: "🎉 Bienvenue dans la beta Ayiland",
      preview: "Tu as été sélectionné·e pour la beta.",
      title: "Tu es dans !",
      intro: "Félicitations — tu fais partie des 500 premiers utilisateurs d'Ayiland.",
      body: "Tu peux dès maintenant accéder à la plateforme. On compte sur ton feedback pour façonner le produit. N'hésite pas à nous écrire si tu rencontres un souci ou si tu as des idées.",
      ctaLabel: "Accéder à Ayiland",
      ctaUrl: "https://ayiland.app",
      signoff: "L'équipe Ayiland",
    },
    en: {
      subject: "🎉 Welcome to Ayiland beta",
      preview: "You've been selected for the beta.",
      title: "You're in!",
      intro: "Congrats — you're among the first 500 Ayiland users.",
      body: "You can access the platform right now. We're counting on your feedback to shape the product. Write to us anytime if you hit an issue or have ideas.",
      ctaLabel: "Open Ayiland",
      ctaUrl: "https://ayiland.app",
      signoff: "The Ayiland team",
    },
  },
  rejected: {
    fr: {
      subject: "Programme beta Ayiland — suite de ta candidature",
      preview: "Réponse à ta candidature.",
      title: "Merci pour ta candidature",
      intro: "On a étudié ton dossier avec attention.",
      body: "Cette fois-ci, on n'a pas pu te retenir pour cette première vague de 500 places. Ce n'est qu'un au revoir : on ouvrira d'autres cohortes très bientôt et tu seras parmi les premiers notifiés. Continue de nous suivre sur LinkedIn et X.",
      ctaLabel: "Suivre Ayitech sur LinkedIn",
      ctaUrl: "https://www.linkedin.com/company/ayitech",
      signoff: "L'équipe Ayiland",
    },
    en: {
      subject: "Ayiland beta — application update",
      preview: "Update on your application.",
      title: "Thanks for applying",
      intro: "We reviewed your application carefully.",
      body: "This time we couldn't include you in the first 500-spot wave. It's only a 'see you soon': we'll open more cohorts very soon and you'll be among the first notified. Keep following us on LinkedIn and X.",
      ctaLabel: "Follow Ayitech on LinkedIn",
      ctaUrl: "https://www.linkedin.com/company/ayitech",
      signoff: "The Ayiland team",
    },
  },
};
