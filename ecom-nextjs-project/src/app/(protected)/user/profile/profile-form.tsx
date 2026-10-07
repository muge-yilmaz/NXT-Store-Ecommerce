"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateUserAddress, updateUserProfile } from "./actions";


interface ProfileFormProps {
  dbUser: {
    name: string | null;
    email: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    phone: string | null;
  };
}

export default function ProfileForm({ dbUser }: ProfileFormProps) {

  // The following function formats the phone number as the user types, ensuring it adheres to the desired format (e.g., 0555-444-33-22). It also handles cases where the user deletes characters, maintaining the correct format throughout.
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 4) {
      return numbers;
    }
    if (numbers.length <= 7) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    }
    if (numbers.length <= 9) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7)}`;
    }
    // Final format: 0555-444-33-22 (11 numbers + 3 dashes = 14 characters)
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`;
  };
  const onlyNumbers = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
  };


  const cleanEmailInput = (value: string) => {
    // Only allow lowercase letters, numbers, and specific symbols for email addresses
    return value.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
  };

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1 bg-muted rounded-xl">
        <TabsTrigger value="account" className="rounded-lg text-xs sm:text-sm font-medium">Account</TabsTrigger>
        <TabsTrigger value="address" className="rounded-lg text-xs sm:text-sm font-medium">Address</TabsTrigger>
      </TabsList>

      {/* Account Tab */}
      <TabsContent value="account" className="border border-border/80 rounded-2xl p-4 sm:p-6 bg-card shadow-sm">
        <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-foreground">My Information</h2>

        <form action={updateUserProfile} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={dbUser.name || ""}
              placeholder="Enter your name"
              required
              minLength={2}
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={dbUser.email || ""}
              placeholder="Enter your email"
              required
              // HTML5 email validation pattern to ensure a valid email format
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}"
              title="Please enter a valid email address (e.g. name@domain.com)"
              className="h-10 text-sm"
              onInput={(e) => {
                // Clean the email input to only allow valid characters for an email address
                e.currentTarget.value = cleanEmailInput(e.currentTarget.value);
              }}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit" variant="default" className="w-full sm:w-auto rounded-xl px-6 h-10"
              onClick={(e) => {
                // Check the form's validity before allowing the Next.js action to proceed
                const form = e.currentTarget.closest("form");
                if (form && !form.checkValidity()) {
                  e.preventDefault();
                  form.reportValidity();
                }
              }}
            >
              Update Information
            </Button>
          </div>
        </form>
      </TabsContent>

      {/* Address Tab */}
      <TabsContent value="address" className="border border-border/80 rounded-2xl p-4 sm:p-6 bg-card shadow-sm">
        <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-foreground">My Address</h2>

        <form action={updateUserAddress} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={dbUser.address || ""}
              placeholder="Enter your address"
              required
              className="h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={dbUser.city || ""}
                placeholder="Enter your city"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={dbUser.postalCode || ""}
                placeholder="e.g. 34000"
                required
                maxLength={5}
                className="h-10 text-sm"
                onInput={(e) => {
                  onlyNumbers(e);
                  if (e.currentTarget.value.length > 5) {
                    e.currentTarget.value = e.currentTarget.value.slice(0, 5); // 5 haneden fazlasını siler
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={dbUser.country || ""}
                placeholder="Enter your country"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={dbUser.phone || ""}
                placeholder="e.g. 0555-444-33-22"
                required
                maxLength={14}
                className="h-10 text-sm"
                onInput={(e) => {
                  onlyNumbers(e);
                  e.currentTarget.value = formatPhoneNumber(e.currentTarget.value);
                }}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit" variant="default" className="w-full sm:w-auto rounded-xl px-6 h-10"
              onClick={(e) => {
                const form = e.currentTarget.closest("form");
                if (form && !form.checkValidity()) {
                  e.preventDefault();
                  form.reportValidity();
                }
              }}
            >
              Update Address
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}