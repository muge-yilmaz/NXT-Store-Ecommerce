import {
  AppRole,
  Auth0SessionUser,
  getRolesFromUser,
  hasRole,
  isAdmin,
  getSessionUser,
  requireUser,
  requireAdmin,
  getAdmin,
  requireUserOr401,
  requireAdminOr403,
} from "../lib/auth0-utils";
import { auth0 } from "../lib/auth0";
import { redirect } from "next/navigation";

jest.mock("../lib/auth0", () => ({
  auth0: {
    getSession: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const ROLES_CLAIM = "https://ecom-nextjs-project/roles";

function userWithRoles(roles: unknown): Auth0SessionUser {
  return {
    sub: "auth0|1234567890",
    [ROLES_CLAIM]: roles,
  };
}

describe("Auth0 Utils Test Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("hasRole", () => {
    it("should return true if the user has the specified role", () => {
      expect(hasRole(userWithRoles(["admin"]), AppRole.ADMIN)).toBe(true);
    });

    it("should return false if the user does not have the specified role", () => {
      expect(
        hasRole(
          userWithRoles(["user", "moderator", "customer", "supplier", "seller", "super-admin"]),
          AppRole.ADMIN
        )
      ).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("should return true if the user has the admin role", () => {
      expect(isAdmin(userWithRoles(["admin"]))).toBe(true);
    });

    it("should return false if the user does not have the admin role", () => {
      expect(isAdmin(userWithRoles(["user"]))).toBe(false);
    });
  });

  describe("getRolesFromUser", () => {
    it("should return an empty array if user is null", () => {
      expect(getRolesFromUser(null)).toEqual([]);
    });

    it("should return the user's roles if they exist in namespace claim", () => {
      expect(getRolesFromUser(userWithRoles(["admin"]))).toEqual(["admin"]);
    });

    it("should correctly handle users with multiple roles in claim", () => {
      expect(getRolesFromUser(userWithRoles(["admin", "user"]))).toEqual(["admin", "user"]);
    });
  });

  describe("getSessionUser", () => {
    it("should return null when no session exists", async () => {
      (auth0.getSession as jest.Mock).mockResolvedValue(null);
      const user = await getSessionUser();
      expect(user).toBeNull();
    });

    it("should return user with normalized roles from session", async () => {
      (auth0.getSession as jest.Mock).mockResolvedValue({
        user: userWithRoles(["admin"]),
      });

      const user = await getSessionUser();
      expect(user).not.toBeNull();
      expect(isAdmin(user)).toBe(true);
    });
  });

  describe("Authentication & Authorization Access Control", () => {
    it("should redirect to login when requireUser is called without session", async () => {
      (auth0.getSession as jest.Mock).mockResolvedValue(null);
      await requireUser();
      expect(redirect).toHaveBeenCalledWith("/auth/login");
    });

    it("should return user when requireUser is called with valid session", async () => {
      const mockUser = userWithRoles(["user"]);
      (auth0.getSession as jest.Mock).mockResolvedValue({ user: mockUser });

      const user = await requireUser();
      expect(user).toBeDefined();
    });

    it("should redirect non-admin user when requireAdmin is called", async () => {
      (auth0.getSession as jest.Mock).mockResolvedValue({
        user: userWithRoles(["user"]),
      });

      await requireAdmin();
      expect(redirect).toHaveBeenCalledWith("/forbidden");
    });

    it("should return admin user when requireAdmin is called by admin", async () => {
      const mockAdmin = userWithRoles(["admin"]);
      (auth0.getSession as jest.Mock).mockResolvedValue({ user: mockAdmin });

      const user = await requireAdmin();
      expect(user).toBeDefined();
    });

    it("should return null from getAdmin when user is not admin", async () => {
      (auth0.getSession as jest.Mock).mockResolvedValue({
        user: userWithRoles(["user"]),
      });

      const admin = await getAdmin();
      expect(admin).toBeNull();
    });

    it("should throw an error in requireUserOr401 when no session exists", async () => {
      (auth0.getSession as jest.Mock).mockResolvedValue(null);
      await expect(requireUserOr401()).rejects.toThrow();
    });

    it("should throw an error in requireAdminOr403 when user is not admin", async () => {
      (auth0.getSession as jest.Mock).mockResolvedValue({
        user: userWithRoles(["user"]),
      });
      await expect(requireAdminOr403()).rejects.toThrow();
    });
  });
});