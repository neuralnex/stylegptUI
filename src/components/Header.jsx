import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  User,
  Link,
  Image,
} from "@heroui/react";
import { useAuth } from "../context/AuthContext";
import "./Header.scss";

const menuItems = [
  { name: "Upload Wardrobe", path: "/upload" },
  { name: "Wardrobe", path: "/wardrobe" },
  { name: "Blog", path: "/blog" },
];

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  return (
    <Navbar
      isBordered
      maxWidth="xl"
      position="sticky"
      className="hero-navbar"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>

      <NavbarContent justify="start">
        <NavbarBrand as={RouterLink} to="/">
          <Image src="/logo.png" alt="StyleGPT" className="navbar-logo" radius="sm" />
          <p className="navbar-title">StyleGPT</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.path} isActive={location.pathname === item.path}>
            <Link as={RouterLink} color="foreground" to={item.path}>
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="items-center gap-3">
        {isAuthenticated ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <User
                name={user?.name}
                description="View profile"
                avatarProps={{ src: user?.profilePicture }}
                as={RouterLink}
                to="/profile"
                className="navbar-user"
              />
            </NavbarItem>
            <NavbarItem>
              <Button
                as={RouterLink}
                to="/chat"
                color="primary"
                variant="solid"
                radius="full"
                size="md"
              >
                Chat
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button color="secondary" variant="flat" radius="full" onPress={logout}>
                Logout
              </Button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <Button
                as={RouterLink}
                to="/login"
                variant="bordered"
                radius="full"
              >
                Login
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={RouterLink}
                to="/register"
                color="primary"
                variant="solid"
                radius="full"
              >
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.path}>
            <Link
              as={RouterLink}
              color="foreground"
              className="w-full"
              to={item.path}
              size="lg"
              onPress={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        {isAuthenticated ? (
          <>
            <NavbarMenuItem>
              <Link as={RouterLink} to="/profile" color="foreground" size="lg" onPress={() => setIsMenuOpen(false)}>
                Profile
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                as={RouterLink}
                to="/chat"
                color="primary"
                variant="solid"
                radius="full"
                fullWidth
                onPress={() => setIsMenuOpen(false)}
              >
                Chat
              </Button>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button color="secondary" variant="flat" radius="full" fullWidth onPress={logout}>
                Logout
              </Button>
            </NavbarMenuItem>
          </>
        ) : (
          <>
            <NavbarMenuItem>
              <Button
                as={RouterLink}
                to="/login"
                variant="bordered"
                radius="full"
                fullWidth
                onPress={() => setIsMenuOpen(false)}
              >
                Login
              </Button>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                as={RouterLink}
                to="/register"
                color="primary"
                variant="solid"
                radius="full"
                fullWidth
                onPress={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Button>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
};

export default Header;
