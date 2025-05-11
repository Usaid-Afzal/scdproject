import { useState, useEffect } from 'react';
import { Container, Grid, Card, Image, Text, Badge, Button, Group, Loader, Center, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { HeaderMegaMenu } from '../components/HeaderMegaMenu';
import { FooterCentered } from '../components/FooterCentered';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';

const ENDPOINTURL = import.meta.env.VITE_API_URL;

const FavoritesPage = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchFavorites = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`${ENDPOINTURL}/api/interactions/favorites`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          console.log('Favorites data:', data); // Debug log
          setFavorites(data.favorites || []);
        } catch (error) {
          console.error('Error fetching favorites:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to fetch favorites',
            color: 'red',
          });
        } finally {
          setLoading(false);
        }
      };
  
      fetchFavorites();
    }, []);

    return (
      <>
        <HeaderMegaMenu />
        <Container size="xl" py="xl">
          <Button
            leftIcon={<IconArrowLeft size={16} />}
            variant="subtle"
            onClick={() => navigate(-1)}
            mb="lg"
          >
            Back to Listings
          </Button>
          <Title order={1} mb="lg">
            Favorites
          </Title>
          {loading ? (
            <Center h={400}>
              <Loader size="xl" />
            </Center>
          ) : favorites.length === 0 ? (
            <Text align="center" size="lg" color="dimmed">
              No favorites found
            </Text>
          ) : (
            <Grid>
              {favorites.map((favorite) => {
                // Safely check for listing and images
                if (!favorite?.listing) return null;

                return (
                  <Grid.Col
                    key={favorite.listing._id}
                    span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                  >
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Card.Section>
                        {favorite.listing.images &&
                          favorite.listing.images[0] && (
                            <Image
                              src={favorite.listing.images[0]}
                              height={200}
                              alt={favorite.listing.title || "Listing image"}
                              fit="cover"
                            />
                          )}
                      </Card.Section>
                      <Group position="apart" mt="md" mb="xs">
                        <Text weight={500}>
                          {favorite.listing.title || "Untitled"}
                        </Text>
                        <Badge color="blue" variant="light">
                          ${favorite.listing.price || "0"}
                        </Badge>
                      </Group>
                      <Button
                        component="a"
                        href={`/listings/${favorite.listing._id}`}
                        variant="light"
                        color="blue"
                        fullWidth
                        mt="md"
                      >
                        View Details
                      </Button>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>
          )}
        </Container>
        <FooterCentered />
      </>
    );
    };

export default FavoritesPage;