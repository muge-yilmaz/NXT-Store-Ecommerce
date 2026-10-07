// A: getManagementToken
async function getManagementToken() {

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error("Management API credentials are empty in environmental variables.");
  }


  // 1. Auth0 Management fetch for getting a temporary access token (M2M)
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,                     // Bizim yeni M2M ID'miz
      client_secret: clientSecret,             // Bizim yeni M2M şifremiz
      audience: `https://${domain}/api/v2/`,   // "Ben Management API v2'yi kullanmak istiyorum" diyoruz
      grant_type: "client_credentials",        // M2M uygulamaları için standart protokol tipi
    }),
  });


  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Auth0 Token Error: ${data.error_description || data.error}`);
  }
  return data.access_token;   // 2. Return the access token to be used in the next request to update the user profile
}


// B: updateAuth0UserProfile
// 1. This function updates the user's profile in Auth0 using the Management API. It requires a valid access token obtained from getManagementToken.
export async function updateAuth0UserProfile(userId: string, updatedData: { name?: string; email?: string }) {
  const domain = process.env.AUTH0_DOMAIN;
  const token = await getManagementToken();

  // 2. Make a PATCH request to the Auth0 Management API to update the user's profile
  const response = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,    // 3. Use the access token in the Authorization header
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),   // 4. Send the updated data (name and/or email) in the request body
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Auth0 Update Error: ${data.message || "Unknown error"}`);
  }
  return data;
}