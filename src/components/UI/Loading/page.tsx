import { Spinner } from "@material-tailwind/react";

export default function Loading() {
  return <Spinner className="h-16 w-16" style={{ color: 'var(--button-bg)' }}/>;
}
