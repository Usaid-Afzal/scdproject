import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import FAQ from "./pages/FAQ";
import Listings from "./pages/Listings";
import ListingDetails from "./pages/ListingDetails";
import Chat from "./pages/Chat";
import MyListingsPage from "./pages/MyListingsPage";
import Favorites from "./pages/FavoritesPage";
import { AuthProvider } from "./contexts/AuthContext";
import CreateListing from "./pages/CreateListing";
import AdminDashboard from "./pages/Dashboard";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

function App() {
  return (
    <MantineProvider>
      <ModalsProvider>
        <Notifications position="top-right" />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/" element={<Home />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<ListingDetails />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/my-listings" element={<MyListingsPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}
export default App;
