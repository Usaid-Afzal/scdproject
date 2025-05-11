import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, TextInput, Button, Paper, Stack, Title, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { HeaderMegaMenu } from '../components/HeaderMegaMenu';
import { FooterCentered } from '../components/FooterCentered';

const ENDPOINTURL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${ENDPOINTURL}/api/auth/complete-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      login(localStorage.getItem('token'), data.user);

      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update profile',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <HeaderMegaMenu />
      <Container size="sm" py="xl">
        <Paper shadow="md" radius="md" p="xl" withBorder mx="auto" style={{ maxWidth: 400 }}>
          <LoadingOverlay visible={loading} overlayBlur={2} />
          <Title order={2} mb="xl">My Profile</Title>
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <TextInput
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                type="email"
              />
              <Button type="submit" loading={loading}>
                Update Profile
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
      <FooterCentered />
    </>
  );
};

export default ProfilePage;