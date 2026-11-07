import { redirect } from "next/navigation";

export default function Page() {
    redirect("/feed?type=EVENT");
}
