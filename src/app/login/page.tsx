import {redirect} from "next/navigation";

export default function Login() {
    redirect("/api/auth/login?post_login_redirect_url=/admin");
}