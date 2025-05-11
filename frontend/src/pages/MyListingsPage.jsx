import { useState, useEffect } from 'react';
import { Container, Grid, Card, Image, Text, Badge, Button, Group, Loader, Center, Title, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { HeaderMegaMenu } from '../components/HeaderMegaMenu';
import { FooterCentered } from '../components/FooterCentered';
import axios from 'axios';

const ENDPOINTURL = import.meta.env.VITE_API_URL;

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ opened: false, listingId: null });

  const fetchMyListings = async () => {
    try {
      const { data } = await axios.get(`${ENDPOINTURL}/api/listings/my-listings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setListings(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch your listings',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    try {
      await axios.delete(`${ENDPOINTURL}/api/listings/${listingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      notifications.show({
        title: 'Success',
        message: 'Listing deleted successfully',
        color: 'green',
      });
      
      // Refresh listings
      fetchMyListings();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete listing',
        color: 'red',
      });
    }
    setDeleteModal({ opened: false, listingId: null });
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  return (
    <>
      <HeaderMegaMenu />
      <Container size="xl" py="xl">
        <Title order={1} mb="xl">My Listings</Title>
        
        {loading ? (
          <Center h={400}>
            <Loader size="xl" />
          </Center>
        ) : listings.length === 0 ? (
          <Text align="center" size="lg" color="dimmed">
            You haven't created any listings yet
          </Text>
        ) : (
          <Grid>
            {listings.map((listing) => (
              <Grid.Col key={listing._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section>
                    {listing.images && listing.images[0] && (
                      <Image
                        src={listing.images[0]}
                        height={200}
                        alt={listing.title}
                        fit="cover"
                      />
                    )}
                  </Card.Section>

                  <Group position="apart" mt="md" mb="xs">
                    <Text weight={500}>{listing.title}</Text>
                    <Badge color="blue" variant="light">
                      ${listing.price}
                    </Badge>
                  </Group>

                  <Text size="sm" color="dimmed" mb="md">
                    Status: <Badge color={listing.status === 'approved' ? 'green' : 'yellow'}>
                      {listing.status}
                    </Badge>
                  </Text>

                  <Group position="apart">
                    <Button
                      component="a"
                      href={`/listings/${listing._id}`}
                      variant="light"
                      color="blue"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="light"
                      color="red"
                      onClick={() => setDeleteModal({ opened: true, listingId: listing._id })}
                      leftIcon={<IconTrash size={16} />}
                    >
                      Delete
                    </Button>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        <Modal
          opened={deleteModal.opened}
          onClose={() => setDeleteModal({ opened: false, listingId: null })}
          title="Confirm Deletion"
        >
          <Text>Are you sure you want to delete this listing? This action cannot be undone.</Text>
          <Group position="right" mt="md">
            <Button variant="light" onClick={() => setDeleteModal({ opened: false, listingId: null })}>
              Cancel
            </Button>
            <Button color="red" onClick={() => handleDelete(deleteModal.listingId)}>
              Delete
            </Button>
          </Group>
        </Modal>
      </Container>
      <FooterCentered />
    </>
  );
};

export default MyListingsPage;