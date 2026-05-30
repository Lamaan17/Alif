import { redirect } from "next/navigation";

// /map merged into /pulse — keep the URL working so old links don't 404.
export default function MapRedirect() {
  redirect("/pulse#map");
}
