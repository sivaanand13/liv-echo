import { useContext } from "react";
import NavBarLink from "./NavBarLink";
import { AuthContext } from "../../contexts/AuthContext";
import SignOutButton from "../auth/SignOut";
function AuthNavigation() {
  return (
    <>
      <NavBarLink to="/account">Account</NavBarLink>
      <SignOutButton />
    </>
  );
}

function NonAuthNavigation() {
  return (
    <>
      <NavBarLink to="/signup">Sign Up</NavBarLink>
      <NavBarLink to="/signin">Sign In</NavBarLink>
    </>
  );
}

function NavBarLinks() {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  if (currentUser) {
    return <AuthNavigation />;
  } else {
    return <NonAuthNavigation />;
  }
}
export default NavBarLinks;
