import axios from 'axios';
import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // Import from @react-oauth/google
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const ENDPOINTURL = import.meta.env.VITE_API_URL;

export function AuthenticationForm(props) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [type, toggle] = useToggle(['login', 'register']);
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;
  
    try {
      setLoading(true);
  
      // Send Google token to the backend
      const response = await axios.post(`${ENDPOINTURL}/api/auth/google`, {
        googleToken,
      });
  
      // Login the user with the response data
      await login(response.data.token, response.data.user);
  
      notifications.show({
        title: 'Success',
        message: 'Logged in with Google successfully',
        color: 'green',
      });
  
      // Navigate based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Google login failed',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Google Login error callback
  const handleGoogleLoginFailure = (error) => {
    notifications.show({
      title: 'Error',
      message: 'Google login failed. Please try again.',
      color: 'red',
    });
    console.error('Google login failed:', error);
  };

  // Handle Login/Register
  const handleSubmit = async (values) => {
    try {
      console.log('Submitting values:', values); // Log the values
  
      // Map 'name' to 'username'
      const payload = {
        username: values.name,
        email: values.email,
        password: values.password,
        terms: values.terms
      };
  
      setLoading(true);
      const response = await axios.post(`${ENDPOINTURL}/api/auth/${type}`, payload);
  
      // Store auth data
      await login(response.data.token, response.data.user);
  
      notifications.show({
        title: 'Success',
        message: `${upperFirst(type)} successful`,
        color: 'green',
      });

      // Navigate based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `${upperFirst(type)} failed. Please try again.`,
        color: 'red',
      });
      console.error(`${upperFirst(type)} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="483866031895-tuupjfu7nnv8isj4fpbus8pleqhi3a26.apps.googleusercontent.com"> {/* Replace with your actual Client ID */}
      <Paper radius="md" p="xl" withBorder {...props}>
        <Text size="lg" fw={500}>
          Welcome to PurrfectMatch, {type} with
        </Text>

        <Group grow mb="md" mt="md">
          {/* Sign In with Google Button */}
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            render={(renderProps) => (
              <Button
                radius="xl"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                fullWidth
              >
                Google
              </Button>
            )}
          />
        </Group>

        <Divider label="Or continue with email" labelPosition="center" my="lg" />

        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Stack>
            {type === 'register' && (
              <TextInput
                label="Name"
                placeholder="Your name"
                value={form.values.name}
                onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                radius="md"
              />
            )}

            <TextInput
              required
              label="Email"
              placeholder="hello@example.com"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email && 'Invalid email'}
              radius="md"
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password && 'Password should include at least 6 characters'}
              radius="md"
            />

            {type === 'register' && (
              <Checkbox
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
              />
            )}
          </Stack>

          <Group justify="space-between" mt="xl">
            <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
              {type === 'register'
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </Anchor>
            <Button fullWidth mt="xl" type="submit" loading={loading}>
              {type === 'register' ? 'Register' : 'Login'}
            </Button>
          </Group>
        </form>
      </Paper>
    </GoogleOAuthProvider>
  );
}
