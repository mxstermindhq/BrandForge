import { permanentRedirect } from "next/navigation";

/** Legacy listing URL — unified marketplace is canonical. */
export default function ServicesIndexRedirect() {
  permanentRedirect("/marketplace");
}
