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
      maxWidth="full"
      position="sticky"
      className="hero-navbar"
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        wrapper: "max-w-7xl mx-auto px-4",
        content: "gap-6",
      }}
    >
      <NavbarContent className="sm:hidden nav-start" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>

      <NavbarContent justify="start" className="nav-start items-center">
        <NavbarBrand as={RouterLink} to="/" className="navbar-brand">
          <Image src="/logo.png" alt="StyleGPT" className="navbar-logo" radius="sm" />
          <p className="navbar-title">StyleGPT</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-10 nav-center" justify="center">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <NavbarItem key={item.path} isActive={active}>
              <Button
                as={RouterLink}
                to={item.path}
                variant={active ? "solid" : "light"}
                color={active ? "primary" : "default"}
                radius="full"
                size="sm"
                className="nav-pill"
              >
                {item.name}
              </Button>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent justify="end" className="items-center gap-4 nav-end">
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
            <Button
              as={RouterLink}
              to={item.path}
              variant={location.pathname === item.path ? "solid" : "flat"}
              color={location.pathname === item.path ? "primary" : "default"}
              radius="full"
              fullWidth
              className="nav-pill-menu"
              onPress={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Button>
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
