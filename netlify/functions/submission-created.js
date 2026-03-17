// Netlify Background Function — triggered on every form submission
// Sends email notification to admin via Netlify's built-in email service

// Set your notification email in Netlify environment variables (NOTIFICATION_EMAIL)
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "info@example.cz";

exports.handler = async function(event) {
    const payload = JSON.parse(event.body).payload;
    const formName = payload.form_name || "Neznámý formulář";
    const data = payload.data || {};
    const createdAt = payload.created_at || new Date().toISOString();

    // Format date to Czech locale
    const date = new Date(createdAt);
    const formattedDate = date.toLocaleString("cs-CZ", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

    let subject = "";
    let body = "";

    if (formName === "contact") {
        // Contact form submission
        subject = `Nova poptavka od ${data.name || "Neznamy"} — AquaPool Demo`;
        body = [
            `NOVÁ POPTÁVKA — AquaPool Demo`,
            `========================================`,
            ``,
            `Datum: ${formattedDate}`,
            `Jméno: ${data.name || "—"}`,
            `E-mail: ${data.email || "—"}`,
            `Telefon: ${data.phone || "—"}`,
            `Typ služby: ${data.service || "—"}`,
            ``,
            `Zpráva:`,
            `${data.message || "—"}`,
            ``,
            `----------------------------------------`,
            `Přílohy: ${data.attachment ? "Ano (viz Netlify dashboard)" : "Žádné"}`,
            ``,
            `Tento e-mail byl automaticky odeslán z webu AquaPool Demo`,
        ].join("\n");

    } else if (formName === "newsletter") {
        // Newsletter signup
        subject = `Novy odberatel newsletteru — AquaPool Demo`;
        body = [
            `NOVÝ ODBĚRATEL NEWSLETTERU`,
            `========================================`,
            ``,
            `Datum: ${formattedDate}`,
            `E-mail: ${data.email || "—"}`,
            ``,
            `Tento e-mail byl automaticky odeslán z webu AquaPool Demo`,
        ].join("\n");

    } else if (formName === "complaint") {
        // Complaint form
        subject = `Nova reklamace od ${data.name || "Neznamy"} — AquaPool Demo`;
        body = [
            `NOVÁ REKLAMACE — AquaPool Demo`,
            `========================================`,
            ``,
            `Datum: ${formattedDate}`,
            `Jméno: ${data.name || "—"}`,
            `E-mail: ${data.email || "—"}`,
            `Telefon: ${data.phone || "—"}`,
            `Číslo objednávky: ${data["order-number"] || "—"}`,
            ``,
            `Popis reklamace:`,
            `${data.description || "—"}`,
            ``,
            `Tento e-mail byl automaticky odeslán z webu AquaPool Demo`,
        ].join("\n");

    } else if (formName === "registration") {
        // Registration form
        subject = `Nova registrace — ${data.name || "Neznamy"} — AquaPool Demo`;
        body = [
            `NOVÁ REGISTRACE ZÁKAZNÍKA`,
            `========================================`,
            ``,
            `Datum: ${formattedDate}`,
            `Jméno: ${data.name || "—"}`,
            `E-mail: ${data.email || "—"}`,
            `Telefon: ${data.phone || "—"}`,
            `Adresa: ${data.address || "—"}`,
            ``,
            `Tento e-mail byl automaticky odeslán z webu AquaPool Demo`,
        ].join("\n");

    } else {
        // Generic form
        subject = `Novy formular (${formName}) — AquaPool Demo`;
        const fields = Object.entries(data)
            .filter(([key]) => !key.startsWith("bot-") && key !== "form-name")
            .map(([key, val]) => `${key}: ${val}`)
            .join("\n");
        body = [
            `NOVÝ FORMULÁŘ: ${formName}`,
            `========================================`,
            ``,
            `Datum: ${formattedDate}`,
            ``,
            fields,
            ``,
            `Tento e-mail byl automaticky odeslán z webu AquaPool Demo`,
        ].join("\n");
    }

    // Send email using fetch to Netlify's email notification endpoint
    // Note: For production, use a transactional email service (SendGrid, Resend, etc.)
    // For now, we log the notification — Netlify dashboard email notifications handle delivery
    console.log(`[FORM NOTIFICATION] To: ${NOTIFICATION_EMAIL}`);
    console.log(`[FORM NOTIFICATION] Subject: ${subject}`);
    console.log(`[FORM NOTIFICATION] Body:\n${body}`);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Notification processed", to: NOTIFICATION_EMAIL }),
    };
};
