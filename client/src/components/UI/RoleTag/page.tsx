export enum Role {
  Athlete = "Athlete",
  Coach = "Coach",
  Prospect = "Prospect",
  Alumni = "Alumni"
}

export function RoleTag({ role }: { role: Role }) {
    if (role === "Coach") {
      return (
        <div className="inline-flex items-center rounded-md bg-green-50/5 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600">
          Coach
        </div>
      );
    }
  
    if (role === "Athlete") {
      return (
        <div className="inline-flex items-center rounded-md bg-amber-50/5 px-2 py-1 text-xs font-medium text-amber-600 ring-1 ring-inset ring-amber-600">
          Athlete
        </div>
      );
    }
  
    if (role === "Prospect") {
      return (
        <div className="inline-flex items-center rounded-md bg-blue-50/5 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-600">
          Prospect
        </div>
      );
    }
  
    if (role === "Alumni") {
      return (
        <div className="inline-flex items-center rounded-md bg-pink-50/5 px-2 py-1 text-xs font-medium text-pink-600 ring-1 ring-inset ring-pink-600">
          Alumni
        </div>
      );
    }
  
    return null;
  }