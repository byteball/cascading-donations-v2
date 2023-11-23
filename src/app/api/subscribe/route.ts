import appConfig from "@/appConfig";

const MAILER_LITE_SUBSCRIBE_API_URL = "https://api.mailerlite.com/api/v2/subscribers";

export async function POST(request: Request) {
  const req = await request.json();
  const email = req?.email || '';

  if (!email || typeof email !== 'string' || !email.includes("@") || !email.includes(".")) {
    return new Response(JSON.stringify({ error: 'Email isn\'t valid' }), {
      headers: { 'content-type': 'application/json' },
      status: 400
    })
  }

  if (!appConfig.MAILERLITE_API_KEY) {
    return new Response(JSON.stringify({ error: 'Not configured' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    })
  }

  try {
    const res = await fetch(MAILER_LITE_SUBSCRIBE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MailerLite-ApiKey': appConfig.MAILERLITE_API_KEY
      },
      body: JSON.stringify({
        email: String(email)
      }),
    });

    const resData = await res.json();

    return new Response(JSON.stringify(!resData.error ? { message: 'You are successfully subscribed' } : { error: resData.error.message, error_code: resData.error.code }), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unknown error' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    })
  }
}