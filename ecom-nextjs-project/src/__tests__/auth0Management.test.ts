import { updateAuth0UserProfile } from "@/lib/auth0Management";


describe('../lib/auth0Management.ts', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv,
      AUTH0_DOMAIN: 'test-domain.auth0.com',
      AUTH0_MANAGEMENT_CLIENT_ID: 'test-client-id',
      AUTH0_MANAGEMENT_CLIENT_SECRET: 'test-client-secret'
    }; 
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should get management token successfully', async () => {
    global.fetch = jest.fn().
      mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-access-token' }),
      } as Response).
      mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user_id: 'auth0|12345', name: 'Updated Name'}),
      } as Response);

      const result = await updateAuth0UserProfile('auth0|12345', { name: 'Updated Name' });
      expect(result).toEqual({ user_id: 'auth0|12345', name: 'Updated Name' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  
    it("should throw an error if Management API credentials are empty", async () => {
    delete process.env.AUTH0_DOMAIN;

    await expect(
      updateAuth0UserProfile("auth0|12345", { name: "Test" })
    ).rejects.toThrow("Management API credentials are empty");
  });
});