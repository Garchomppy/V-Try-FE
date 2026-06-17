import { describe, it, expect } from "vitest";
import { mapRowToProfile, type ProfileRow } from "@/lib/db/profiles";

describe("mapRowToProfile", () => {
  it("maps snake_case row to camelCase Profile", () => {
    const row: ProfileRow = {
      id: "user-1",
      full_name: "Nam Nguyen",
      phone: "0901234567",
      address: "123 Le Loi, HCM",
      created_at: "2026-06-18T00:00:00Z",
    };
    const profile = mapRowToProfile(row);
    expect(profile).toEqual({
      id: "user-1",
      fullName: "Nam Nguyen",
      phone: "0901234567",
      address: "123 Le Loi, HCM",
    });
  });

  it("handles null fields", () => {
    const row: ProfileRow = {
      id: "user-2",
      full_name: null,
      phone: null,
      address: null,
      created_at: "2026-06-18T00:00:00Z",
    };
    const profile = mapRowToProfile(row);
    expect(profile.fullName).toBeNull();
    expect(profile.phone).toBeNull();
    expect(profile.address).toBeNull();
  });
});
