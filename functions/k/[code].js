// छोटा लिंक: deshkaal.xyz/k/26100501 → /lekh/2026-10-05-01/
export function onRequestGet({ params, request }) {
  const m = /^(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(params.code || "");
  const to = m ? `/lekh/20${m[1]}-${m[2]}-${m[3]}-${m[4]}/` : "/";
  return Response.redirect(new URL(to, request.url), 301);
}
