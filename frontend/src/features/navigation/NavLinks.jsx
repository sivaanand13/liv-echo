import { useContext } from "react";
import NavBarLink from "./NavBarLink";
import { AuthContext } from "../../contexts/AuthContext";
import SignOutButton from "../auth/SignOut";
function AuthNavigation() {
  const auth = useContext(AuthContext);
  return (
    <>
      <NavBarLink to="/dms">Direct Messages</NavBarLink>
      <NavBarLink to="/group-chats">Group Chats</NavBarLink>
      <NavBarLink to="/account">Account</NavBarLink>
      <NavBarLink to="/users/search">Search Users </NavBarLink>
      <NavBarLink to="/posts">Feed</NavBarLink>
      <NavBarLink to="/posts/create">Create Post</NavBarLink>
      <NavBarLink to="/posts/search">Search Post</NavBarLink>
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
