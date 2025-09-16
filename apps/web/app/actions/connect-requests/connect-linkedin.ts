import { BASE_URL } from "@/lib/constants";
import { ServerActionResponse } from "@/app/types/server-action-response";

export const connectLinkedin = async (): Promise<
  ServerActionResponse<{ url: string }>
> => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: `${BASE_URL}/api/integrations/social/linkedin`,
    scope: "openid profile email w_member_social r_basicprofile ",
    state: Math.random().toString(36).substring(2, 15),
  });

  const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  return {
    ok: true,
    data: {
      url: redirectUrl,
    },
  };
};
